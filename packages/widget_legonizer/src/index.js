import { Box3Select, EVENT } from '@ud-viz/widget_box3_select';
import { PlanarView } from 'itowns';
import {
  cameraFitRectangle,
  createLocalStorageDetails,
  Heightmap,
} from '@ud-viz/utils_browser';
import {
  BufferGeometryLoader,
  Color,
  DirectionalLight,
  Group,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { extrudeHeightMap } from '@ud-viz/legonizer';
import { isNumeric } from '@ud-viz/utils_shared';

const LEGO_COUNT_SQUARED_PLATE = 32;

export class Legonizer extends HTMLElement {
  /**
   *
   * @param {PlanarView} view
   * @param {Object} options
   * @param {Number} options.minZ
   * @param {Number} options.maxZ
   * @param {Number} options.width
   * @param {Number} options.height
   * @param {String} options.workerScriptURL
   * @param {Material} options.mockupMaterial
   * @param {Number} options.maxLegoPlateCount
   */
  constructor(view, options = {}) {
    super();

    this.view = view;

    // box 3 select
    this.box3Select = new Box3Select(view, {
      minZ: options.minZ,
      maxZ: options.maxZ,
    });
    this.appendChild(this.box3Select);

    // heightmap
    this.heightmapMockUp = new Heightmap();
    const details = createLocalStorageDetails(
      'heightmap mock up',
      'Heightmap mock up',
      this
    );
    details.appendChild(this.heightmapMockUp.domElement);

    // lego size
    const labelSlider = document.createElement('label');
    labelSlider.innerText = 'Resolution';
    this.appendChild(labelSlider);
    this.resolutionSlider = document.createElement('input');
    this.resolutionSlider.type = 'range';
    this.appendChild(this.resolutionSlider);

    this.legoSizeLabel = document.createElement('label');
    this.appendChild(this.legoSizeLabel);

    // canvas 3D scene
    {
      Object3D.DEFAULT_UP.set(0, 0, 1); // force z up like in itowns
      const canvas = document.createElement('canvas');
      canvas.width = isNumeric(options.width) ? parseInt(options.width) : 500;
      canvas.height = isNumeric(options.height)
        ? parseInt(options.height)
        : 300;
      this.appendChild(canvas);

      this.renderer = new WebGLRenderer({ antialias: true, canvas: canvas });
      this.renderer.setSize(canvas.width, canvas.height);
      this.camera = new PerspectiveCamera(
        75,
        canvas.width / canvas.height,
        0.1,
        4000
      );
      this.scene = new Scene();
      this.scene.background = new Color('black');

      // lighting
      const offset = 20;
      const lightFrom = (from) => {
        const l = new DirectionalLight('white', 0.7);
        l.position.copy(from);
        l.lookAt(new Vector3());
        this.scene.add(l);
      };
      [
        new Vector3(offset, offset, offset),
        new Vector3(-offset, -offset, offset),
      ].forEach((v) => lightFrom(v));

      this.orbitCtrl = new OrbitControls(this.camera, canvas);
      this.orbitCtrl.maxPolarAngle = Math.PI * 0.5;
      this.orbitCtrl.addEventListener('change', () => {
        this.renderer.render(this.scene, this.camera);
      });
      this.renderer.render(this.scene, this.camera);

      this.mockupMaterial =
        options.mockupMaterial || new MeshPhongMaterial({ color: 'white' });
      this.mockUpGroup = new Group();
      this.scene.add(this.mockUpGroup);

      this.heightmapPlane = new Mesh(
        new PlaneGeometry(1, 1),
        new MeshBasicMaterial()
      );
      this.scene.add(this.heightmapPlane);
    }

    this.worker = null;

    this.workerScriptURL = options.workerScriptURL || null;

    const loadMockUpButton = document.createElement('button');
    loadMockUpButton.innerText = 'Load Mockup';
    this.appendChild(loadMockUpButton);

    loadMockUpButton.onclick = this.loadMockUp.bind(this);

    const legoPlatesGroup = new Group();
    this.view.scene.add(legoPlatesGroup);

    const plateMaterials = [
      'red',
      'cyan',
      'yellow',
      'green',
      'blue',
      'brown',
      'purple',
      'orange',
    ].map((c) => new MeshPhongMaterial({ color: c, wireframe: true }));
    const randomMaterial = () => {
      return plateMaterials[
        Math.round(Math.random() * plateMaterials.length - 1)
      ];
    };

    this.legoPlateSize = -1;
    this.countPlateX = -1;
    this.countPlateY = -1;

    const maxLegoPlateCount = options.maxLegoPlateCount || 20;

    const updateLegoPlates = () => {
      legoPlatesGroup.children.length = 0; //clear old ones
      const box3 = this.box3Select.box3.clone();
      if (box3.min.equals(box3.max)) return;

      const minSize = Math.min(
        box3.max.x - box3.min.x,
        box3.max.y - box3.min.y
      );

      // minimal resolution = 1 lego plate (32*32 lego square) on min size and max resolution is minSize * maxLegoPlateCount
      this.legoPlateSize =
        Math.sqrt(this.resolutionSlider.valueAsNumber / 100) *
          (minSize / maxLegoPlateCount - minSize) +
        minSize;

      // update ui
      this.legoSizeLabel.innerText = 'lego size: ' + this.legoSize + 'm';

      this.countPlateX = Math.floor(
        (box3.max.x - box3.min.x) / this.legoPlateSize
      );
      this.countPlateY = Math.floor(
        (box3.max.y - box3.min.y) / this.legoPlateSize
      );

      legoPlatesGroup.position.copy(box3.min);
      legoPlatesGroup.position.z = box3.max.z + 2; // avoid z fighting

      for (let countX = 0; countX < this.countPlateX; countX++) {
        for (let countY = 0; countY < this.countPlateY; countY++) {
          const plate = new Mesh(
            new PlaneGeometry(this.legoPlateSize, this.legoPlateSize),
            randomMaterial()
          );
          plate.position.x =
            this.legoPlateSize * 0.5 + countX * this.legoPlateSize;
          plate.position.y =
            this.legoPlateSize * 0.5 + countY * this.legoPlateSize;
          legoPlatesGroup.add(plate);
        }
      }

      this.view.notifyChange();
    };

    this.box3Select.addEventListener(
      EVENT.BOX3_CHANGED,
      updateLegoPlates.bind(this)
    );
    this.resolutionSlider.onchange = updateLegoPlates.bind(this);
  }

  get legoSize() {
    return this.legoPlateSize / LEGO_COUNT_SQUARED_PLATE;
  }

  async loadMockUp() {
    if (this.worker) this.worker.terminate();

    const box3 = this.box3Select.box3.clone();
    if (box3.min.equals(box3.max)) return;

    box3.max.x = box3.min.x + this.countPlateX * this.legoPlateSize;
    box3.max.y = box3.min.y + this.countPlateY * this.legoPlateSize;

    await this.heightmapMockUp.load(
      this.view,
      box3, // precise box on Z + crop with lego plate
      new Vector2(
        this.countPlateX * LEGO_COUNT_SQUARED_PLATE,
        this.countPlateY * LEGO_COUNT_SQUARED_PLATE // 1 pixel == 1 lego
      ),
      1 / this.legoSize // conserve proportion
    );

    // mock up
    const heightMapWidth = this.heightmapMockUp.array[0].length;
    const heightMapHeight = this.heightmapMockUp.array.length;

    const bufferGeoLoader = new BufferGeometryLoader();
    const textureLoader = new TextureLoader();

    this.mockUpGroup.children.length = 0;
    this.mockUpGroup.position.x = -heightMapWidth * 0.5;
    this.mockUpGroup.position.y = heightMapHeight * 0.5;

    this.heightmapPlane.scale.set(heightMapWidth, heightMapHeight, 1);
    this.heightmapPlane.material.map = await textureLoader.loadAsync(
      this.heightmapMockUp.domElement.img.src
    );
    this.heightmapPlane.visible = true;

    cameraFitRectangle(
      this.camera,
      new Vector2(-heightMapWidth * 0.5, -heightMapHeight * 0.5),
      new Vector2(heightMapWidth * 0.5, heightMapHeight * 0.5),
      0
    );

    this.orbitCtrl.enabled = false;
    this.orbitCtrl.update();
    this.renderer.render(this.scene, this.camera);

    return new Promise((resolve, reject) => {
      const resolveEndCompute = () => {
        this.worker = null;
        this.orbitCtrl.enabled = true;
        this.heightmapPlane.visible = false;
        this.renderer.render(this.scene, this.camera);
        resolve(true);
      };

      // try new Worker to avoid freeze
      if (window.Worker && this.workerScriptURL) {
        // ref to dispose properly
        this.worker = new window.Worker(this.workerScriptURL);
        this.worker.postMessage([this.heightmapMockUp.array]);
        this.worker.onmessage = (e) => {
          // TODO make a message structure system
          if (e.data == 'close') {
            resolveEndCompute();
          } else {
            this.mockUpGroup.add(
              new Mesh(bufferGeoLoader.parse(e.data), this.mockupMaterial)
            );
            this.renderer.render(this.scene, this.camera); // to see meshes addition
          }
        };
        this.worker.onerror = reject;
      } else {
        // freeze but support old browser
        const geometries = extrudeHeightMap(this.heightmapMockUp.array);
        geometries.forEach((g) =>
          mockUpGroup.add(new Mesh(g, this.mockupMaterial))
        );
        resolveEndCompute();
      }
    });
  }

  remove(...args) {
    super.remove(...args);
    if (this.worker) this.worker.terminate();
  }
}

window.customElements.define('legonizer-element', Legonizer); // mandatory to extends HTMLElement
