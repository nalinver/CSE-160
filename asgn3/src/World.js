var VSHADER_SOURCE = `
  attribute vec4 a_Position; 
  uniform float u_size; 
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_viewMatrix;
  uniform mat4 u_projectionMatrix;
  void main() {
    gl_Position = u_projectionMatrix * u_viewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    gl_PointSize = u_size;
    v_UV = a_UV;
  }
`;

var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  varying vec2 v_UV;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  void main() {

    if (u_whichTexture == -2) {
        gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1) {
        gl_FragColor = vec4(v_UV, 1.0, 1.0);
    } else if (u_whichTexture == 0) {
        gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {
        gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else {
        gl_FragColor = vec4(1, 0.2, 0.2, 1.0);         
    }

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
let a_UV;
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;

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

    // Get the storage location of a_UV
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
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

    // Get the storage location of u_Sampler0
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Failed to get the storage location of u_Sampler0');
        return;
    }

    // Get the storage location of u_Sampler1
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
        console.log('Failed to get the storage location of u_Sampler1');
        return;
    }

    // Get the storage location of u_whichTexture
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
        return;
    }

    // Get the storage location of u_viewMatrix
    u_viewMatrix = gl.getUniformLocation(gl.program, 'u_viewMatrix');
    if (!u_viewMatrix) {
        console.log('Failed to get the storage location of u_viewMatrix');
        return;
    }

    // Get the storage location of u_projectionMatrix
    u_projectionMatrix = gl.getUniformLocation(gl.program, 'u_projectionMatrix');
    if (!u_projectionMatrix) {
        console.log('Failed to get the storage location of u_projectionMatrix');
        return;
    }

}




function initTextures() {
    loadTexture('hedges.jpg', 0);
    loadTexture('sky.jpg', 1);
}

function loadTexture(src, texUnit) {
    let image = new Image();
    image.onload = function () {
        let texture = gl.createTexture();

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.activeTexture(gl.TEXTURE0 + texUnit);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGB,
            gl.RGB,
            gl.UNSIGNED_BYTE,
            image
        );

        if (texUnit === 0) gl.uniform1i(u_Sampler0, 0);
        if (texUnit === 1) gl.uniform1i(u_Sampler1, 1);
    };
    image.src = src;
}


function sendTextureToGLSL(image) {

    var texture = gl.createTexture();   // Create a texture object
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE0);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler0, 0);

    //gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

    //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle

    console.log('Finished sending texture to GLSL');
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
let g_prevMouseX = -1;            // for mouse-drag camera
let g_jointAngle = 0;            // joint angle
let g_jointAngle2 = 0;            // joint angle 2
let g_animation = false;          // animation flag
function addActionsForHtmlUI() {

    // Joint Slider slider
    document.getElementById('jointSlider').addEventListener('mousemove', function () {
        g_jointAngle = this.value;
        renderAllShapes();
    });



    // Animation button
    document.getElementById('animationButtonON').onclick = function () { g_animation = true; }
    document.getElementById('animationButtonOFF').onclick = function () { g_animation = false; }

}


var camera;

function main() {
    setUpWebGL();
    connectVariableGLSL();

    camera = new Camera();

    // Set up actions for buttons and sliders
    addActionsForHtmlUI();



    setupMouseHandlers();
    document.onkeydown = keydown;

    initTextures(gl, 0);

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
    //console.log(g_seconds);


    renderAllShapes();

    requestAnimationFrame(tick);
}

function onMove(ev) {
    var rect = canvas.getBoundingClientRect();
    var mouseX = ev.clientX - rect.left;
    if (g_prevMouseX >= 0) {
        var deltaX = mouseX - g_prevMouseX;
        var sensitivity = 0.5;
        var alpha = deltaX * sensitivity;
        if (alpha > 0) camera.panRight(alpha);
        else if (alpha < 0) camera.panLeft(-alpha);
    }
    g_prevMouseX = mouseX;
}

function setupMouseHandlers() {
    canvas.onmousemove = function (ev) {
        if (ev.buttons === 1) click(ev);
        onMove(ev);
    };
    canvas.onmouseleave = function () {
        g_prevMouseX = -1;
    };
    canvas.oncontextmenu = function (ev) { ev.preventDefault(); };
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


function convertCoordinatesEventToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    return ([x, y]);
}

