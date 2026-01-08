
function drawVector(vector3, color) {

    var canvas = document.getElementById("example");
    if (!canvas) {
        console.log("Failed to retrieve the <canvas> element");
        return;
    }

    // Get the rendering context for 2D
    var ctx = canvas.getContext('2d');

    // Canvas center point
    var centerX = canvas.width / 2;
    var centerY = canvas.height / 2;

    // Get vector components (Vector3 stores elements as [x, y, z])
    var x = vector3.elements[0] * 20;
    var y = vector3.elements[1] * 20;
    // console.log(x, y);

    // Draw the vector line from center
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + x, centerY - y); // Subtract y because canvas y-axis is inverted
    ctx.strokeStyle = color;
    ctx.stroke();
}

function angleBetween(vector1, vector2) {

    var mag1 = vector1.magnitude();
    var mag2 = vector2.magnitude();
    var dot = Vector3.dot(vector1, vector2);
    //console.log("Dot product of V1 and V2: ", dot);
    var angle = Math.acos(dot / (mag1 * mag2));
    angle = angle * 180 / Math.PI;
    console.log("Angle between V1 and V2: ", angle);

}

function areaTriangle(vector1, vector2) {
    var area = Vector3.cross(vector1, vector2);
    area = area.magnitude() / 2;
    console.log("Area of Triangle: ", area);
}

function handleDrawEvent() {

    var canvas = document.getElementById("example");
    if (!canvas) {
        console.log("Failed to retrieve the <canvas> element");
        return;
    }

    // Get the rendering context for 2D
    var ctx = canvas.getContext('2d')
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    var vec_x = document.getElementById("vec_x").value;
    var vec_y = document.getElementById("vec_y").value;
    drawVector(new Vector3([vec_x, vec_y, 0]), "red");

    var vec_x2 = document.getElementById("vec_x2").value;
    var vec_y2 = document.getElementById("vec_y2").value;
    drawVector(new Vector3([vec_x2, vec_y2, 0]), "blue");
}

function handleDrawOperationsEvent() {

    var canvas = document.getElementById("example");
    if (!canvas) {
        console.log("Failed to retrieve the <canvas> element");
        return;
    }

    // Get the rendering context for 2D
    var ctx = canvas.getContext('2d')
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var operation = document.getElementById("operation").value;
    var vec_x = document.getElementById("vec_x").value;
    var vec_y = document.getElementById("vec_y").value;
    var vec_x2 = document.getElementById("vec_x2").value;
    var vec_y2 = document.getElementById("vec_y2").value;
    var scalar = document.getElementById("scalar").value;

    drawVector(new Vector3([vec_x, vec_y, 0]), "red");
    drawVector(new Vector3([vec_x2, vec_y2, 0]), "blue");

    var vector1 = new Vector3([vec_x, vec_y, 0]);
    var vector2 = new Vector3([vec_x2, vec_y2, 0]);

    if (operation == "Add") {
        var result = vector1.add(vector2);
        drawVector(result, "green");
    } else if (operation == "Subtract") {
        var result = vector1.sub(vector2);
        drawVector(result, "green");
    } else if (operation == "Divide") {
        vector1 = vector1.div(scalar);
        vector2 = vector2.div(scalar);
        drawVector(vector1, "green");
        drawVector(vector2, "green");
    } else if (operation == "Multiply") {
        var vector3 = new Vector3([vec_x * scalar, vec_y * scalar, 0]);
        var vector4 = new Vector3([vec_x2 * scalar, vec_y2 * scalar, 0]);
        //console.log(vector3.elements[0], vector3.elements[1], scalar);
        //console.log(vector4.elements[0], vector4.elements[1], scalar);
        drawVector(vector3, "green");
        drawVector(vector4, "green");
    } else if (operation == "Magnitude") {
        var magnitude1 = vector1.magnitude();
        var magnitude2 = vector2.magnitude();
        console.log("Magnitude of V1: ", magnitude1);
        console.log("Magnitude of V2: ", magnitude2);
    } else if (operation == "Normalize") {
        vector1 = vector1.normalize();
        vector2 = vector2.normalize();
        drawVector(vector1, "green");
        drawVector(vector2, "green");
    } else if (operation == "Angle Between") {
        angleBetween(vector1, vector2);
    } else if (operation == "Area") {
        areaTriangle(vector1, vector2);
    }
}

function main() {


    // Retrieve <canvas> element
    var canvas = document.getElementById("example");
    if (!canvas) {
        console.log("Failed to retrieve the <canvas> element");
        return;
    }

    // Get the rendering context for 2D
    var ctx = canvas.getContext('2d');

    // Draw a black rectangle
    ctx.fillStyle = "rgba(0,0,0,1.0)";
    ctx.fillRect(0, 0, 400, 400);

}

