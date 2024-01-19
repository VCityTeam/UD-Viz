import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import * as itowns from 'itowns';
import './LegoVisualizerScene.css';

/**
 * @param {itowns} view3D
 */
export class LegoMockupVisualizer {
  constructor(view3D) {
    this.view3D = view3D;

    this.sceneElement;

    this.scene;

    this.camera;

    this.constructHtml();

    this.createTHREEScene();
  }

  constructHtml() {
    // This.view3D.rootHtml
    this.sceneElement = document.createElement('div');
    this.sceneElement.id = 'legoVisualizerScene';

    this.view3D.rootHtml.appendChild(this.sceneElement);
  }

  createTHREEScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    this.scene.background = new THREE.Color('lightblue');

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      this.sceneElement.clientWidth,
      this.sceneElement.clientHeight
    );
    this.sceneElement.appendChild(renderer.domElement);

    this.camera.position.set(20, 10, 20);
    this.camera.lookAt(0, 2, 0);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(-20, 20, 20);
    const light2 = light.clone();
    light2.position.set(20, 20, -20);
    this.scene.add(light);
    this.scene.add(light2);

    const orbit = new OrbitControls(this.camera, renderer.domElement);
    orbit.update();
    orbit.addEventListener('change', () => {
      renderer.render(this.scene, this.camera);
    });

    const geometry = new THREE.BoxGeometry(1, 1, 2);
    const material = new THREE.MeshPhongMaterial({ color: 'blue' });
    const terrain = new THREE.Mesh(geometry, material);

    terrain.position.set(0, 10, 0);

    const control = new TransformControls(this.camera, renderer.domElement);
    control.addEventListener('change', () => {
      renderer.render(this.scene, this.camera);
    });

    control.addEventListener('dragging-changed', function (event) {
      orbit.enabled = !event.value;
    });

    this.scene.add(terrain);
    control.attach(terrain);
    this.scene.add(control);

    renderer.render(this.scene, this.camera);
    // This.camera.lookAt(terrain);
  }

  addLegoPlateSimulation(heightMap, xPlates, yPlates) {
    const geometry = new THREE.BoxGeometry(32, 1, 32);
    const material = new THREE.MeshPhongMaterial({ color: 'brown' });
    const terrain = new THREE.Mesh(geometry, material);

    terrain.position.set(xPlates * 32, -1, yPlates * 32);
    this.scene.add(terrain);

    for (let j = 0; j < heightMap.length; j++) {
      const heightMapX = heightMap[j];
      for (let i = 0; i < heightMapX.length; i++) {
        const value = heightMapX[i];
        if (value != 0) {
          for (let h = 0; h < value; h++) {
            const geometry = new THREE.BoxGeometry(1, 1.230769230769231, 1);
            const material = new THREE.MeshPhongMaterial({ color: 'green' });
            const cube = new THREE.Mesh(geometry, material);
            cube.position.set(
              i + xPlates * 32,
              h + 0.230769230769231 * h,
              j + yPlates * 32
            );
            this.scene.add(cube);
          }
        }
      }
    }
  }
}