function keydown(ev) {
    var speed = 0.1;
    if (ev.key === 'w' || ev.key === 'W') {
        camera.moveForward(speed);
    }
    if (ev.key === 's' || ev.key === 'S') {
        camera.moveBackwards(speed);
    }
    if (ev.key === 'a' || ev.key === 'A') {
        camera.moveLeft(speed);
    }
    if (ev.key === 'd' || ev.key === 'D') {
        camera.moveRight(speed);
    }
    if (ev.key === 'q' || ev.key === 'Q') {
        camera.panLeft();
    }
    if (ev.key === 'e' || ev.key === 'E') {
        camera.panRight();
    }
}


// *** cursor defined here ***
// Generate a maze with recursive backtracking. 1 = wall, 0 = path.
// cellRows/cellCols = number of "rooms"; grid size is (2*cellRows+1) x (2*cellCols+1).
function generateMaze(cellRows, cellCols) {
    var rows = 2 * cellRows + 1;
    var cols = 2 * cellCols + 1;
    var grid = [];
    for (var i = 0; i < rows; i++) {
        grid[i] = [];
        for (var j = 0; j < cols; j++) grid[i][j] = 1;
    }
    function carve(r, c) {
        grid[r][c] = 0;
        var dirs = [[0, -2], [0, 2], [-2, 0], [2, 0]];
        for (var i = dirs.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = dirs[i]; dirs[i] = dirs[j]; dirs[j] = t;
        }
        for (var d = 0; d < 4; d++) {
            var nr = r + dirs[d][0], nc = c + dirs[d][1];
            if (nr >= 1 && nr < rows - 1 && nc >= 1 && nc < cols - 1 && grid[nr][nc] === 1) {
                grid[r + dirs[d][0] / 2][c + dirs[d][1] / 2] = 0;
                carve(nr, nc);
            }
        }
    }
    carve(1, 1);
    return grid;
}

var g_map = generateMaze(12, 12);

var g_mazeCellSize = 1.2;

// used cursor to generate maze 
function drawMaze() {
    var rows = g_map.length;
    var cols = g_map[0].length;
    var halfR = (rows - 1) / 2, halfC = (cols - 1) / 2;
    var s = g_mazeCellSize;
    for (var x = 0; x < rows; x++) {
        for (var y = 0; y < cols; y++) {
            if (g_map[x][y] === 1) {
                var block = new Cube();
                block.color = [0.2, 0.2, 1, 1.0];
                block.textureNum = 0;
                block.matrix.translate(0, -1, 0);
                block.matrix.scale(0.4, 1, 0.4);
                block.matrix.translate((y - halfC) * s, 0.5, (x - halfR) * s);
                block.renderfast();
            }
        }
    }
}



function drawMap() {
    for (x = 0; x < 32; x++) {
        for (y = 0; y < 32; y++) {
            if (x < 1 || x == 31 || y < 1 || y == 31) {
                var block = new Cube();
                block.color = [1, 1, 1, 1.0];
                block.matrix.translate(0, -1, 0);
                block.matrix.scale(0.4, 1, 0.4);
                block.matrix.translate(x - 16, 0, y - 16);
                block.renderfast();
            }
        }
    }
}

function renderAllShapes() {

    var startTime = performance.now();

    // Pass the matrix to ProjectionMatrix
    gl.uniformMatrix4fv(u_projectionMatrix, false, camera.projectionMatrix.elements);

    // Pass the matrix to ViewMatrix
    gl.uniformMatrix4fv(u_viewMatrix, false, camera.viewMatrix.elements);

    // Pass the matrix to u_ModelMatrix attribute
    var globalRotMatrix = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMatrix.elements);


    gl.enable(gl.DEPTH_TEST); // 1

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // 1


    var sky = new Cube();
    sky.color = [0.5, 0.5, 2, 1.0];
    sky.textureNum = 1;
    sky.matrix.translate(-55.12, -1, -55.12);
    sky.matrix.scale(500, 500, 500);
    sky.render();


    // Draw the map
    drawMap();
    drawMaze();

    // Draw the floor
    var floor = new Cube();
    floor.color = [0.5, 0.5, 0.5, 1.0];
    floor.textureNum = 0;
    floor.matrix.translate(0, -0.75, 0);
    floor.matrix.scale(10, 0.0, 10);
    floor.matrix.translate(-0.5, 11, -0.5);
    floor.render();


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
    //head.textureNum = 0;
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



