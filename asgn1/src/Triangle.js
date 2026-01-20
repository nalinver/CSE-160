class Triangle {
    constructor() {

        this.type = 'triangle';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;

    }

    render() {
        const rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        let vertsFlat;

        // Store hardcoded triangle vertices in vertsFlat array
        if (this.verts) {
            const v = this.verts;
            vertsFlat = new Float32Array([
                v[0][0], v[0][1],
                v[1][0], v[1][1],
                v[2][0], v[2][1],
            ]);
        } else {
            const x = this.position[0];
            const y = this.position[1];
            const d = this.size / 200.0;
            vertsFlat = new Float32Array([
                x, y + d,
                x - d, y - d,
                x + d, y - d,
            ]);
        }

        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertsFlat, gl.DYNAMIC_DRAW);

        gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.drawArrays(gl.TRIANGLES, 0, 3);

        gl.deleteBuffer(vertexBuffer);
    }

}

function drawTriangle(vertices) {

    var n = 3; // The number of vertices

    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, n);

}
