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
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

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
    this.orbit = null;

    /** @type {Scene} */
    this.sceneCadastre = null;
    /** @type {OrthographicCamera} */
    this.cameraCadastre = null;

    /** @type {Group<Object3DEventMap>} */
    this.mockUpLego = null; // TODO really necessary ?

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
  }

  /**
   * Adds Lego blocks to threejs scene based on a given heightmap.
   *
   * @param {Array<Array<number>>} heightMap 2D array representing the height values of the terrain.
   */
  addLegoPlateSimulation(heightMap) {
    const mockupMesh = this.extrudeHeightMap(heightMap);
    this.scene.add(mockupMesh);

    // compute terrain and update controls
    {
      const heightMapWidth = heightMap[0].length;
      const heightMapHeight = heightMap.length;

      //terrain
      const geometry = new BoxGeometry(heightMapWidth, 1, heightMapHeight);
      const material = new MeshPhongMaterial({ color: 'brown' });
      const terrain = new Mesh(geometry, material);

      const bb = new Box3().setFromObject(mockupMesh);

      const centroid = new Vector3(
        (bb.max.x - bb.min.x) / 2,
        bb.min.y,
        (bb.max.z - bb.min.z) / 2
      );

      terrain.position.set(
        centroid.x + bb.min.x,
        centroid.y,
        centroid.z + bb.min.z
      );
      terrain.updateMatrix();
      this.scene.add(terrain);

      // update controls
      const targetPosition = new Box3()
        .setFromObject(terrain.clone())
        .getCenter(terrain.clone().position);

      this.orbit.target.copy(targetPosition);
      this.orbit.update();
    }

    // this.mockUpLego = mockUpLego; look like it is only use in generateCadastre
  }

  extrudeHeightMap(heightMap) {
    if (!heightMap.length) {
      console.debug('no heightmap');
      return;
    }

    const heightMapWidth = heightMap[0].length;
    const heightMapHeight = heightMap.length;

    console.time('create voxels'); // they are not real voxel (!= size) TODO find a better name
    const voxelGeometries = [];
    // lego ratio y dimension (when x = y = 1) not perfect cube but perfect square
    const magicNumber = 1.230769230769231; // a lego brick is not a perfect cube. this number is calculated to have a dimension to a real lego
    for (let j = 0; j < heightMapHeight; j++) {
      for (let i = 0; i < heightMapWidth; i++) {
        const legoCountedInHeightmapValue = Math.floor(
          heightMap[j][i] / magicNumber
        );
        if (legoCountedInHeightmapValue == 0) continue;
        const height = magicNumber * legoCountedInHeightmapValue; // put lego as much to not go bigger than heightmap value
        const voxelGeo = new BoxGeometry(1, height, 1);
        // spatialize on xz  (why not being in the same referential as itowns in LegoMockupVisualizer ?)
        voxelGeo.translate(
          i,
          height * 0.5, // origin at y = 0
          j
        ); //  geometrie in heightmap ref
        voxelGeometries.push(voxelGeo);
      }
    }
    console.info('count voxel ', voxelGeometries.length);
    console.timeEnd('create voxels');

    console.time('create mesh');
    const result = new Group({ name: 'mockup' });
    if (voxelGeometries.length) {
      const mesh = new Mesh(
        BufferGeometryUtils.mergeGeometries(voxelGeometries, false),
        new MeshPhongMaterial({ color: 'white' })
      );
      mesh.geometry.computeBoundingBox();
      result.add(mesh);
    }
    console.timeEnd('create mesh');

    return result;
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
    this.domElement.innerHTML = null;
    this.orbit.dispose();
  }
}
