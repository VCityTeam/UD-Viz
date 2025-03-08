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
  Vector3,
  BufferGeometryLoader,
  Vector2,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { extrudeHeightMap } from '@ud-viz/legonizer';
import { cameraFitRectangleXZ } from '@ud-viz/utils_browser';

/** Creates a Three.js scene for visualizing Lego mockups */
export class LegoMockupVisualizer {
  /**
   * Sets up a Three.js scene to visualize the lego mock up.
   *
   * @param {HTMLElement} domElement - HTML element that will be used as the container for the Three.js scene.
   * @param {Object} options - options
   * @param {String} options.workerScriptURL - can be use to threadify the computation of the mockup
   */
  constructor(domElement, options = {}) {
    /** @type {HTMLDivElement} */
    this.domElement = domElement;

    /** @type {Scene} */
    this.scene = null;
    /** @type {PerspectiveCamera} */
    this.camera = null;
    /** @type {WebGLRenderer} */
    this.renderer = null;
    /** @type {OrbitControls} */
    this.orbit = null;

    /** @type {Scene} */
    this.sceneCadastre = null;
    /** @type {OrthographicCamera} */
    this.cameraCadastre = null;

    /** @type {Group<Object3DEventMap>} */
    this.mockUpLego = null; // TODO really necessary ?

    /** @type {String} - can be use to threadify the computation of the mockup */
    this.workerScriptURL = options.workerScriptURL || null;

    /** @type {Worker} */
    this.worker = null;

    /** @type {Function} */
    this.workerResolve = null;

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
      2000
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
    this.renderer = renderer;
  }

  /**
   * Adds Lego blocks to threejs scene based on a given heightmap.
   *
   * @param {Array<Array<number>>} heightMap 2D array representing the height values of the terrain.
   */
  async addLegoPlateSimulation(heightMap) {
    const mockupMaterial = new MeshPhongMaterial({ color: 'white' });
    const mockUpMesh = new Group();
    this.scene.add(mockUpMesh);

    const heightMapWidth = heightMap[0].length;
    const heightMapHeight = heightMap.length;

    // TODO do a proper function
    cameraFitRectangleXZ(
      this.camera,
      new Vector2(0, 0),
      new Vector2(heightMapWidth, heightMapHeight)
    );
    const geometry = new BoxGeometry(heightMapWidth, 1, heightMapHeight);
    const material = new MeshPhongMaterial({
      color: 'brown',
    });
    const terrain = new Mesh(geometry, material);
    const box3 = new Box3(
      new Vector3(0, 0, 0),
      new Vector3(heightMapWidth, 0, heightMapHeight)
    );
    box3.getCenter(terrain.position);
    terrain.updateMatrix();
    this.scene.add(terrain);
    // update controls
    this.orbit.target.copy(box3.getCenter(new Vector3()));
    this.orbit.update();

    return new Promise((resolve, reject) => {
      // ref to dispose properly
      this.workerResolve = resolve;

      if (window.Worker && this.workerScriptURL) {
        // new thread to avoid freeze
        this.worker = new window.Worker(this.workerScriptURL);
        const loader = new BufferGeometryLoader();
        this.worker.postMessage([heightMap]);
        this.worker.onmessage = (e) => {
          // TODO make a message structure system
          if (e.data == 'close') {
            this.workerResolve = null;
            this.worker = null;
            resolve(true);
          } else {
            mockUpMesh.add(new Mesh(loader.parse(e.data), mockupMaterial));
            this.renderer.render(this.scene, this.camera); // to see meshes addition
          }
        };
      } else {
        const geometries = extrudeHeightMap(heightMap);
        geometries.forEach((g) => mockUpMesh.add(new Mesh(g, mockupMaterial)));
        this.workerResolve = null;
        resolve(true);
      }
    });

    // this.mockUpLego = mockUpLego; look like it is only use in generateCadastre
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
      -(frustumSize * xplates) / 2,
      (frustumSize * xplates) / 2,
      (frustumSize * yplates) / 2,
      -(frustumSize * yplates) / 2,
      1,
      1000
    );

    rtScene.background = new Color('white');

    rtCamera.position.set(
      (heightMap[0].length - 1) / 2,
      11,
      -(heightMap.length - 1) / 2
    );
    rtCamera.lookAt(
      (heightMap[0].length - 1) / 2,
      0,
      -(heightMap.length - 1) / 2
    );

    const light = new DirectionalLight(0xffffff, 1);
    light.position.set(-20, 20, 20);
    rtScene.add(light);

    const cloneMockup = this.mockUpLego.clone();
    rtScene.add(cloneMockup);

    // create wireframe for better visualization
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

    let scale = 1920;
    const renderer = new WebGLRenderer({ antialias: true });
    if (heightMap[0].length > heightMap.length)
      scale /= heightMap[0].length / 32;
    else scale /= heightMap.length / 32;

    renderer.setSize(xplates * scale, yplates * scale, false);
    renderer.render(rtScene, rtCamera);

    // upload image
    const strMime = 'image/jpeg';
    const imgData = renderer.domElement.toDataURL(strMime);

    const link = document.createElement('a');
    document.body.appendChild(link);
    link.download = 'calqueTemplate.jpg';
    link.href = imgData;
    link.click();
  }

  /**
   * Clears the inner HTML of a DOM element and disposes of an orbit object.
   */
  dispose() {
    if (this.worker) this.worker.terminate();
    if (this.workerResolve) this.workerResolve(false); // false indicate computation didnt go to the end
    while (this.domElement.firstChild) this.domElement.firstChild.remove(); // clear canvas
    this.orbit.dispose();
  }
}
