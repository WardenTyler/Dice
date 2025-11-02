const form = document.getElementById('dice-form');
const countInput = document.getElementById('dice-count');
const diceContainer = document.getElementById('dice-container');
const rollButton = document.getElementById('roll-button');
const resultsList = document.getElementById('results-list');
const resultsTotal = document.getElementById('results-total');
const dieTemplate = document.getElementById('die-template');

const AudioContextClass = window.AudioContext || window.webkitAudioContext;

let audioContext;

const BASE_TILT = { x: -34, y: 36, z: -6 };

const ORIENTATIONS = {
  1: { x: -90, y: 0, z: 0 },
  2: { x: 90, y: 0, z: 0 },
  3: { x: 0, y: -90, z: 0 },
  4: { x: 0, y: 90, z: 0 },
  5: { x: 0, y: 0, z: 0 },
  6: { x: 0, y: 180, z: 0 },
};

const dice = [];

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const requested = Number.parseInt(countInput.value, 10);
  const count = Number.isNaN(requested)
    ? 0
    : Math.min(Math.max(requested, Number(countInput.min)), Number(countInput.max));

  if (count <= 0) {
    clearDice();
    return;
  }

  createDice(count);
});

rollButton.addEventListener('click', rollDice);

function clearDice() {
  diceContainer.innerHTML = '';
  dice.length = 0;
  rollButton.disabled = true;
  resultsList.textContent = 'Add some dice to begin.';
  resultsTotal.textContent = '';
}

function createDice(count) {
  diceContainer.innerHTML = '';
  dice.length = 0;

  for (let i = 0; i < count; i += 1) {
    const die = instantiateDie();
    dice.push(die);
    diceContainer.appendChild(die.element);
  }

  rollButton.disabled = false;
  resultsList.textContent = 'Tap "Roll" to tumble the dice.';
  resultsTotal.textContent = '';
}

function instantiateDie() {
  const clone = dieTemplate.content.firstElementChild.cloneNode(true);
  const cube = clone.querySelector('.die__cube');
  setDieOrientation(cube, 1);
  return { element: clone, cube, value: 1 };
}

function rollDice() {
  if (!dice.length) {
    return;
  }

  playRollSound();

  rollButton.disabled = true;
  const rolledValues = [];
  let completed = 0;

  dice.forEach((die, index) => {
    const value = randomInt(1, 6);
    rolledValues[index] = value;
    die.value = value;
    const cube = die.cube;
    cube.dataset.value = String(value);

    const spins = {
      x: 360 * (Math.floor(Math.random() * 4) + 1),
      y: 360 * (Math.floor(Math.random() * 4) + 1),
      z: 360 * (Math.floor(Math.random() * 4) + 1),
    };

    cube.classList.add('is-rolling');

    requestAnimationFrame(() => {
      setDieOrientation(cube, value, spins);
    });

    const handleTransitionEnd = (event) => {
      if (event.propertyName !== 'transform') {
        return;
      }

      cube.classList.remove('is-rolling');
      cube.removeEventListener('transitionend', handleTransitionEnd);
      completed += 1;

      if (completed === dice.length) {
        updateResults(rolledValues);
        rollButton.disabled = false;
      }
    };

    cube.addEventListener('transitionend', handleTransitionEnd);
  });
}

function setDieOrientation(cube, value, spins = { x: 0, y: 0, z: 0 }) {
  const orientation = ORIENTATIONS[value];
  const x = orientation.x + BASE_TILT.x + spins.x;
  const y = orientation.y + BASE_TILT.y + spins.y;
  const z = orientation.z + BASE_TILT.z + spins.z;
  cube.style.transform = `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`;
}

function updateResults(values) {
  resultsList.innerHTML = '';
  const total = values.reduce((sum, value) => sum + value, 0);

  values.forEach((value, index) => {
    const chip = document.createElement('span');
    chip.className = 'results__chip';
    chip.innerHTML = `<span>${index + 1}</span> ${value}`;
    resultsList.appendChild(chip);
  });

  resultsTotal.textContent = `Total: ${total}`;
}

function randomInt(min, max) {
  const minValue = Math.ceil(min);
  const maxValue = Math.floor(max);
  return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
}

function getAudioContext() {
  if (!AudioContextClass) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }

  return audioContext;
}

function createNoiseBuffer(context, duration) {
  const length = Math.floor(duration * context.sampleRate);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < length; i += 1) {
    const progress = i / length;
    const envelope = Math.pow(1 - progress, 2);
    data[i] = (Math.random() * 2 - 1) * envelope;
  }

  return buffer;
}

function playRollSound() {
  const context = getAudioContext();

  if (!context) {
    return;
  }

  const now = context.currentTime;
  const master = context.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.connect(context.destination);

  master.gain.exponentialRampToValueAtTime(0.7, now + 0.05);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

  for (let i = 0; i < 4; i += 1) {
    const source = context.createBufferSource();
    source.buffer = createNoiseBuffer(context, 0.28);

    const filter = context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 1.6;
    filter.frequency.setValueAtTime(650 + Math.random() * 550, now + i * 0.07);

    const gain = context.createGain();
    const start = now + i * 0.08;

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.9, start + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.32);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start(start);
  }

  const finalSource = context.createBufferSource();
  finalSource.buffer = createNoiseBuffer(context, 0.18);
  const finalFilter = context.createBiquadFilter();
  finalFilter.type = 'lowpass';
  finalFilter.frequency.setValueAtTime(420, now + 0.35);

  const finalGain = context.createGain();
  const finalStart = now + 0.32;

  finalGain.gain.setValueAtTime(0.0001, finalStart);
  finalGain.gain.exponentialRampToValueAtTime(0.6, finalStart + 0.02);
  finalGain.gain.exponentialRampToValueAtTime(0.0001, finalStart + 0.28);

  finalSource.connect(finalFilter);
  finalFilter.connect(finalGain);
  finalGain.connect(master);
  finalSource.start(finalStart);

  setTimeout(() => {
    master.disconnect();
  }, 1500);
}

// Bootstrap with the default value so the user immediately sees dice.
createDice(Number(countInput.value));
