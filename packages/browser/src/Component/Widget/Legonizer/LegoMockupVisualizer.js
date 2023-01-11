import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
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

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(
      this.sceneElement.clientWidth,
      this.sceneElement.clientHeight
    );
    this.sceneElement.appendChild(renderer.domElement);

    this.camera.position.z = -20;
    this.camera.position.y = 15;

    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(1, 1, 1);
    this.scene.add(light);

    const geometry = new THREE.BoxGeometry(32, 1, 32);
    const material = new THREE.MeshPhongMaterial({ color: 'brown' });
    const terrain = new THREE.Mesh(geometry, material);

    terrain.position.y = -1;

    this.scene.add(terrain);

    const orbit = new OrbitControls(this.camera, renderer.domElement);
    orbit.update();
    orbit.addEventListener('change', () => {
      renderer.render(this.scene, this.camera);
    });

    renderer.render(this.scene, this.camera);
    this.camera.lookAt(terrain);
  }

  addLegoPlateSimulation(heightMap) {
    for (let j = 0; j < heightMap.length; j++) {
      const heightMapX = heightMap[j];
      for (let i = 0; i < heightMapX.length; i++) {
        const value = heightMapX[i];
        if (value != 0) {
          for (let h = 0; h < value; h++) {
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshPhongMaterial({ color: 'green' });
            const cube = new THREE.Mesh(geometry, material);

            cube.position.x = i - 16;
            cube.position.y = h;
            cube.position.z = j - 16;
            this.scene.add(cube);
          }
        }
      }
    }
  }
}
