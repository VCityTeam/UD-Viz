/** @format */

import * as THREE from 'three';
import * as itowns from 'itowns';
import {
  CSS3DObject,
  CSS3DRenderer,
} from 'three/examples/jsm/renderers/CSS3DRenderer';

import './View3D.css';
import { InputManager } from '../../Components/InputManager';

import * as proj4 from 'proj4';
import { TilesManager } from '../../Components/Components';
import { LayerManager } from '../../Widgets/Components/Components'; //TODO LayerManager should be a components one level above

import { Widgets } from '../..';
const $3DTemporalBatchTable = Widgets.$3DTemporalBatchTable;
const $3DTemporalBoundingVolume = Widgets.$3DTemporalBoundingVolume;
const $3DTemporalTileset = Widgets.$3DTemporalTileset;

import { Deck } from '@deck.gl/core';

/**
 *  Main view of an ud-viz application
 */
export class View3D {
  constructor(params = {}) {
    //root html
    this.rootHtml = document.createElement('div');
    this.rootHtml.id = 'root_View3D';

    //add to DOM
    if (params.htmlParent) {
      params.htmlParent.appendChild(this.rootHtml);
    } else {
      document.body.appendChild(this.rootHtml);
    }

    //root webgl
    this.rootWebGL = document.createElement('div');
    this.rootWebGL.id = 'webgl_View3D';

    //root css
    this.rootCss = document.createElement('div');
    this.rootCss.id = 'css_View3D';

    this.rootDeckGL = document.createElement('canvas');
    this.rootDeckGL.id = 'deck_gl_View3D';

    this.rootHtml.appendChild(this.rootCss);
    this.rootHtml.appendChild(this.rootWebGL);
    this.rootHtml.appendChild(this.rootDeckGL);

    //root itowns
    this.rootItownsHtml = document.createElement('div');
    this.rootItownsHtml.id = 'itowns_View3D'; //itowns div
    this.rootWebGL.appendChild(this.rootItownsHtml);

    //ui
    this.ui = document.createElement('div');
    this.ui.classList.add('ui_View3D');
    this.rootItownsHtml.appendChild(this.ui);

    //listen resize event
    window.addEventListener('resize', this.onResize.bind(this));

    //conf
    this.config = params.config || {};

    //projection
    this.projection = this.config['projection'] || 'EPSG:3946';
    proj4.default.defs(
      this.projection,
      '+proj=lcc +lat_1=45.25 +lat_2=46.75' +
        ' +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
    );

    //itowns view
    this.itownsView = null;
    this.extent = null; //area handle by itowns
    this.itownsControls = params.itownsControls || false;

    //pause
    this.isRendering = true;

    //flag
    this.disposed = false;

    //CSS3D attributes
    this.css3DRenderer = null;
    this.css3DScene = null;
    this.maskObject = null;

    //Deck GL attributes
    this.deckGLRenderer = null;

    //inputs
    this.inputManager = new InputManager();

    /**
     * Object used to manage all of the layer.
     *
     * @type {LayerManager}
     */
    this.layerManager = null;
  }

  /**
   *
   * @param {THREE.Vector2} min coordinate min in pixel
   * @param {THREE.Vector2} max coordinate max in pixel
   */
  setDisplaySize(min = new THREE.Vector2(), max = new THREE.Vector2()) {
    const top = min.y;
    const left = min.x;
    const bottom = max.y;
    const right = max.x;

    [this.rootWebGL, this.rootCss].forEach(function (el) {
      el.style.top = top + 'px';
      el.style.left = left + 'px';
      el.style.bottom = bottom + 'px';
      el.style.right = right + 'px';
    });

    this.onResize();
  }

  /**
   *
   * @param {HTMLElement} el the html element to add to the ui
   */
  appendToUI(el) {
    this.ui.appendChild(el);
  }

  /**
   *
   * @returns {itowns.PlanarView} the itowns view
   */
  getItownsView() {
    return this.itownsView;
  }

  /**
   *
   * @returns {HTMLElement} the root html of this view
   */
  html() {
    return this.rootHtml;
  }

  /**
   *
   * @returns {InputManager} the input manager of this view
   */
  getInputManager() {
    return this.inputManager;
  }

