# Assignment 0: Vector Visualization

A web-based interactive vector visualization tool that allows users to manipulate and perform operations on 2D vectors.

## Features

- Visualize two 2D vectors (V1 and V2) on a canvas
- Perform vector operations:
  - **Add**: Add two vectors
  - **Subtract**: Subtract two vectors
  - **Multiply**: Multiply vectors by a scalar
  - **Divide**: Divide vectors by a scalar
  - **Magnitude**: Calculate vector magnitudes
  - **Normalize**: Normalize vectors to unit length
  - **Angle Between**: Calculate the angle between two vectors
  - **Area**: Calculate the area of the triangle formed by two vectors

## Files

- `asgn0.html` - Main HTML file containing the UI
- `asgn0.js` - JavaScript implementation for vector operations and drawing
- `lib/cuon_matrix.js` - Vector3 library for vector mathematics

## Usage

1. Open `asgn0.html` in a web browser that supports HTML5 Canvas
2. Enter x and y components for V1 and V2 vectors
3. Click "Draw Vectors" to visualize the vectors:
   - V1 is drawn in **red**
   - V2 is drawn in **blue**
4. Select an operation from the dropdown menu
5. For operations requiring a scalar (Multiply, Divide), enter a scalar value
6. Click "Draw Operations" to perform the selected operation
   - Results are drawn in **green**
   - Magnitude, angle, and area results are displayed in the browser console

## Vector Operations

- **Add/Subtract**: Computes V1 ± V2 and displays the result
- **Multiply/Divide**: Scales both vectors by the scalar value
- **Magnitude**: Logs the magnitude of both vectors to the console
- **Normalize**: Displays normalized (unit) versions of both vectors
- **Angle Between**: Calculates and logs the angle in degrees between the vectors
- **Area**: Computes and logs the area of the triangle formed by the two vectors

