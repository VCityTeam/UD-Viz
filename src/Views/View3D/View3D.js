/** @format */

import * as THREE from 'three';
import * as itowns from 'itowns';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer';

import { computeNearFarCamera } from '../../Components/Camera/CameraUtils';

import './View3D.css';
import { InputManager } from '../../Components/InputManager';

import * as proj4 from 'proj4';
import { TilesManager } from '../../Components/Components';
import { LayerManager } from '../../Widgets/Components/Components'; //TODO LayerManager should be a components one level above

import { Widgets } from '../..';
const $3DTemporalBatchTable = Widgets.$3DTemporalBatchTable;
const $3DTemporalBoundingVolume = Widgets.$3DTemporalBoundingVolume;
const $3DTemporalTileset = Widgets.$3DTemporalTileset;

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

    this.rootHtml.appendChild(this.rootCss);
    this.rootHtml.appendChild(this.rootWebGL);

    //ui
    this.ui = document.createElement('div');
    this.ui.classList.add('ui_View3D');
    this.rootWebGL.appendChild(this.ui);

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

    //size of the view
    this.size = new THREE.Vector2();

    //flag
    this.disposed = false;

    //inputs
    this.inputManager = new InputManager();

    /**
     * Object used to manage all of the layer.
     *
     * @type {LayerManager}
     */
    this.layerManager = null;

    //3D rendering attributes
    this.scene = null; //the three js scene
    this.renderer = null; //the webgl renderer
    this.camera = null; //the camera used to render the scene

    //ATTRIBUTES BELOW ARE STILL IN WIP

    //CSS3D attributes
    this.css3DRenderer = null;
    this.css3DScene = null;
    this.billboards = [];
    const raycaster = new THREE.Raycaster();
    const _this = this;
    this.toCSS3DEvent = function (event) {
      if (_this.isCatchingEventsCSS3D()) return;

      const el = _this.rootWebGL;

      const mouse = new THREE.Vector2(
        -1 + (2 * event.offsetX) / (el.clientWidth - parseInt(el.offsetLeft)),
        1 - (2 * event.offsetY) / (el.clientHeight - parseInt(el.offsetTop))
      );

      raycaster.setFromCamera(mouse, _this.itownsView.camera.camera3D);

      for (let index = 0; index < _this.billboards.length; index++) {
        const element = _this.billboards[index];

        const i = raycaster.intersectObject(element.getMaskObject());
        if (i.length) {
          _this.catchEventsCSS3D(true);
          element.select(true);
          return;
        }
      }
    };

    this.toWebGLEvent = function (event) {
      if (!_this.isCatchingEventsCSS3D()) return;

      let onBillboard = false;
      if (event.path.length) {
        const firstHoverEl = event.path[0];

        for (let index = 0; index < _this.billboards.length; index++) {
          const element = _this.billboards[index];
          if (element.getHtml() == firstHoverEl) {
            onBillboard = true;
            break;
          }
        }
      }
      if (!onBillboard) {
        _this.catchEventsCSS3D(false);
        _this.billboards.forEach(function (b) {
          b.select(false);
        });
      }
    };

    //default catch events
    const catchEventsCSS3D = params.catchEventsCSS3D || false;
    this.catchEventsCSS3D(catchEventsCSS3D);
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

    //listen to switch mode between css3D and webgl controls
    this.inputManager.addMouseInput(
      this.rootWebGL,
      'mousedown',
      this.toCSS3DEvent
    );

    this.inputManager.addMouseInput(
      this.rootCss,
      'mousedown',
      this.toWebGLEvent
    );

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
        css3DRenderer.render(_this.css3DScene, _this.getCamera());
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
    console.log('catch css3D event ', value);
  }

  appendBillboard(billboard) {
    if (!this.css3DRenderer) this.initCSS3D();

    this.itownsView.scene.add(billboard.getMaskObject());
    this.css3DScene.add(billboard.getCss3DObject());
    this.billboards.push(billboard);
  }

  removeBillboard(billboard) {
    this.itownsView.scene.remove(billboard.getMaskObject());
    this.css3DScene.remove(billboard.getCss3DObject());

    const index = this.billboards.indexOf(billboard);
    this.billboards.splice(index, 1);
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

  start(extent) {
    this.initItownsView(extent);
    //start
    this.inputManager.startListening(this.rootWebGL);

    //dynamic near far computation
    this.itownsView.addFrameRequester(
      itowns.MAIN_LOOP_EVENTS.BEFORE_RENDER,
      computeNearFarCamera.bind(null, this.getCamera(), this.extent, 400)
    );
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

    this.itownsView = new itowns.PlanarView(this.rootWebGL, extent, {
      disableSkirt: false,
      placement: {
        coord: coordinates,
        heading: heading,
        range: range,
        tilt: tilt,
      },
      noControls: !this.itownsControls,
    });

    //init 3D rendering attributes with itownsview
    this.scene = this.itownsView.scene;
    this.renderer = this.itownsView.mainLoop.gfxEngine.renderer;
    this.camera = this.itownsView.camera.camera3D;

    //City generation
    this.addBaseMapLayer();
    this.addElevationLayer();
    this.setupAndAdd3DTilesLayers();

    //disable itowns resize
    this.itownsView.resize = function () { };
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
        overrideMaterials: false,
      },
      this.itownsView
    );

    const $3DTilesManager = new TilesManager(this.itownsView, $3dTilesLayer);
    if (layer['color']) {
      let color = parseInt(layer['color']);
      $3DTilesManager.color = color;
    }

    this.layerManager.tilesManagers.push($3DTilesManager);

    return [$3dTilesLayer, $3DTilesManager];
  }

  getLayerManager() {
    return this.layerManager;
  }

  getSize() {
    return this.size;
  }

  /**
   * Callback call on the resize event
   */
  onResize() {
    let offsetLeft = parseInt(this.rootWebGL.style.left);
    if (isNaN(offsetLeft)) offsetLeft = 0;
    let offsetTop = parseInt(this.rootWebGL.style.top);
    if (isNaN(offsetTop)) offsetTop = 0;

    this.size.x = window.innerWidth - offsetLeft;
    this.size.y = window.innerHeight - offsetTop;

    this.camera.aspect = this.size.x / this.size.y;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.size.x, this.size.y);

    if (this.css3DRenderer)
      this.css3DRenderer.setSize(this.size.x, this.size.y);
  }

  /**
   * Remove html from the DOM and stop listeners
   */
  dispose() {
    if (this.itownsView) this.itownsView.dispose();
    window.removeEventListener('resize', this.onResize.bind(this));
    this.html().remove();
    this.inputManager.dispose();
    this.disposed = true;
  }

  getCamera() {
    return this.camera;
  }

  getScene() {
    return this.scene;
  }

  getRenderer() {
    return this.renderer;
  }

  getRootWebGL() {
    return this.rootWebGL;
  }
}
