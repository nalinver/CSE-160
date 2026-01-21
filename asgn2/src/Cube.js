class Cube {
    constructor() {

        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();

    }

    render() {

        var rgba = this.color;

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0] * 0.75, rgba[1] * 0.75, rgba[2] * 0.75, rgba[3]);

        // Pass the model matrix to u_ModelMatrix variable
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // draw the cube
        // Define cube vertices (0,0,0) to (1,1,1)
        // v0: (0,0,0), v1: (1,0,0), v2: (1,1,0), v3: (0,1,0)
        // v4: (0,0,1), v5: (1,0,1), v6: (1,1,1), v7: (0,1,1)

        // Front face (z=0)
        drawTriangle3D([0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0]);
        drawTriangle3D([0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0]);

        // Back face (z=1)
        drawTriangle3D([0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0]);
        drawTriangle3D([0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0, 1.0]);

        // Top face (y=1)
        drawTriangle3D([0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0, 1.0]);
        drawTriangle3D([0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0]);

        // Bottom face (y=0)
        drawTriangle3D([0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0]);
        drawTriangle3D([0.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0]);

        // Right face (x=1)
        drawTriangle3D([1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0]);
        drawTriangle3D([1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.0]);

        // Left face (x=0)
        drawTriangle3D([0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0]);
        drawTriangle3D([0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0]);
    }
}