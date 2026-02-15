class Camera {

    constructor() {
        this.eye = new Vector3(0, 0, 0);
        this.at = new Vector3(0, 0, -1);
        this.up = new Vector3(0, 1, 0);
        
        this.fov = 60;
    }

}