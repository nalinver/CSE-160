import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

function main() {
    const canvas = document.querySelector('#c');
    //const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas,
        alpha: true,
    });
    //renderer.outputColorSpace = THREE.SRGBColorSpace;

    function setSize() {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (canvas.width !== width || canvas.height !== height) {
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
    }

    const loader = new THREE.TextureLoader();
    const texture = loader.load('resources/LionWall.jpg')
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshBasicMaterial({
        map: texture,
    })


    const fov = 75;
    const aspect = canvas.clientWidth / canvas.clientHeight;
    const near = 0.1;
    const far = 30;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.z = 2;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.update();

    const scene = new THREE.Scene();
    const backgroundTexture = loader.load('resources/Downtown-Boston-Skylines.jpg');
    backgroundTexture.colorSpace = THREE.SRGBColorSpace;
    scene.background = backgroundTexture;

    {
        const ambient = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambient);
        const color = 0xFFFFFF;
        const intensity = 1.5;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
    }

    //const OverheadLight = new THREE.AmbientLight(0xffffff, 0.5);
    //scene.add(OverheadLight);

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

    function makeXYZGUI(gui, vector3, name, onChangeFn) {
        const folder = gui.addFolder(name);
        folder.add(vector3, 'x', -10, 10).onChange(onChangeFn);
        folder.add(vector3, 'y', 0, 10).onChange(onChangeFn);
        folder.add(vector3, 'z', -10, 10).onChange(onChangeFn);
        folder.open();
    }

    {




        const color = 0xB1E1ff;
        const groundColor = 0xB97A20;
        const intensity = 1;
        const OverheadLight = new THREE.HemisphereLight(color, groundColor, intensity);
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        directionalLight.target.position.set(-5, 0, 0);
        scene.add(ambientLight);
        scene.add(OverheadLight);
        scene.add(directionalLight);
        scene.add(directionalLight.target);

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

        function updateLight() {

            directionalLight.target.updateMatrixWorld();
            helper.update();

        }

        updateLight();

        makeXYZGUI(gui, directionalLight.position, 'position', updateLight);
        makeXYZGUI(gui, directionalLight.target.position, 'target', updateLight);



    }

    {
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
        floor.position.y = -0.6;
        scene.add(floor);
    }

    // Load OBJ with MTL materials
    const modelPath = 'resources/model/';
    let beetleModel = null;
    const beetleBaseY = -0.5;

    function addModelToScene(object) {
        object.traverse((child) => {
            if (!child.isMesh || !child.material) return;
            if (Array.isArray(child.material)) {
                child.material.forEach((mat) => {
                    if (mat && mat.color) mat.color.set(0x90EE90);
                });
            } else if (child.material.color) {
                child.material.color.set(0x90EE90);
            }
        });
        beetleModel = object;
        scene.add(object);
        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
            const scale = 2 / maxDim;
            object.scale.setScalar(scale);
        }
        object.position.set(0, beetleBaseY, 0);

    }

    function loadObjWithMaterials(materials) {
        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath(modelPath);
        objLoader.load('Beetle.obj', (object) => addModelToScene(object),
            undefined,
            (err) => console.error('OBJ load error:', err));
    }

    const mtlLoader = new MTLLoader();
    mtlLoader.setPath(modelPath);
    mtlLoader.setResourcePath(modelPath);
    mtlLoader.load('Beetle.mtl', (materials) => {
        materials.preload();
        loadObjWithMaterials(materials);
    }, undefined, (err) => {
        console.error('MTL load error:', err);
    });

    {

        const sphereRadius = 3;
        const sphereWidthDivisions = 32;
        const sphereHeightDivisions = 16;
        const sphereGeo = new THREE.SphereGeometry(sphereRadius, sphereWidthDivisions, sphereHeightDivisions);
        const sphereMat = new THREE.MeshPhongMaterial({ color: '#CA8' });
        const mesh = new THREE.Mesh(sphereGeo, sphereMat);
        mesh.position.set(- sphereRadius - 1, sphereRadius + 2, 0);
        scene.add(mesh);

    }

    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    function makeInstance(geometry, color, x) {

        //const material = new THREE.MeshPhongMaterial({ color });

        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        cube.position.x = x;

        return cube;

    }

    const cubes = [
        //makeInstance(geometry, 0x44aa88, 0),
        makeInstance(geometry, 0x8844aa, - 2),
        makeInstance(geometry, 0xaa8844, 2),
        makeInstance(geometry, 0x4488aa, 4),
        makeInstance(geometry, 0xaa4488, 6),
        makeInstance(geometry, 0x88aa44, 8),
        makeInstance(geometry, 0x44aa88, 10),
        makeInstance(geometry, 0xaa8844, 12),
        makeInstance(geometry, 0x8844aa, 14),
        makeInstance(geometry, 0xaa4488, 16),
        makeInstance(geometry, 0x88aa44, 18),
    ];

    const bgTexture = loader.load('resources/Downtown-Boston-Skylines.jpg');
    bgTexture.colorSpace = THREE.SRGBColorSpace;
    scene.background = bgTexture;

    window.addEventListener('resize', setSize);
    setSize();

    function render(time) {

        time *= 0.0004; // convert time to seconds

        cubes.forEach((cube, ndx) => {

            const speed = 1 + ndx * .1;
            const rot = time * speed;
            cube.rotation.x = rot;
            cube.rotation.y = rot;

        });

        const canvasAspect = canvas.clientWidth / canvas.clientHeight;
        const imageAspect = bgTexture.image ? bgTexture.image.width / bgTexture.image.height : 1;
        const aspect = imageAspect / canvasAspect;

        bgTexture.offset.x = aspect > 1 ? (1 - 1 / aspect) / 2 : 0;
        bgTexture.repeat.x = aspect > 1 ? 1 / aspect : 1;

        bgTexture.offset.y = aspect > 1 ? 0 : (1 - aspect) / 2;
        bgTexture.repeat.y = aspect > 1 ? 1 : aspect;

        if (beetleModel) {
            // Spin in place around the Y axis.
            beetleModel.position.set(0, beetleBaseY, 0);
            beetleModel.rotation.y = time * 1.2;
        }

        controls.update();
        renderer.render(scene, camera);

        requestAnimationFrame(render);

    }

    requestAnimationFrame(render);


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

    function updateCamera() {
        camera.updateProjectionMatrix();
    }

    const gui = new GUI();
    gui.add(camera, 'fov', 1, 180).onChange(updateCamera);
    const minMaxGUIHelper = new MinMaxGUIHelper(camera, 'near', 'far', 0.1);
    gui.add(minMaxGUIHelper, 'min', 0.1, 50, 0.1).name('near').onChange(updateCamera);
    gui.add(minMaxGUIHelper, 'max', 0.1, 50, 0.1).name('far').onChange(updateCamera);


}

main();