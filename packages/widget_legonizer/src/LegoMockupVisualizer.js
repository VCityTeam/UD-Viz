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
  OrthographicCamera,
  WireframeGeometry,
  LineSegments,
  LineBasicMaterial,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/** Creates a Three.js scene for visualizing Lego mockups */
export class LegoMockupVisualizer {
  /**
   * Sets up a Three.js scene to visualize the lego mock up.
   *
   * @param {HTMLElement} domElement - HTML element that will be used as the container for the Three.js scene.
   */
  constructor(domElement) {
    /** @type {HTMLDivElement} */
    this.domElement = domElement;

    /** @type {Scene} */
    this.scene = null;
    /** @type {PerspectiveCamera} */
    this.camera = null;
    /** @type {OrbitControls} */
    this.otbitControls = null;

    /** @type {Scene} */
    this.sceneCadastre = null;
    /** @type {OrthographicCamera} */
    this.cameraCadastre = null;

    /** @type {Group<Object3DEventMap>} */
    this.mockUpLego = null;

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
   */
  addLegoPlateSimulation(heightMap) {
    if (!heightMap.length) return;

    const mockUpLego = new Group();
    for (let j = 0; j < heightMap.length; j++) {
      const heightMapX = heightMap[j];
      for (let i = 0; i < heightMapX.length; i++) {
        const value = heightMapX[i];
        if (value != 0) {
          const geometry = new BoxGeometry(1, value * 1.230769230769231, 1); // a lego brick is not a perfect cube. this number is calculated to have a dimension to a real lego
          const material = new MeshPhongMaterial({ color: 'white' });
          const cube = new Mesh(geometry, material);
          cube.position.set(i, value / 2, -j);
          mockUpLego.add(cube);
        }
      }
    }

    const geometry = new BoxGeometry(heightMap[0].length, 1, heightMap.length);
    const material = new MeshPhongMaterial({ color: 'brown' });
    const terrain = new Mesh(geometry, material);

    terrain.position.set(heightMap[0].length / 2, -1, -heightMap.length / 2);
    terrain.updateMatrix();
    this.scene.add(terrain);

    const targetPosition = new Box3()
      .setFromObject(mockUpLego.clone())
      .getCenter(mockUpLego.clone().position);

    this.orbit.target.copy(targetPosition);
    this.orbit.update();

    this.mockUpLego = mockUpLego;
    this.scene.add(mockUpLego);
  }

  /**
   * Generate cadastre image from lego mockup
   *
   * @param {Array<Array<number>>} heightMap 2D array representing the height values of the terrain.
   */
  generateCadastre(heightMap) {
    // Create cadastre scene
    const rtScene = new Scene();
    const xplates = heightMap[0].length / 32;
    const yplates = heightMap.length / 32;

    const frustumSize = 32;

    const rtCamera = new OrthographicCamera(
      -frustumSize * xplates,
      frustumSize * xplates,
      frustumSize * yplates,
      -frustumSize * yplates,
      1,
      1000
    );

    rtScene.background = new Color('white');

    rtCamera.position.set(heightMap[0].length / 2, 11, -heightMap.length / 2);
    rtCamera.lookAt(heightMap[0].length / 2, 0, -heightMap.length / 2);

    const light = new DirectionalLight(0xffffff, 1);
    light.position.set(-20, 20, 20);
    rtScene.add(light);

    const cloneMockup = this.mockUpLego.clone();
    cloneMockup.children.forEach((mesh) => {
      const wireframe = new WireframeGeometry(mesh.geometry);
      const line = new LineSegments(
        wireframe,
        new LineBasicMaterial({ color: 'black' })
      );
      line.material.depthTest = false;
      line.material.opacity = 0.25;
      line.material.transparent = true;
      line.position.copy(mesh.position);
      rtScene.add(line);
    });

    rtScene.add(cloneMockup);

    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(heightMap[0].length * 50, heightMap.length * 50, false);
    renderer.render(rtScene, rtCamera);

    // upload image
    const strMime = 'image/jpeg';
    const imgData = renderer.domElement.toDataURL(strMime);

    const link = document.createElement('a');
    document.body.appendChild(link);
    link.download = 'calques.jpg';
    link.href = imgData;
    link.click();
  }

  /**
   * Clears the inner HTML of a DOM element and disposes of an orbit object.
   */
  dispose() {
    this.domElement.innerHTML = null;
    this.orbit.dispose();
  }
}
