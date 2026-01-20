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

    // Draw Picture button
    document.getElementById('drawPicture').onclick = function () {
        drawHardcodedTriangleImage();
    };

}

function loadReferenceImage() {
    const refCanvas = document.getElementById('referenceImageCanvas');
    if (!refCanvas) {
        console.log('Reference canvas not found');
        return;
    }

    const ctx = refCanvas.getContext('2d');
    const img = new Image();

    img.onload = function () {
        // Draw the image to fill the canvas
        ctx.drawImage(img, 0, 0, refCanvas.width, refCanvas.height);
    };

    img.onerror = function () {
        console.log('Failed to load reference image');
    };

    // Load the image (path relative to HTML file)
    img.src = 'r2d2-14.jpg';
}

function main() {
    setUpWebGL();
    connectVariableGLSL();

    // Set up actions for buttons and sliders
    addActionsForHtmlUI();

    // Load and display reference image on second canvas
    loadReferenceImage();

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

// Create the same shape at a different specified position {{EXTRAS}}
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

// Depending on the action selected perform the symmetry operation {{EXTRAS}}
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

    //drawGridGL(20);   // draw grid every frame

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

function drawGridGL(gridStepPx = 20) {
    // grid step in pixels
    const w = canvas.width;
    const h = canvas.height;

    const verts = [];

    // Vertical lines
    for (let x = 0; x <= w; x += gridStepPx) {
        const xNdc = (x / (w / 2)) - 1;
        verts.push(xNdc, -1);
        verts.push(xNdc, 1);
    }

    // Horizontal lines
    for (let y = 0; y <= h; y += gridStepPx) {
        const yNdc = 1 - (y / (h / 2));
        verts.push(-1, yNdc);
        verts.push(1, yNdc);
    }

    const vertexCount = verts.length / 2;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    // Grid color (black)
    gl.uniform4f(u_FragColor, 1, 1, 1, 1);

    // Draw lines
    gl.drawArrays(gl.LINES, 0, vertexCount);

    gl.deleteBuffer(buffer);
}



// Used Cursor to generate the triangle coordinates for the R2D2 image.
// Each triangle: 3 vertices in WebGL coordinates (x,y), plus a color
// R2D2 droid from Star Wars
// Colors: Light Gray #E9E9E9, Dark Gray #7F7F7F, Dark Blue #2D4396, Black #000000, Orange #FF6600
const TRIANGLE_IMAGE = [
    // === HEAD DOME (Light Gray) ===
    // Dome left half
    {
        color: [0.914, 0.914, 0.914, 1], // light gray
        verts: [
            [-0.25, 0.35],    // left base
            [-0.25, 0.6],     // left top
            [0, 0.65],        // center top
        ]
    },
    {
        color: [0.914, 0.914, 0.914, 1],
        verts: [
            [-0.25, 0.35],    // left base
            [0, 0.65],         // center top
            [0, 0.35],         // center base
        ]
    },
    // Dome right half
    {
        color: [0.914, 0.914, 0.914, 1],
        verts: [
            [0, 0.35],         // center base
            [0, 0.65],         // center top
            [0.25, 0.6],       // right top
        ]
    },
    {
        color: [0.914, 0.914, 0.914, 1],
        verts: [
            [0, 0.35],         // center base
            [0.25, 0.6],       // right top
            [0.25, 0.35],      // right base
        ]
    },

    // === TOP BLUE TRAPEZOID ===
    {
        color: [0.176, 0.263, 0.588, 1], // dark blue
        verts: [
            [-0.08, 0.6],      // bottom-left
            [-0.05, 0.65],     // top-left
            [0.05, 0.65],      // top-right
        ]
    },
    {
        color: [0.176, 0.263, 0.588, 1],
        verts: [
            [-0.08, 0.6],      // bottom-left
            [0.05, 0.65],      // top-right
            [0.08, 0.6],       // bottom-right
        ]
    },

    // === BLACK EYE CIRCLE (approximated with triangles) ===
    {
        color: [0, 0, 0, 1], // black
        verts: [
            [0, 0.63],         // center
            [-0.02, 0.64],     // top-left
            [0.02, 0.64],      // top-right
        ]
    },
    {
        color: [0, 0, 0, 1],
        verts: [
            [0, 0.63],         // center
            [0.02, 0.64],      // top-right
            [0.02, 0.62],      // bottom-right
        ]
    },
    {
        color: [0, 0, 0, 1],
        verts: [
            [0, 0.63],         // center
            [0.02, 0.62],      // bottom-right
            [-0.02, 0.62],     // bottom-left
        ]
    },
    {
        color: [0, 0, 0, 1],
        verts: [
            [0, 0.63],         // center
            [-0.02, 0.62],     // bottom-left
            [-0.02, 0.64],     // top-left
        ]
    },

    // === LEFT BLUE RECTANGLE (Upper) ===
    {
        color: [0.176, 0.263, 0.588, 1], // dark blue
        verts: [
            [-0.2, 0.55],      // bottom-left
            [-0.2, 0.6],       // top-left
            [-0.12, 0.55],     // bottom-right
        ]
    },
    {
        color: [0.176, 0.263, 0.588, 1],
        verts: [
            [-0.2, 0.6],       // top-left
            [-0.12, 0.6],      // top-right
            [-0.12, 0.55],     // bottom-right
        ]
    },

    // === RIGHT BLUE RECTANGLE (Upper) ===
    {
        color: [0.176, 0.263, 0.588, 1], // dark blue
        verts: [
            [0.12, 0.55],      // bottom-left
            [0.12, 0.6],       // top-left
            [0.18, 0.55],      // bottom-right
        ]
    },
    {
        color: [0.176, 0.263, 0.588, 1],
        verts: [
            [0.12, 0.6],       // top-left
            [0.18, 0.6],       // top-right
            [0.18, 0.55],      // bottom-right
        ]
    },

    // === CENTRAL BAND: Far Left Blue Rectangle ===
    {
        color: [0.176, 0.263, 0.588, 1], // dark blue
        verts: [
            [-0.22, 0.45],     // bottom-left
            [-0.22, 0.55],     // top-left
            [-0.18, 0.45],     // bottom-right
        ]
    },
    {
        color: [0.176, 0.263, 0.588, 1],
        verts: [
            [-0.22, 0.55],     // top-left
            [-0.18, 0.55],     // top-right
            [-0.18, 0.45],     // bottom-right
        ]
    },

    // === Second Left Blue Rectangle ===
    {
        color: [0.176, 0.263, 0.588, 1], // dark blue
        verts: [
            [-0.16, 0.45],     // bottom-left
            [-0.16, 0.55],     // top-left
            [-0.12, 0.45],     // bottom-right
        ]
    },
    {
        color: [0.176, 0.263, 0.588, 1],
        verts: [
            [-0.16, 0.55],     // top-left
            [-0.12, 0.55],     // top-right
            [-0.12, 0.45],     // bottom-right
        ]
    },

    // === ORANGE CIRCLE (approximated) ===
    {
        color: [1.0, 0.4, 0.0, 1], // orange
        verts: [
            [-0.05, 0.5],      // center
            [-0.08, 0.52],     // top-left
            [-0.02, 0.52],     // top-right
        ]
    },
    {
        color: [1.0, 0.4, 0.0, 1],
        verts: [
            [-0.05, 0.5],      // center
            [-0.02, 0.52],     // top-right
            [-0.02, 0.48],     // bottom-right
        ]
    },
    {
        color: [1.0, 0.4, 0.0, 1],
        verts: [
            [-0.05, 0.5],      // center
            [-0.02, 0.48],     // bottom-right
            [-0.08, 0.48],     // bottom-left
        ]
    },
    {
        color: [1.0, 0.4, 0.0, 1],
        verts: [
            [-0.05, 0.5],      // center
            [-0.08, 0.48],     // bottom-left
            [-0.08, 0.52],     // top-left
        ]
    },

    // === Dark Blue Circle (right of orange) ===
    {
        color: [0.176, 0.263, 0.588, 1], // dark blue
        verts: [
            [0.05, 0.5],       // center
            [0.02, 0.52],      // top-left
            [0.08, 0.52],      // top-right
        ]
    },
    {
        color: [0.176, 0.263, 0.588, 1],
        verts: [
            [0.05, 0.5],       // center
            [0.08, 0.52],      // top-right
            [0.08, 0.48],      // bottom-right
        ]
    },
    {
        color: [0.176, 0.263, 0.588, 1],
        verts: [
            [0.05, 0.5],       // center
            [0.08, 0.48],      // bottom-right
            [0.02, 0.48],      // bottom-left
        ]
    },
    {
        color: [0.176, 0.263, 0.588, 1],
        verts: [
            [0.05, 0.5],       // center
            [0.02, 0.48],      // bottom-left
            [0.02, 0.52],      // top-left
        ]
    },

    // === Rightmost Three Blue Rectangles ===
    {
        color: [0.176, 0.263, 0.588, 1], // dark blue
        verts: [
            [0.12, 0.45],      // bottom-left
            [0.12, 0.52],      // top-left
            [0.14, 0.45],      // bottom-right
        ]
    },
    {
        color: [0.176, 0.263, 0.588, 1],
        verts: [
            [0.12, 0.52],      // top-left
            [0.14, 0.52],      // top-right
            [0.14, 0.45],      // bottom-right
        ]
    },
    {
        color: [0.176, 0.263, 0.588, 1], // dark blue
        verts: [
            [0.15, 0.45],      // bottom-left
            [0.15, 0.5],       // top-left
            [0.17, 0.45],      // bottom-right
        ]
    },
    {
        color: [0.176, 0.263, 0.588, 1],
        verts: [
            [0.15, 0.5],       // top-left
            [0.17, 0.5],       // top-right
            [0.17, 0.45],      // bottom-right
        ]
    },
    {
        color: [0.176, 0.263, 0.588, 1], // dark blue
        verts: [
            [0.18, 0.45],      // bottom-left
            [0.18, 0.48],      // top-left
            [0.2, 0.45],       // bottom-right
        ]
    },
    {
        color: [0.176, 0.263, 0.588, 1],
        verts: [
            [0.18, 0.48],      // top-left
            [0.2, 0.48],       // top-right
            [0.2, 0.45],       // bottom-right
        ]
    },

    // === MAIN BODY LIGHT GRAY CASING ===
    // Left half
    {
        color: [0.914, 0.914, 0.914, 1], // light gray
        verts: [
            [-0.25, -0.2],     // bottom-left
            [-0.25, 0.35],     // top-left
            [0, 0.35],         // top-center
        ]
    },
    {
        color: [0.914, 0.914, 0.914, 1],
        verts: [
            [-0.25, -0.2],     // bottom-left
            [0, 0.35],         // top-center
            [0, -0.2],         // bottom-center
        ]
    },
    // Right half
    {
        color: [0.914, 0.914, 0.914, 1],
        verts: [
            [0, -0.2],         // bottom-center
            [0, 0.35],         // top-center
            [0.25, 0.35],      // top-right
        ]
    },
    {
        color: [0.914, 0.914, 0.914, 1],
        verts: [
            [0, -0.2],         // bottom-center
            [0.25, 0.35],      // top-right
            [0.25, -0.2],      // bottom-right
        ]
    },

    // === CENTRAL DARK GRAY PANEL ===
    // Top horizontal rectangle
    {
        color: [0.498, 0.498, 0.498, 1], // dark gray
        verts: [
            [-0.2, 0.25],      // bottom-left
            [-0.2, 0.3],       // top-left
            [0.2, 0.25],       // bottom-right
        ]
    },
    {
        color: [0.498, 0.498, 0.498, 1],
        verts: [
            [-0.2, 0.3],       // top-left
            [0.2, 0.3],        // top-right
            [0.2, 0.25],       // bottom-right
        ]
    },

    // Three vertical rectangles
    // Left vertical
    {
        color: [0.498, 0.498, 0.498, 1], // dark gray
        verts: [
            [-0.2, -0.1],      // bottom-left
            [-0.2, 0.25],      // top-left
            [-0.1, -0.1],      // bottom-right
        ]
    },
    {
        color: [0.498, 0.498, 0.498, 1],
        verts: [
            [-0.2, 0.25],      // top-left
            [-0.1, 0.25],      // top-right
            [-0.1, -0.1],      // bottom-right
        ]
    },
    // Middle vertical
    {
        color: [0.498, 0.498, 0.498, 1], // dark gray
        verts: [
            [-0.08, -0.1],     // bottom-left
            [-0.08, 0.25],     // top-left
            [0.08, -0.1],      // bottom-right
        ]
    },
    {
        color: [0.498, 0.498, 0.498, 1],
        verts: [
            [-0.08, 0.25],     // top-left
            [0.08, 0.25],      // top-right
            [0.08, -0.1],      // bottom-right
        ]
    },
    // Right vertical
    {
        color: [0.498, 0.498, 0.498, 1], // dark gray
        verts: [
            [0.1, -0.1],       // bottom-left
            [0.1, 0.25],       // top-left
            [0.2, -0.1],       // bottom-right
        ]
    },
    {
        color: [0.498, 0.498, 0.498, 1],
        verts: [
            [0.1, 0.25],       // top-left
            [0.2, 0.25],       // top-right
            [0.2, -0.1],       // bottom-right
        ]
    },

    // Middle horizontal rectangle
    {
        color: [0.498, 0.498, 0.498, 1], // dark gray
        verts: [
            [-0.2, -0.15],     // bottom-left
            [-0.2, -0.1],      // top-left
            [0.2, -0.15],      // bottom-right
        ]
    },
    {
        color: [0.498, 0.498, 0.498, 1],
        verts: [
            [-0.2, -0.1],      // top-left
            [0.2, -0.1],       // top-right
            [0.2, -0.15],      // bottom-right
        ]
    },

    // Four small bottom rectangles
    {
        color: [0.498, 0.498, 0.498, 1], // dark gray
        verts: [
            [-0.2, -0.2],      // bottom-left
            [-0.2, -0.15],     // top-left
            [-0.1, -0.2],      // bottom-right
        ]
    },
    {
        color: [0.498, 0.498, 0.498, 1],
        verts: [
            [-0.2, -0.15],     // top-left
            [-0.1, -0.15],     // top-right
            [-0.1, -0.2],      // bottom-right
        ]
    },
    {
        color: [0.498, 0.498, 0.498, 1], // dark gray
        verts: [
            [-0.08, -0.2],     // bottom-left
            [-0.08, -0.15],    // top-left
            [0.08, -0.2],      // bottom-right
        ]
    },
    {
        color: [0.498, 0.498, 0.498, 1],
        verts: [
            [-0.08, -0.15],    // top-left
            [0.08, -0.15],     // top-right
            [0.08, -0.2],      // bottom-right
        ]
    },
    {
        color: [0.498, 0.498, 0.498, 1], // dark gray
        verts: [
            [0.1, -0.2],       // bottom-left
            [0.1, -0.15],      // top-left
            [0.2, -0.2],       // bottom-right
        ]
    },
    {
        color: [0.498, 0.498, 0.498, 1],
        verts: [
            [0.1, -0.15],      // top-left
            [0.2, -0.15],      // top-right
            [0.2, -0.2],       // bottom-right
        ]
    },

    // === SIDE LEGS (Light Gray) ===
    // Left leg
    {
        color: [0.914, 0.914, 0.914, 1], // light gray
        verts: [
            [-0.35, -0.2],     // top-left
            [-0.35, -0.5],     // bottom-left
            [-0.25, -0.2],     // top-right
        ]
    },
    {
        color: [0.914, 0.914, 0.914, 1],
        verts: [
            [-0.35, -0.5],     // bottom-left
            [-0.25, -0.5],     // bottom-right
            [-0.25, -0.2],     // top-right
        ]
    },
    // Right leg
    {
        color: [0.914, 0.914, 0.914, 1], // light gray
        verts: [
            [0.25, -0.2],      // top-left
            [0.25, -0.5],      // bottom-left
            [0.35, -0.2],      // top-right
        ]
    },
    {
        color: [0.914, 0.914, 0.914, 1],
        verts: [
            [0.25, -0.5],      // bottom-left
            [0.35, -0.5],      // bottom-right
            [0.35, -0.2],      // top-right
        ]
    },

    // === LOWER DARK GRAY BASE ===
    {
        color: [0.498, 0.498, 0.498, 1], // dark gray
        verts: [
            [-0.35, -0.5],     // left
            [-0.35, -0.55],    // bottom-left
            [0.35, -0.5],      // right
        ]
    },
    {
        color: [0.498, 0.498, 0.498, 1],
        verts: [
            [-0.35, -0.55],    // bottom-left
            [0.35, -0.55],     // bottom-right
            [0.35, -0.5],      // right
        ]
    },

    // === ANGLED DARK GRAY FEET SUPPORTS ===
    // Left support
    {
        color: [0.498, 0.498, 0.498, 1], // dark gray
        verts: [
            [-0.35, -0.55],    // top-left
            [-0.4, -0.7],      // bottom-left
            [-0.25, -0.55],    // top-right
        ]
    },
    {
        color: [0.498, 0.498, 0.498, 1],
        verts: [
            [-0.25, -0.55],    // top-right
            [-0.4, -0.7],      // bottom-left
            [-0.3, -0.7],      // bottom-right
        ]
    },
    // Right support
    {
        color: [0.498, 0.498, 0.498, 1], // dark gray
        verts: [
            [0.25, -0.55],     // top-left
            [0.3, -0.7],       // bottom-left
            [0.35, -0.55],     // top-right
        ]
    },
    {
        color: [0.498, 0.498, 0.498, 1],
        verts: [
            [0.35, -0.55],     // top-right
            [0.3, -0.7],       // bottom-left
            [0.4, -0.7],       // bottom-right
        ]
    },

    // === LIGHT GRAY FEET ===
    // Left foot
    {
        color: [0.914, 0.914, 0.914, 1], // light gray
        verts: [
            [-0.4, -0.7],      // top-left
            [-0.45, -0.85],    // bottom-left
            [-0.3, -0.7],      // top-right
        ]
    },
    {
        color: [0.914, 0.914, 0.914, 1],
        verts: [
            [-0.3, -0.7],      // top-right
            [-0.45, -0.85],    // bottom-left
            [-0.35, -0.85],    // bottom-right
        ]
    },
    // Right foot
    {
        color: [0.914, 0.914, 0.914, 1], // light gray
        verts: [
            [0.3, -0.7],       // top-left
            [0.35, -0.85],     // bottom-left
            [0.4, -0.7],       // top-right
        ]
    },
    {
        color: [0.914, 0.914, 0.914, 1],
        verts: [
            [0.4, -0.7],       // top-right
            [0.35, -0.85],     // bottom-left
            [0.45, -0.85],     // bottom-right
        ]
    },
];


function drawHardcodedTriangleImage() {
    g_shapesList = [];

    for (let i = 0; i < TRIANGLE_IMAGE.length; i++) {
        const tData = TRIANGLE_IMAGE[i];

        const tri = new Triangle();
        tri.color = tData.color.slice();
        tri.size = 1;
        tri.verts = tData.verts;

        g_shapesList.push(tri);
    }

    renderAllShapes();
}





