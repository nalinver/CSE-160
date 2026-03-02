class Sphere {
    constructor() {
        this.type = 'sphere';
        //this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        //this.size = 5.0;
        this.matrix = new Matrix4();
        this.textureNum = -2;
        this.verts32 = new Float32Array([]);
    }

    render() {

        var rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0] * 0.75, rgba[1] * 0.75, rgba[2] * 0.75, rgba[3]);

        // Pass the model matrix to u_ModelMatrix variable
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var d = Math.PI / 10;
        var dd = Math.PI / 10;

        for (var i = 0; i < Math.PI; i += d) {
            for (var j = 0; j < 2 * Math.PI; j += d) {
                var p1 = [Math.sin(i) * Math.cos(j), Math.sin(i) * Math.sin(j), Math.cos(i)];
                var p2 = [Math.sin(i + dd) * Math.cos(j), Math.sin(i + dd) * Math.sin(j), Math.cos(i + dd)];
                var p3 = [Math.sin(i) * Math.cos(j + dd), Math.sin(i) * Math.sin(j + dd), Math.cos(i)];
                var p4 = [Math.sin(i + dd) * Math.cos(j + dd), Math.sin(i + dd) * Math.sin(j + dd), Math.cos(i + dd)];

                var uv1 = [i / Math.PI, j / (Math.PI * 2)];
                var uv2 = [(i + dd) / Math.PI, (j) / (Math.PI * 2)];
                var uv3 = [(i) / Math.PI, (j + dd) / (Math.PI * 2)];
                var uv4 = [(i + dd) / Math.PI, (j + dd) / (Math.PI * 2)];

                var v = [];
                var uv = [];

                v = v.concat(p1); uv = uv.concat(uv1);
                v = v.concat(p2); uv = uv.concat(uv2);
                v = v.concat(p4); uv = uv.concat(uv4);

                gl.uniform4f(u_FragColor, 1, 1, 1, 1);
                drawTriangle3DUV_Normal(v, uv, v);

                v = []; uv = [];
                v = v.concat(p1); uv = uv.concat(uv1);
                v = v.concat(p3); uv = uv.concat(uv3);
                v = v.concat(p4); uv = uv.concat(uv4);

                gl.uniform4f(u_FragColor, 1, 0, 0, 1);
                drawTriangle3DUV_Normal(v, uv, v);
            }
        }

    }
}