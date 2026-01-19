// ColoredPoint.js (c) 2012 matsuda
// Simple shader programs for drawing colored points/shapes
var VSHADER_SOURCE = `
  attribute vec4 a_Position; 
  uniform float u_size; 
  uniform float u_segments;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_size;
  }
`;

var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }
`;


// Global related to the canvas
let canvas;
let gl;
let a_position;
let u_FragColor;
let u_size;
let u_segments;

function setUpWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    //gl = getWebGLContext(canvas);
    gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
}

function connectVariableGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    // Get the storage location of u_size
    u_size = gl.getUniformLocation(gl.program, 'u_size');
    if (!u_size) {
        console.log('Failed to get the storage location of u_size');
        return;
    }


}
// Shape type constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// globals related to UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 20;
let g_selectedType = POINT;       // default is POINT
let g_selectedSegments = 10;      // default is 10
let g_selectedSymmetry = 'off';   // default is off
let g_symmetrySlices = 6;         // radial symmetry slice count
function addActionsForHtmlUI() {
    // Color sliders
    document.getElementById('redSlide').addEventListener('mouseup', function () {
        g_selectedColor[0] = this.value / 100;
    });
    document.getElementById('greenSlide').addEventListener('mouseup', function () {
        g_selectedColor[1] = this.value / 100;
    });
    document.getElementById('blueSlide').addEventListener('mouseup', function () {
        g_selectedColor[2] = this.value / 100;
    });

    // Point size slider
    document.getElementById('pointSize').addEventListener('mouseup', function () {
        g_selectedSize = this.value;
    });

    // Circle segment count
    document.getElementById('segmentCount').addEventListener('mouseup', function () {
        g_selectedSegments = parseInt(this.value);
    });

    // Clear canvas button
    document.getElementById('clearButton').onclick = function () {
        g_shapesList = [];
        renderAllShapes();
    };

    // Shape type buttons
    document.getElementById('point').onclick = function () { g_selectedType = POINT; };
    document.getElementById('triangle').onclick = function () { g_selectedType = TRIANGLE; };
    document.getElementById('circle').onclick = function () { g_selectedType = CIRCLE; };

    // Symmetry controls
    document.getElementById('symmetry').addEventListener('change', function () {
        g_selectedSymmetry = this.value;
    });
    document.getElementById('radialSlices').addEventListener('input', function () {
        g_symmetrySlices = Math.max(2, parseInt(this.value));
    });
}

function main() {
    setUpWebGL();
    connectVariableGLSL();

    // Set up actions for buttons and sliders
    addActionsForHtmlUI();

    // Draw while mouse is held down and moved
    canvas.onmousemove = function (ev) {
        if (ev.buttons === 1) {
            click(ev);
        }
    };

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}

// globals for point attribute
var g_shapesList = [];

function click(ev) {
    const [x, y] = convertCoordinatesEventToGL(ev);

    const baseShape = buildShapeAt(x, y);
    g_shapesList.push(baseShape);

    const mirroredShapes = createSymmetricCopies(baseShape, x, y);
    for (let i = 0; i < mirroredShapes.length; i++) {
        g_shapesList.push(mirroredShapes[i]);
    }

    renderAllShapes();
}

function buildShapeAt(x, y) {
    let shape;
    if (g_selectedType === POINT) {
        shape = new Point();
    } else if (g_selectedType === TRIANGLE) {
        shape = new Triangle();
    } else {
        shape = new Circle(g_selectedSegments);
        shape.segments = g_selectedSegments;
    }
    shape.position = [x, y];
    shape.color = g_selectedColor.slice();
    shape.size = g_selectedSize;
    return shape;
}

// Create the same shape at a different specified position
function cloneShape(shapeTemplate, x, y) {
    // Reuse the builder to keep config consistent
    const clone = buildShapeAt(x, y);
    // Ensure size/color mirror the original in case sliders change mid-drag
    clone.color = shapeTemplate.color.slice();
    clone.size = shapeTemplate.size;
    if (clone.segments !== undefined && shapeTemplate.segments !== undefined) {
        clone.segments = shapeTemplate.segments;
    }
    return clone;
}

// Depending on the action selected perform the symmetry operation
function createSymmetricCopies(baseShape, x, y) {
    if (g_selectedSymmetry === 'off') return [];

    const copies = [];


    if (g_selectedSymmetry === 'vertical') {
        copies.push(cloneShape(baseShape, -x, y)); // mirror the shape across the vertical axis
    } else if (g_selectedSymmetry === 'horizontal') {
        copies.push(cloneShape(baseShape, x, -y)); // mirror the shape across the horizontal axis
    } else if (g_selectedSymmetry === 'radial') {
        const slices = Math.max(2, Math.floor(g_symmetrySlices)); // number of slices to create
        const step = (2 * Math.PI) / slices;
        for (let i = 1; i < slices; i++) {
            const angle = step * i;
            const rx = x * Math.cos(angle) - y * Math.sin(angle);
            const ry = x * Math.sin(angle) + y * Math.cos(angle);
            copies.push(cloneShape(baseShape, rx, ry));
        }
    }
    return copies;
}

function convertCoordinatesEventToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    return ([x, y]);
}

function renderAllShapes() {

    var startTime = performance.now();

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    //var len = g_points.length;
    var len = g_shapesList.length;

    for (var i = 0; i < len; i++) {

        g_shapesList[i].render();

    }

    var duration = performance.now() - startTime;
    sendTextToHtml('numdot: ' + len + ' ms: ' + Math.floor(duration) + ' fps: ' + Math.floor(10000 / duration), "numdot");
}


// Set the text of a HTML element
function sendTextToHtml(text, htmlID) {

    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }

    htmlElm.innerHTML = text;

}
