import {
  DirectionalLight,
  Color,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  BoxGeometry,
  MeshPhongMaterial,
  Mesh,
  Group,
  Box3,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/** Creates a Three.js scene for visualizing Lego mockups */
export class LegoMockupVisualizer {
  constructor(domElement) {
    /** @type {HTMLDivElement} */
    this.domElement = domElement;

    /** @type {Scene} */
    this.scene = null;
    /** @type {PerspectiveCamera} */
    this.camera = null;
    /** @type {OrbitControls} */
    this.otbitControls = null;

    this.createTHREEScene();
  }

  /**
   * Creates a three.js scene with a camera, renderer, lights, and orbit controls.
   */
  createTHREEScene() {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(
      75,
      this.domElement.clientWidth / this.domElement.clientHeight,
      0.1,
      1000
    );

    this.scene.background = new Color('lightblue');

    this.camera.position.set(20, 10, 20);
    this.camera.lookAt(0, 2, 0);

    const light = new DirectionalLight(0xffffff, 1);
    light.position.set(-20, 20, 20);
    const light2 = light.clone();
    light2.position.set(20, 20, -20);
    this.scene.add(light);
    this.scene.add(light2);

    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(
      this.domElement.clientWidth,
      this.domElement.clientHeight,
      false
    );
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.width = '100%';
    this.domElement.appendChild(renderer.domElement);
    new ResizeObserver(() => {
      renderer.setSize(
        this.domElement.clientWidth,
        this.domElement.clientHeight,
        false
      );
      renderer.render(this.scene, this.camera);
    }).observe(this.domElement);

    this.orbit = new OrbitControls(this.camera, renderer.domElement);
    this.orbit.update();
    this.orbit.addEventListener('change', () => {
      renderer.render(this.scene, this.camera);
    });

    renderer.render(this.scene, this.camera);
  }

  /**
   * Adds Lego blocks to threejs scene based on a given heightmap.
   *
   * @param {Array<Array<number>>} heightMap 2D array representing the height values of the terrain.
   * @param {number} xPlates - The number of Lego plates to be added horizontally in the mockup.
   * @param {number} yPlates -  The number of Lego plates to be added vertically in the mockup.
   */
  addLegoPlateSimulation(heightMap, xPlates, yPlates) {
    const geometry = new BoxGeometry(32, 1, 32);
    const material = new MeshPhongMaterial({ color: 'brown' });
    const terrain = new Mesh(geometry, material);

    terrain.position.set(xPlates * 32, -1, yPlates * 32);
    this.scene.add(terrain);

    const mockUpLego = new Group();
    for (let j = 0; j < heightMap.length; j++) {
      const heightMapX = heightMap[j];
      for (let i = 0; i < heightMapX.length; i++) {
        const value = heightMapX[i];
        if (value != 0) {
          for (let h = 0; h < value; h++) {
            const geometry = new BoxGeometry(1, 1.230769230769231, 1);
            const material = new MeshPhongMaterial({ color: 'green' });
            const cube = new Mesh(geometry, material);
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

    const targetPosition = new Box3()
      .setFromObject(mockUpLego.clone())
      .getCenter(mockUpLego.clone().position);

    this.orbit.target.copy(targetPosition);
    this.orbit.update();

    this.scene.add(mockUpLego);
  }

  dispose() {
    this.domElement.innerHTML = null;
    this.orbit.dispose();
  }
}
