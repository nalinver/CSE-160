# BlockyAnimal

Nalin Verma
SID: 1973625

A WebGL-based 3D eagle animation built entirely from cubes. This project demonstrates 3D transformations, matrix operations, and real-time animation using WebGL.

## Features

- **Blocky Eagle Model**: A stylized eagle constructed entirely from 3D cubes, including:
  - Body, tail feathers, neck, and head
  - Wings with multiple segments
  - Legs and feet
  - Eyes and beak

- **Animation System**:
  - **Animation ON**: Wings flap automatically and legs swing back and forth in a walking motion
  - **Animation OFF**: Wings can be manually controlled via the Joint Slider

- **Interactive Controls**:
  - **Wing Flapper Slider**: Manually control wing position when animation is off (range: -45° to 45°)
  - **Camera Angle Slider**: Rotate the view around the eagle (range: -180° to 180°)
  - **Animation Toggle**: Switch between automatic animation and manual control

## How to Run

1. Open `src/BlockyAnimal.html` in a modern web browser that supports WebGL
2. The eagle will be displayed in the canvas
3. Use the controls to interact with the model:
   - Toggle animation ON/OFF
   - Adjust the Wing Flapper slider when animation is off
   - Rotate the camera to view the eagle from different angles

## Technical Details

- **WebGL**: Uses WebGL for 3D rendering
- **Matrix Transformations**: Implements 3D transformations using matrix operations
- **Real-time Animation**: Uses `requestAnimationFrame` for smooth 60fps animation
- **Time-based Motion**: Wings and legs animate based on elapsed time (`g_seconds`)

## File Structure

- `src/BlockyAnimal.html` - Main HTML file
- `src/BlockyAnimal.js` - Main JavaScript file containing the eagle model and animation logic
- `src/Cube.js` - Cube primitive class
- `lib/` - WebGL utility libraries (cuon-utils, cuon-matrix, etc.)

## Browser Compatibility

Requires a browser with WebGL support:
- Chrome/Edge (recommended)
- Firefox
- Safari
