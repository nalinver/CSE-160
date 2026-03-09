import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

function main() {

    // Setup the canvas and renderer
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas,
        alpha: true,
    });

    // Load the texture
    const loader = new THREE.TextureLoader();
    const texture = loader.load('resources/LionWall.jpg')

    // Set the size of the canvas
    function setSize() {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (canvas.width !== width || canvas.height !== height) {
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
    }


    // Set up the camera 
    const fov = 75;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const near = 0.1;
    const far = 30;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2;

    // Set up the controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.update();

    // Set up the scene
    const scene = new THREE.Scene();
    const backgroundTexture = loader.load('resources/Downtown-Boston-Skylines.jpg');
    backgroundTexture.colorSpace = THREE.SRGBColorSpace;
    scene.background = backgroundTexture;

    // Set up the Scene Lights
    {
        const ambient = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambient);
        const color = 0xFFFFFF;
        const intensity = 1.5;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
    }

    // Set up the GUI
    // Helper class for the GUI
    class ColorGUIHelper {

        constructor(object, prop) {

            this.object = object;
            this.prop = prop;

        }
        get value() {

            return `#${this.object[this.prop].getHexString()}`;

        }
        set value(hexString) {

            this.object[this.prop].set(hexString);

        }

    }

    // Function to make the GUI for the XYZ values
    function makeXYZGUI(gui, vector3, name, onChangeFn) {
        const folder = gui.addFolder(name);
        folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
        folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
        folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
        folder.open();
    }

    // Set up the Overhead Light
    {

        // Set up the colors and intensity for the Overhead Light
        const color = 0xB1E1ff;
        const groundColor = 0xB97A20;
        const intensity = 1;

        // Set up the Hemisphere Light
        const OverheadLight = new THREE.HemisphereLight(color, groundColor, intensity);

        // Set up the Ambient Light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

        // Set up the Directional Light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        directionalLight.target.position.set(-5, 0, 0);

        // Add the lights to the scene
        scene.add(ambientLight);
        scene.add(OverheadLight);
        scene.add(directionalLight);
        scene.add(directionalLight.target);

        // Set up the GUI for the Overhead Light
        const gui = new GUI();
        gui.addColor(new ColorGUIHelper(directionalLight, 'color'), 'value').name('directionalColor');

        gui.add(directionalLight, 'intensity', 0, 5, 0.01);
        gui.add(directionalLight.target.position, 'x', -10, 10);
        gui.add(directionalLight.target.position, 'y', -10, 10);
        gui.add(directionalLight.target.position, 'z', 0, 10);

        gui.addColor(new ColorGUIHelper(ambientLight, 'color'), 'value').name('ambientColor');
        gui.addColor(new ColorGUIHelper(OverheadLight, 'color'), 'value').name('color');
        gui.addColor(new ColorGUIHelper(OverheadLight, 'groundColor'), 'value').name('groundColor');

        gui.add(OverheadLight, 'intensity', 0, 5, 0.01);

        const helper = new THREE.DirectionalLightHelper(directionalLight);
        scene.add(helper);

        // Function to update the lights
        function updateLight() {

            directionalLight.target.updateMatrixWorld();
            helper.update();

        }
        updateLight();

        // Make GUI for the Overhead Light
        makeXYZGUI(gui, directionalLight.position, 'position', updateLight);
        makeXYZGUI(gui, directionalLight.target.position, 'target', updateLight);

    }


    // Set up the Floor
    {
        // Set up the size and geometry of the floor
        const floorSize = 40;
        const floorGeo = new THREE.PlaneGeometry(floorSize, floorSize);
        const floorMat = new THREE.MeshStandardMaterial({
            color: 0x000000,
            roughness: 0.9,
            metalness: 0.05,
            side: THREE.DoubleSide,
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI * 0.5;
        floor.position.y = -1;
        scene.add(floor);
    }

    // Load the Beetle Model
    const modelPath = 'resources/model/';
    let beetleModel = null;
    const beetleBaseY = -0.5;

    // Function to add the model to the scene and set the color to green
    function addModelToScene(object) {
        beetleModel = object;
        scene.add(object);
        object.position.set(0, beetleBaseY, 0);
        object.scale.set(0.02, 0.02, 0.02);
    }

    // Function to load the OBJ file with the materials
    function loadObjWithMaterials(materials) {
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath(modelPath);
        objLoader.load('Beetle.obj', (object) => addModelToScene(object),
            undefined,
            (err) => console.error('OBJ load error:', err));
    }

    // Load the MTL file
    const mtlLoader = new MTLLoader();
    mtlLoader.setPath(modelPath);
    mtlLoader.setResourcePath(modelPath);
    mtlLoader.load('Beetle.mtl', (materials) => {
        materials.preload();
        loadObjWithMaterials(materials);
    }, undefined, (err) => {
        console.error('MTL load error:', err);
    });


    // Set up the Sphere
    {

        // Set up the size and geometry of the sphere
        const sphereRadius = 3;
        const sphereWidthDivisions = 32;
        const sphereHeightDivisions = 16;
        const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
        const sphereMat = new THREE.MeshPhongMaterial({ color: '#CA8' });
        const mesh = new THREE.Mesh(sphereGeo, sphereMat);
        mesh.position.set(- sphereRadius - 1, sphereRadius + 2, 0);
        scene.add(mesh);

    }


    // Function to make the instances of the boxes
    function makeInstance(geometry, material, x, y, z) {

        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        cube.position.x = x;
        cube.position.y = y;
        cube.position.z = z;

        return cube;

    }

    // Set up the size and geometry of the boxes
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    // Set up the material for the boxes
    const material = new THREE.MeshBasicMaterial({
        map: texture,
    })
    const cubes = [
        makeInstance(geometry, material, -2, 0, 0),
        makeInstance(geometry, material, 2, 0, 0),
        makeInstance(geometry, material, 4, 0, 0),
        makeInstance(geometry, material, 6, 0, 0),
        makeInstance(geometry, material, 8, 0, 0),
        makeInstance(geometry, material, 10, 0, 0),
        makeInstance(geometry, material, 12, 0, 0),
        makeInstance(geometry, material, 14, 0, 0),
        makeInstance(geometry, material, 16, 0, 0),
        makeInstance(geometry, material, 18, 0, 0),
    ];


    const cylinderGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.2, 32);
    const cylinderMaterial = new THREE.MeshStandardMaterial({
        map: texture,
    });
    const cylinders = [
        makeInstance(cylinderGeometry, cylinderMaterial, -2, 1.2, 2),
        makeInstance(cylinderGeometry, cylinderMaterial, 2, 1.2, 2),
        makeInstance(cylinderGeometry, cylinderMaterial, 4, 1.2, 2),
        makeInstance(cylinderGeometry, cylinderMaterial, 6, 1.2, 2),
        makeInstance(cylinderGeometry, cylinderMaterial, 8, 1.2, 2),
        makeInstance(cylinderGeometry, cylinderMaterial, 10, 1.2, 2),
        makeInstance(cylinderGeometry, cylinderMaterial, 12, 1.2, 2),
        makeInstance(cylinderGeometry, cylinderMaterial, 14, 1.2, 2),
        makeInstance(cylinderGeometry, cylinderMaterial, 16, 1.2, 2),
        makeInstance(cylinderGeometry, cylinderMaterial, 18, 1.2, 2),
    ];

    const bgTexture = loader.load('resources/Downtown-Boston-Skylines.jpg');
    bgTexture.colorSpace = THREE.SRGBColorSpace;
    scene.background = bgTexture;

    window.addEventListener('resize', setSize);
    setSize();

    function render(time) {

        time *= 0.0004; // convert time to seconds

        // Rotate the boxes
        cubes.forEach((cube, ndx) => {

            const speed = 1 + ndx * .1;
            const rot = time * speed;
            cube.rotation.x = rot;
            cube.rotation.y = rot;

        });

        // Rotate the cylinders
        cylinders.forEach((cylinder, ndx) => {
            const speed = 1 + ndx * .1;
            const rot = time * speed;
            cylinder.rotation.x = rot;
            cylinder.rotation.y = rot;
        });

        // Set the background texture
        const canvasAspect = canvas.clientWidth / canvas.clientHeight;
        const imageAspect = bgTexture.image ? bgTexture.image.width / bgTexture.image.height : 1;
        const aspect = imageAspect / canvasAspect;

        bgTexture.offset.x = aspect > 1 ? (1 - 1 / aspect) / 2 : 0;
        bgTexture.repeat.x = aspect > 1 ? 1 / aspect : 1;

        bgTexture.offset.y = aspect > 1 ? 0 : (1 - aspect) / 2;
        bgTexture.repeat.y = aspect > 1 ? 1 : aspect;

        controls.update();
        renderer.render(scene, camera);

        requestAnimationFrame(render);

    }

    requestAnimationFrame(render); // Start the animation loop


    // Helper class for the GUI
    class MinMaxGUIHelper {
        constructor(obj, minProp, maxProp, minDif) {
            this.obj = obj;
            this.minProp = minProp;
            this.maxProp = maxProp;
            this.minDif = minDif;
        }
        get min() {
            return this.obj[this.minProp];
        }
        set min(v) {
            this.obj[this.minProp] = v;
            this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
        }
        get max() {
            return this.obj[this.maxProp];
        }
        set max(v) {
            this.obj[this.maxProp] = v;
            this.min = this.min;  // this will call the min setter
        }

    }



    // Function to update the camera
    function updateCamera() {
        camera.updateProjectionMatrix();
    }

    // Set up the GUI for the camera
    const gui = new GUI();
    gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
    const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
    gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
    gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);


}

main();