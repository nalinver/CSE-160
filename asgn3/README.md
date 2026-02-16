# Virtual World

Nalin Verma  
SID: 1973625

A WebGL 3D scene with a procedurally generated maze, first-person camera, skybox, and textured walls.

## How to run

Open `src/World.html` in a modern browser (Chrome, Firefox, Safari, or Edge). For local textures to load, serve the folder with a local server (e.g. `python -m http.server` from the project root or from `asgn3`).

## Controls

- **W / A / S / D** — Move forward, left, backward, right  
- **Q / E** — Pan camera left / right  
- **Mouse** — Move mouse to look around  
- **Wing Flapper** — Slider to move the eagle’s wings  
- **Animation** — ON/OFF to animate the eagle

## Features

- Camera class (view and projection matrices, move/pan)
- Maze built from blocks with recursive-backtracking generation
- Textured sky (skybox), floor, and stone maze walls
- Blocky eagle with wing animation


## Resources Used
- Cursor => Implement drawMaze
- GeeksForGeeks => Various little things...
- StackOverflow => Debugging mouseMove
- ChatGPT => figure out how to load multiple textures for different cubes (loadTexture Function)