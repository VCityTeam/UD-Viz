/** @format */

import * as THREE from 'three';
import * as itowns from 'itowns';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer';

import { computeNearFarCamera } from '../../Components/Camera/CameraUtils';

import './View3D.css';
import { InputManager } from '../../Components/InputManager';

import * as proj4 from 'proj4';
import {
  LayerManager,
  addBaseMapLayer,
  addElevationLayer,
  setupAndAdd3DTilesLayers,
  setupAndAddGeoJsonLayers,
} from '../../Components/Components';

/**
 *  Main view of an ud-viz application
 */
export class View3D {
  constructor(params = {}) {
    const _this = this;

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
    this.rootWebGL.id = 'viewerDiv';

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
    this.resizeListener = this.onResize.bind(this);
    window.addEventListener('resize', this.resizeListener);

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
    this.hasItownsControls = params.hasItownsControls || false;
    this.itownsRequesterBeforeRender = function () {
      computeNearFarCamera(_this.getCamera(), _this.getExtent(), 400);
    };

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
    this.toCSS3DEvent = function (event) {
      if (_this.isCatchingEventsCSS3D()) return;

      const el = _this.rootWebGL;

      const mouse = new THREE.Vector2(
        -1 + (2 * event.offsetX) / (el.clientWidth - parseInt(el.offsetLeft)),
        1 - (2 * event.offsetY) / (el.clientHeight - parseInt(el.offsetTop))
      );

      raycaster.setFromCamera(mouse, _this.getCamera());

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
    setTimeout(this.resizeListener, 100);
  }

  /**
   *
   * @returns {boolean} true if html of the webgl rendering isn't catching events
   * allowing the css3D html to catch it
   */
  isCatchingEventsCSS3D() {
    return this.rootWebGL.style.pointerEvents === 'none';
  }

  /**
   *
   * @param {boolean} value if true allow css3D html elements to catch user events, otherwise no
   */
  catchEventsCSS3D(value) {
    if (value) {
      this.rootWebGL.style.pointerEvents = 'none';
    } else {
      this.rootWebGL.style.pointerEvents = '';
    }
  }

  appendBillboard(billboard) {
    if (!this.css3DRenderer) this.initCSS3D();

    this.getScene().add(billboard.getMaskObject());
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
   * @param {boolean} value if true the css3D renderer stop rendering
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
      this.itownsRequesterBeforeRender
    );
  }

  /**
   * init the itowns.PlanarView of this view with a given extent
   *
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

    const placement = {
      coord: coordinates,
      heading: heading,
      range: range,
      tilt: tilt,
    };

    //maxSubdivisionLevel
    let maxSubdivisionLevel = 3;
    if (this.config.background_image_layer)
      if (this.config.background_image_layer.maxSubdivisionLevel)
        maxSubdivisionLevel =
          this.config.background_image_layer.maxSubdivisionLevel;

    this.itownsView = new itowns.PlanarView(this.rootWebGL, extent, {
      disableSkirt: false,
      placement: placement,
      maxSubdivisionLevel: maxSubdivisionLevel,
      noControls: !this.hasItownsControls,
    });

    //init 3D rendering attributes with itownsview
    this.scene = this.itownsView.scene;
    this.renderer = this.itownsView.mainLoop.gfxEngine.renderer;
    this.camera = this.itownsView.camera.camera3D;

    //layermanager
    this.layerManager = new LayerManager(this.itownsView);

    addBaseMapLayer(this.config, this.itownsView, this.extent);
    addElevationLayer(this.config, this.itownsView, this.extent);
    setupAndAdd3DTilesLayers(this.config, this.layerManager, this.itownsView);
    setupAndAddGeoJsonLayers(this.config, this.itownsView);

    //disable itowns resize
    this.itownsViewResize = this.itownsView.resize.bind(this.itownsView);
    this.itownsView.resize = function () {};
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

    if (this.css3DRenderer)
      this.css3DRenderer.setSize(this.size.x, this.size.y);

    if (this.itownsViewResize) {
      this.itownsViewResize(this.size.x, this.size.y);
    } else {
      this.camera.aspect = this.size.x / this.size.y;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.size.x, this.size.y);
    }
  }

  /**
   * Remove html from the DOM and stop listeners
   */
  dispose() {
    if (this.itownsView) this.itownsView.dispose();
    window.removeEventListener('resize', this.resizeListener);
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