  /**
   * init the css3D renderer
   */
  initCSS3D() {
    //CSS3DRenderer
    const css3DRenderer = new CSS3DRenderer();
    this.css3DRenderer = css3DRenderer;

    //add html el
    this.rootCss.appendChild(css3DRenderer.domElement);

    //create a new scene for the css3D renderer
    this.css3DScene = new THREE.Scene();

    //add mask object to the itownsView scene
    this.maskObject = new THREE.Object3D();
    this.itownsView.scene.add(this.maskObject);

    //start ticking render of css3D renderer
    const _this = this;
    const fps = 20;

    let now;
    let then = Date.now();
    let delta;
    const tick = function () {
      if (_this.disposed) return; //stop requesting frame if disposed

      requestAnimationFrame(tick);

      now = Date.now();
      delta = now - then;

      if (delta > 1000 / fps) {
        // update time stuffs
        then = now - (delta % 1000) / fps;

        if (!_this.isRendering) return;
        css3DRenderer.render(
          _this.css3DScene,
          _this.itownsView.camera.camera3D
        );
      }
    };
    tick();

    //launch an async resize
    setTimeout(this.onResize.bind(this), 100);
  }

  /**
   *
   * @returns {Boolean} true if html of the webgl rendering isn't catching events
   * allowing the css3D html to catch it
   */
  isCatchingEventsCSS3D() {
    return this.rootWebGL.style.pointerEvents === 'none';
  }

  /**
   *
   * @param {Boolean} value if true allow css3D html elements to catch user events, otherwise no
   */
  catchEventsCSS3D(value) {
    if (value) {
      this.rootWebGL.style.pointerEvents = 'none';
    } else {
      this.rootWebGL.style.pointerEvents = '';
    }
  }

  /**
   *
   * @param {HTMLElement} htmlEl html element to add to the css3D Scene
   * @param {Object} size3D object with a width and height to define the size into the scene
   * @param {THREEUtils.Transform} transform how to place the html el into the scene
   */
  appendCSS3D(htmlEl, size3D, transform) {
    if (!this.css3DRenderer) this.initCSS3D();

    const newElement = new CSS3DObject(htmlEl);
    newElement.position.copy(transform.getPosition());
    newElement.rotation.setFromVector3(transform.getRotation());
    newElement.scale.copy(transform.getScale());

    //edit element style
    htmlEl.style.width = size3D.width + 'px';
    htmlEl.style.height = size3D.height + 'px';
    htmlEl.classList.add('DEBUG');

    htmlEl.onclick = function () {
      console.log('CLICK');
    };

    this.css3DScene.add(newElement);

    //mask
    const geometry = new THREE.PlaneGeometry(size3D.width, size3D.height); //TODO remove size3D use scale of transform

    //TODO just one instance
    const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
    material.color.set('white');
    material.opacity = 0;
    material.blending = THREE.NoBlending;

    const plane = new THREE.Mesh(geometry, material);
    plane.position.copy(transform.getPosition());
    plane.rotation.setFromVector3(transform.getRotation());
    plane.scale.copy(transform.getScale());
    plane.updateMatrixWorld();
    this.maskObject.add(plane);
  }

  appendLayerDeckGL(layer) {
    if (!this.deckGLRenderer) this.initDeckGL();

    this.deckGLRenderer.setProps({ layers: [layer] });
  }

  initDeckGL() {
    const _this = this;

    const o = proj4.default(this.projection).inverse(this.extent.center());

    //TODO pass certains attr as conf params
    this.deckGLRenderer = new Deck({
      map: false,
      canvas: this.rootDeckGL,
      initialViewState: {
        longitude: o.x,
        latitude: o.y,
        zoom: 8,
      },
      parameters: {
        clearColor: [0.93, 0.86, 0.81, 0],
      },
      controller: false,
    });

    _this.itownsView.addFrameRequester(
      itowns.MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE,
      function () {
        // console.log('hola ');
        const cameraItowns = _this.itownsView.camera.camera3D;

        const o = proj4
          .default(_this.projection)
          .inverse(cameraItowns.position.clone());

        const dirCam = cameraItowns.getWorldDirection(new THREE.Vector3());
        const axis = new THREE.Vector3(0, 0, -1);
        const pitch = Math.acos(dirCam.dot(axis));

        // newPos.range = 64118883 / (2(viewState.zoom-1)); // 64118883 is Range at Z=1
        const magicNumber = 64118883.098724395;

        const zoom =
          Math.log((2 * magicNumber) / cameraItowns.position.z) / Math.log(2);

        const cameraParams = {
          longitude: o.x,
          latitude: o.y,
          zoom: zoom,
          bearing: (-cameraItowns.rotation.y * 180) / Math.PI,
          pitch: (pitch * 180) / Math.PI,
        };

        console.log(cameraParams, cameraItowns);

        _this.deckGLRenderer.setProps({
          initialViewState: cameraParams,
        });
      }
    );

    // this.catchEventsCSS3D(tfalserue);
  }

  /**
   *
   * @param {Boolean} value if true the css3D renderer stop rendering
   */
  setIsRendering(value) {
    this.isRendering = value;
  }

