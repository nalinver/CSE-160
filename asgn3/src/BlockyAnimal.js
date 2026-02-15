// ColoredPoint.js (c) 2012 matsuda
// Simple shader programs for drawing colored points/shapes
var VSHADER_SOURCE = `
  attribute vec4 a_Position; 
  uniform float u_size; 
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
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
let u_ModelMatrix;
let u_GlobalRotateMatrix;
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

    gl.enable(gl.DEPTH_TEST);
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

    // Get the storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    // Get the storage location of u_GlobalRotateMatrix
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
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
let g_globalAngle = 0;            // camera angle
let g_jointAngle = 0;            // joint angle
let g_jointAngle2 = 0;            // joint angle 2
let g_animation = false;          // animation flag
function addActionsForHtmlUI() {
    /*
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
    */

    // Camera Angle slider
    document.getElementById('angleSlide').addEventListener('mousemove', function () {
        g_globalAngle = this.value;
        renderAllShapes();
    });

    // Joint Slider slider
    document.getElementById('jointSlider').addEventListener('mousemove', function () {
        g_jointAngle = this.value;
        renderAllShapes();
    });

    /*
    // Joint Slider 2 slider
    document.getElementById('jointSlider2').addEventListener('mousemove', function () {
        g_jointAngle2 = this.value;
        renderAllShapes();
    });
    */

    // Animation button
    document.getElementById('animationButtonON').onclick = function () { g_animation = true; }
    document.getElementById('animationButtonOFF').onclick = function () { g_animation = false; }

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
    //gl.clear(gl.COLOR_BUFFER_BIT);

    requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000;
var g_seconds = performance.now() / 1000 - g_startTime;

function tick() {
    g_seconds = performance.now() / 1000 - g_startTime;
    console.log(g_seconds);


    renderAllShapes();

    requestAnimationFrame(tick);
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

    // Pass the matrix to u_ModelMatrix attribute
    var globalRotMatrix = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMatrix.elements);


    gl.enable(gl.DEPTH_TEST); // 1

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // 1


    // --- Blocky Eagle ---
    var bodyBrown = [0.45, 0.3, 0.15, 1.0];
    var headWhite = [0.95, 0.95, 0.9, 1.0];
    var beakYellow = [0.9, 0.75, 0.1, 1.0];
    var wingDark = [0.25, 0.2, 0.15, 1.0];
    var legYellow = [0.85, 0.7, 0.2, 1.0];

    var wingAngleL, wingAngleR, legSwingL, legSwingR;
    if (g_animation) {
        var wingFlap = 12 * Math.sin(g_seconds * 2);
        wingAngleL = wingFlap;
        wingAngleR = -wingFlap;  // negative for unison movement (wings on opposite sides)
        legSwingL = 18 * Math.sin(g_seconds * 2.5);
        legSwingR = 18 * Math.sin(g_seconds * 2.5 + Math.PI);
    } else {
        wingAngleL = g_jointAngle;
        wingAngleR = -g_jointAngle;  // negative for unison movement (wings on opposite sides)
        legSwingL = 0;
        legSwingR = 0;
    }

    // 1) Body 
    var body = new Cube();
    body.color = bodyBrown;
    body.matrix.translate(-0.12, -0.5, -0.15);
    body.matrix.scale(0.35, 0.28, 0.3);
    body.render();

    // 2) Tail feathers
    var tail1 = new Cube();
    tail1.color = bodyBrown;
    tail1.matrix.translate(0.18, -0.48, -0.08);
    tail1.matrix.rotate(-5, 0, 0, 1);
    tail1.matrix.scale(0.12, 0.1, 0.2);
    tail1.render();
    var tail2 = new Cube();
    tail2.color = bodyBrown;
    tail2.matrix.translate(0.22, -0.52, 0);
    tail2.matrix.rotate(-8, 0, 0, 1);
    tail2.matrix.scale(0.1, 0.12, 0.18);
    tail2.render();
    var tail3 = new Cube();
    tail3.color = bodyBrown;
    tail3.matrix.translate(0.18, -0.48, 0.08);
    tail3.matrix.rotate(-5, 0, 0, 1);
    tail3.matrix.scale(0.12, 0.1, 0.2);
    tail3.render();

    // 3) Neck
    var neck = new Cube();
    neck.color = bodyBrown;
    neck.matrix.translate(-0.2, -0.35, -0.06);
    neck.matrix.scale(0.12, 0.2, 0.12);
    neck.render();

    // 4) Head
    var head = new Cube();
    head.color = headWhite;
    head.matrix.translate(-0.28, -0.22, -0.08);
    head.matrix.scale(0.18, 0.18, 0.16);
    head.render();

    // 4b) Eyes (on front of head)
    var eyeColor = [0.1, 0.4, 0.05, 1.0];
    var eyeL = new Cube();
    eyeL.color = eyeColor;
    eyeL.matrix.translate(-0.3, -0.1, -0.05);
    eyeL.matrix.scale(0.04, 0.05, 0.04);
    eyeL.render();
    var eyeR = new Cube();
    eyeR.color = eyeColor;
    eyeR.matrix.translate(-0.3, -0.1, 0);
    eyeR.matrix.scale(0.04, 0.05, 0.04);
    eyeR.render();

    // 5) Beak
    var beak = new Cube();
    beak.color = beakYellow;
    beak.matrix.translate(-0.4, -0.2, -0.03);
    beak.matrix.scale(0.12, 0.06, 0.06);
    beak.render();

    // 6) Left wing
    var wingL1 = new Cube();
    wingL1.color = wingDark;
    wingL1.matrix.translate(-0.1, -0.42, 0.22);
    wingL1.matrix.rotate(wingAngleL, 1, 0, 0);
    wingL1.matrix.scale(0.25, 0.08, 0.2);
    wingL1.render();
    var wingL2 = new Cube();
    wingL2.color = wingDark;
    wingL2.matrix.translate(0.08, -0.44, 0.28);
    wingL2.matrix.rotate(wingAngleL + (g_animation ? 5 : 0), 1, 0, 0);
    wingL2.matrix.scale(0.2, 0.06, 0.15);
    wingL2.render();

    // 7) Right wing
    var wingR1 = new Cube();
    wingR1.color = wingDark;
    wingR1.matrix.translate(-0.1, -0.42, -0.22);
    wingR1.matrix.rotate(wingAngleR, 1, 0, 0);
    wingR1.matrix.scale(0.25, 0.08, 0.2);
    wingR1.render();
    var wingR2 = new Cube();
    wingR2.color = wingDark;
    wingR2.matrix.translate(0.08, -0.44, -0.28);
    wingR2.matrix.rotate(wingAngleR - (g_animation ? 5 : 0), 1, 0, 0);  // subtract for unison (right wing uses negative angles)
    wingR2.matrix.scale(0.2, 0.06, 0.15);
    wingR2.render();

    // 8) Legs and feet
    var hipL = [-0.05, -0.62, 0.08];
    var hipR = [-0.05, -0.62, -0.08];
    var legHalfH = 0.09;
    var legFullH = 0.18;

    var legL = new Cube();
    legL.color = legYellow;
    legL.matrix.translate(hipL[0], hipL[1], hipL[2]);
    legL.matrix.rotate(legSwingL, 0, 0, 1);
    legL.matrix.translate(0, -legHalfH, 0);
    legL.matrix.scale(0.06, 0.18, 0.06);
    legL.render();
    var legR = new Cube();
    legR.color = legYellow;
    legR.matrix.translate(hipR[0], hipR[1], hipR[2]);
    legR.matrix.rotate(legSwingR, 0, 0, 1);
    legR.matrix.translate(0, -legHalfH, 0);
    legR.matrix.scale(0.06, 0.18, 0.06);
    legR.render();
    var footL = new Cube();
    footL.color = legYellow;
    footL.matrix.translate(hipL[0], hipL[1], hipL[2]);
    footL.matrix.rotate(legSwingL, 0, 0, 1);
    footL.matrix.translate(-0.01, legFullH + 0.02, 0);
    footL.matrix.scale(0.08, 0.04, 0.12);
    footL.render();
    var footR = new Cube();
    footR.color = legYellow;
    footR.matrix.translate(hipR[0], hipR[1], hipR[2]);
    footR.matrix.rotate(legSwingR, 0, 0, 1);
    footR.matrix.translate(-0.01, legFullH + 0.02, 0);
    footR.matrix.scale(0.08, 0.04, 0.12);
    footR.render();

    // Draw the left arm cube
    /*var leftArm = new Cube();
    leftArm.color = [1.0, 1.0, 0.0, 1.0];
    leftArm.matrix.setTranslate(0, -0.5, 0.0);
    leftArm.matrix.rotate(-5, 1, 0, 0);
    leftArm.matrix.rotate(-g_jointAngle, 0, 0, 1);
    var yellowCoordinates = new Matrix4(leftArm.matrix);
    leftArm.matrix.scale(0.25, 0.7, 0.5);
    leftArm.matrix.translate(-0.5, 0.0, 0.0);
    leftArm.render();*/

    // test box
    /*var box = new Cube();
    box.color = [1.0, 0.0, 1.0, 1.0];
    box.matrix = yellowCoordinates;
    box.matrix.translate(0.0, 0.65, 0.0);
    box.matrix.rotate(-g_jointAngle2, 0, 0, 1);
    box.matrix.scale(0.3, 0.3, 0.3);
    box.matrix.translate(-0.5, 0, -0.001);
    box.render();*/

    var duration = performance.now() - startTime;
    sendTextToHtml(' ms: ' + Math.floor(duration) + ' fps: ' + Math.floor(10000 / duration), "numdot");
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



