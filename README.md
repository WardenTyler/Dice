# Dice Roller 3D

A single-page web experience that lets you choose how many dice to play with,
shows fully 3D-styled models, and animates them when you roll. The application
uses modern CSS 3D transforms and vanilla JavaScript—no build tooling or
external dependencies required.

## Features

- Pick between **1 and 12 dice** and instantly see them appear on the virtual
  stage.
- Click **Roll** to trigger a lively animation where every die tumbles to a new
  face.
- Each roll displays individual results and the total so you can keep score.
- Responsive layout with high-contrast visuals suitable for desktop and mobile
  devices.

## Dice 3D model & roll experience

- The cube uses layered lighting, beveled edges, and directional shading so
  multiple faces remain visible and the silhouette stays well-defined from every
  angle.
- Pip positions match a real die layout (opposite faces sum to seven) with
  accurate corner, center, and edge placements.
- Rolling triggers a procedurally generated dice-rattle audio effect created
  with the Web Audio API to complement the visual tumble.

## Getting started

1. Open `index.html` in a modern browser (Chrome, Edge, Firefox, Safari). No
   build step is necessary.
2. Enter the number of dice you want and hit **Create Dice**.
3. Press **Roll** to watch the dice animate and read the results panel.

## Project structure

```
├── index.html      # Page layout and component template for each die
├── src/
│   └── main.js     # Application logic for creating and rolling dice
├── styles.css      # Visual design and 3D cube styling
└── README.md
```

## Customisation tips

- Adjust the `--dice-size` CSS variable in `styles.css` to tweak the dice size.
- Update the `max` attribute on the `#dice-count` input to change the allowed
  number of dice.
- Modify the `BASE_TILT` constant in `src/main.js` to alter the resting viewing
  angle of each die.