  /**
   *
   * @returns {itowns.Extent} return the extent of the itowns view
   */
  getExtent() {
    return this.extent;
  }

  /**
   * init the itowns.PlanarView of this view with a given extent
   * @param {itowns.Extent} extent the extent of the itowns.PlanarView
   */
  initItownsView(extent) {
    this.extent = extent;

    const coordinates = extent.center();

    let heading = -50;
    let range = 3000;
    let tilt = 10;

    //assign default value or config value
    if (this.config['itowns'] && this.config['itowns']['camera']) {
      if (this.config['itowns']['camera']['heading'])
        heading = this.config['itowns']['camera']['heading'];

      if (this.config['itowns']['camera']['range'])
        range = this.config['itowns']['camera']['range'];

      if (this.config['itowns']['camera']['tilt'])
        tilt = this.config['itowns']['camera']['tilt'];
    }

    this.itownsView = new itowns.PlanarView(this.rootItownsHtml, extent, {
      disableSkirt: false,
      placement: {
        coord: coordinates,
        heading: heading,
        range: range,
        tilt: tilt,
      },
      noControls: !this.itownsControls,
    });

    //City generation
    this.addBaseMapLayer();
    this.addElevationLayer();
    this.setupAndAdd3DTilesLayers();

    //TODO parler a itowns remove listener of the resize
    this.itownsView.debugResize = this.itownsView.resize;
    this.itownsView.resize = function () {
      //nada
    };

    //start
    this.inputManager.startListening(this.itownsView.domElement);

    //dynamic near far computation
    this.itownsView.addFrameRequester(
      itowns.MAIN_LOOP_EVENTS.BEFORE_RENDER,
      this.computeNearFarCamera.bind(this)
    );
  }

  /**
   * dynamic computation of the near and far of the camera to fit the extent
   */
  computeNearFarCamera() {
    const camera = this.itownsView.camera.camera3D;
    const height = 300; //TODO compute this dynamically
    const points = [
      new THREE.Vector3(this.extent.west, this.extent.south, 0),
      new THREE.Vector3(this.extent.west, this.extent.south, height),
      new THREE.Vector3(this.extent.west, this.extent.north, 0),
      new THREE.Vector3(this.extent.west, this.extent.north, height),
      new THREE.Vector3(this.extent.east, this.extent.south, 0),
      new THREE.Vector3(this.extent.east, this.extent.south, height),
      new THREE.Vector3(this.extent.east, this.extent.north, 0),
      new THREE.Vector3(this.extent.east, this.extent.north, height),
    ];

    const dirCamera = camera.getWorldDirection(new THREE.Vector3());

    let min = Infinity;
    let max = -Infinity;
    points.forEach(function (p) {
      const pointDir = p.clone().sub(camera.position);
      const cos = pointDir.dot(dirCamera) / pointDir.length(); //dircamera length is 1
      const dist = p.distanceTo(camera.position) * cos;
      if (min > dist) min = dist;
      if (max < dist) max = dist;
    });

    camera.near = Math.max(min, 0.001);
    camera.far = max;

    camera.updateProjectionMatrix();
  }

  /**
   * Adds WMS imagery layer
   */
  addBaseMapLayer() {
    if (!this.config['background_image_layer']) {
      console.warn('no background_image_layer in config');
      return;
    }
    let wmsImagerySource = new itowns.WMSSource({
      extent: this.extent,
      name: this.config['background_image_layer']['name'],
      url: this.config['background_image_layer']['url'],
      version: this.config['background_image_layer']['version'],
      projection: this.projection,
      format: this.config['background_image_layer']['format'],
    });

    // Add a WMS imagery layer
    let wmsImageryLayer = new itowns.ColorLayer(
      this.config['background_image_layer']['layer_name'],
      {
        updateStrategy: {
          type: itowns.STRATEGY_DICHOTOMY,
          options: {},
        },
        source: wmsImagerySource,
        transparent: true,
      }
    );
    this.itownsView.addLayer(wmsImageryLayer);
  }

  /**
   * Adds WMS elevation Layer
   */
  addElevationLayer() {
    if (!this.config['elevation_layer']) {
      console.warn('no elevation_layer in config');
      return;
    }

    // Add a WMS elevation source
    let wmsElevationSource = new itowns.WMSSource({
      extent: this.extent,
      url: this.config['elevation_layer']['url'],
      name: this.config['elevation_layer']['name'],
      projection: this.projection,
      heightMapWidth: 256,
      format: this.config['elevation_layer']['format'],
    });
    // Add a WMS elevation layer
    let wmsElevationLayer = new itowns.ElevationLayer(
      this.config['elevation_layer']['layer_name'],
      {
        useColorTextureElevation: true,
        colorTextureElevationMinZ: 149,
        colorTextureElevationMaxZ: 622,
        source: wmsElevationSource,
      }
    );
    this.itownsView.addLayer(wmsElevationLayer);
  }

