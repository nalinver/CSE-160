class Camera {
    constructor() {
        this.fov = 60.0;
        this.eye = new Vector3([0, 0, 0]);
        this.at = new Vector3([0, 0, -1]);
        this.up = new Vector3([0, 1, 0]);

        this.viewMatrix = new Matrix4();
        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );

        var canvas = document.getElementById('webgl');
        var aspect = canvas ? (canvas.width / canvas.height) : 1.0;
        this.projectionMatrix = new Matrix4();
        this.projectionMatrix.setPerspective(this.fov, aspect, 0.1, 1000);
    }

    updateViewMatrix() {
        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0], this.at.elements[1], this.at.elements[2],
            this.up.elements[0], this.up.elements[1], this.up.elements[2]
        );
    }

    moveForward(speed) {
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(speed);
        this.eye.add(f);
        this.at.add(f);
        this.updateViewMatrix();
    }

    moveBackwards(speed) {
        var b = new Vector3();
        b.set(this.eye);
        b.sub(this.at);
        b.normalize();
        b.mul(speed);
        this.eye.add(b);
        this.at.add(b);
        this.updateViewMatrix();
    }

    moveLeft(speed) {
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        var s = Vector3.cross(this.up, f);
        s.normalize();
        s.mul(speed);
        this.eye.add(s);
        this.at.add(s);
        this.updateViewMatrix();
    }

    moveRight(speed) {
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        var s = Vector3.cross(f, this.up);
        s.normalize();
        s.mul(speed);
        this.eye.add(s);
        this.at.add(s);
        this.updateViewMatrix();
    }

    panLeft(alpha) {
        alpha = alpha !== undefined ? alpha : 5;
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        var fPrime = rotationMatrix.multiplyVector3(f);
        this.at.set(this.eye);
        this.at.add(fPrime);
        this.updateViewMatrix();
    }

    panRight(alpha) {
        alpha = alpha !== undefined ? alpha : 5;
        var f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        var rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(-alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
        var fPrime = rotationMatrix.multiplyVector3(f);
        this.at.set(this.eye);
        this.at.add(fPrime);
        this.updateViewMatrix();
    }
}
