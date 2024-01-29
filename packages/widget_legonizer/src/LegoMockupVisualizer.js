import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import './LegoVisualizerScene.css';
import { Planar } from '@ud-viz/frame3d';

export class LegoMockupVisualizer {
  /**
   * Initializes properties and sets up the HTML and THREE.js scene.
   *
   * @param {Planar} planar - The "planar" parameter is likely a reference to a planar object or a planar
   * surface. It could be used to define the dimensions, position, or other properties of the planar
   * object within the constructor.
   */
  constructor(planar) {
    this.planar = planar;

    this.sceneElement = null;

    this.scene = null;

    this.camera = null;
    this.otbitControls = null;

    this.constructHtml();

    this.createTHREEScene();
  }

  constructHtml() {
    // This.planar.rootHtml
    this.sceneElement = document.createElement('div');
    this.sceneElement.id = 'legoVisualizerScene';

    this.planar.domElement.appendChild(this.sceneElement);
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

    this.orbit = new OrbitControls(this.camera, renderer.domElement);
    this.orbit.update();
    this.orbit.addEventListener('change', () => {
      renderer.render(this.scene, this.camera);
    });

    renderer.render(this.scene, this.camera);
  }

  addLegoPlateSimulation(heightMap, xPlates, yPlates) {
    const geometry = new THREE.BoxGeometry(32, 1, 32);
    const material = new THREE.MeshPhongMaterial({ color: 'brown' });
    const terrain = new THREE.Mesh(geometry, material);

    terrain.position.set(xPlates * 32, -1, yPlates * 32);
    this.scene.add(terrain);

    const mockUpLego = new THREE.Group();
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
              -j + yPlates * 32
            );
            mockUpLego.add(cube);
          }
        }
      }
    }

    const targetPosition = new THREE.Box3()
      .setFromObject(mockUpLego.clone())
      .getCenter(mockUpLego.clone().position);

    this.orbit.target.copy(targetPosition);
    this.orbit.update();

    this.scene.add(mockUpLego);
  }
}