  /**
   * Sets up a 3D Tiles layer and adds it to the itowns view
   * @param {string} layerConfig The name of the layer to setup
   */
  setupAndAdd3DTilesLayers() {
    // Positional arguments verification
    if (!this.config['3DTilesLayers']) {
      console.warn('No 3DTilesLayers field in the configuration file');
      return;
    }

    this.layerManager = new LayerManager(this.itownsView);

    const layers = {};
    for (let layer of this.config['3DTilesLayers']) {
      layers[layer.id] = this.setup3DTilesLayer(layer);
      itowns.View.prototype.addLayer.call(this.itownsView, layers[layer.id][0]);
    }
    return layers;
  }

  /**
   * Create an iTowns 3D Tiles layer based on the specified layerConfig.
   * @param {string} layerConfig The name of the layer to setup from the
   * generalDemoConfig.json config file
   */
  setup3DTilesLayer(layer) {
    if (!layer['id'] || !layer['url']) {
      throw 'Your layer does not have url id properties or both. ';
    }

    const extensionsConfig = layer['extensions'];
    const extensions = new itowns.C3DTExtensions();
    if (extensionsConfig) {
      for (let i = 0; i < extensionsConfig.length; i++) {
        if (extensionsConfig[i] === '3DTILES_temporal') {
          extensions.registerExtension('3DTILES_temporal', {
            [itowns.C3DTilesTypes.batchtable]: $3DTemporalBatchTable,
            [itowns.C3DTilesTypes.boundingVolume]: $3DTemporalBoundingVolume,
            [itowns.C3DTilesTypes.tileset]: $3DTemporalTileset,
          });
        } else if (extensionsConfig[i] === '3DTILES_batch_table_hierarchy') {
          extensions.registerExtension('3DTILES_batch_table_hierarchy', {
            [itowns.C3DTilesTypes.batchtable]:
              itowns.C3DTBatchTableHierarchyExtension,
          });
        } else {
          console.warn(
            'The 3D Tiles extension ' +
              extensionsConfig[i] +
              ' specified in generalDemoConfig.json is not supported ' +
              'by UD-Viz yet. Only 3DTILES_temporal and ' +
              '3DTILES_batch_table_hierarchy are supported.'
          );
        }
      }
    }

    const $3dTilesLayer = new itowns.C3DTilesLayer(
      layer['id'],
      {
        name: layer['id'],
        source: new itowns.C3DTilesSource({
          url: layer['url'],
        }),
        registeredExtensions: extensions,
      },
      this.itownsView
    );

    const $3DTilesManager = new TilesManager(this.itownsView, $3dTilesLayer);
    let color = 0xffffff;
    if (layer['color']) {
      color = parseInt(layer['color']);
    }
    $3DTilesManager.registerStyle('default', {
      materialProps: { opacity: 1, color: color, fog: false },
    });

    $3DTilesManager.addEventListener(
      TilesManager.EVENT_TILE_LOADED,
      function (event) {
        $3DTilesManager.setStyleToTileset('default');
        $3DTilesManager.applyStyles();
      }
    );

    this.layerManager.tilesManagers.push($3DTilesManager);

    return [$3dTilesLayer, $3DTilesManager];
  }

  getLayerManager() {
    return this.layerManager;
  }

  /**
   * Callback call on the resize event
   */
  onResize() {
    let offsetLeft = parseInt(this.rootWebGL.style.left);
    if (isNaN(offsetLeft)) offsetLeft = 0;
    let offsetTop = parseInt(this.rootWebGL.style.top);
    if (isNaN(offsetTop)) offsetTop = 0;

    const w = window.innerWidth - offsetLeft;
    const h = window.innerHeight - offsetTop;

    //TODO remove this fonction
    if (this.itownsView) this.itownsView.debugResize(w, h);

    if (this.css3DRenderer) this.css3DRenderer.setSize(w, h);
  }

  /**
   * Remove html from the DOM and stop listeners
   */
  dispose() {
    this.itownsView.dispose();
    window.removeEventListener('resize', this.onResize.bind(this));
    this.html().remove();
    this.inputManager.dispose();
    this.disposed = true;
    if (this.deckGLRenderer) this.deckGLRenderer.finalize();
  }

  getScene() {
    return this.itownsView.scene;
  }

  getRenderer() {
    return this.itownsView.mainLoop.gfxEngine.renderer;
  }
}
