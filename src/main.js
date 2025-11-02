const form = document.getElementById('dice-form');
const countInput = document.getElementById('dice-count');
const diceContainer = document.getElementById('dice-container');
const rollButton = document.getElementById('roll-button');
const resultsList = document.getElementById('results-list');
const resultsTotal = document.getElementById('results-total');
const dieTemplate = document.getElementById('die-template');

const BASE_TILT = { x: -24, y: 32, z: 0 };

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

// Bootstrap with the default value so the user immediately sees dice.
createDice(Number(countInput.value));
