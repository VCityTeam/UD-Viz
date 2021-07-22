/** @format */

import * as THREE from 'three';
import * as itowns from 'itowns';
import { CSS3DObject, CSS3DRenderer } from 'three-css3drenderer';

import './View3D.css';
import { InputManager } from '../../Components/InputManager';

import * as proj4 from 'proj4';

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
    this.pause = false;

    //flag
    this.disposed = false;

    //CSS3D attributes
    this.css3DRenderer = null;
    this.css3DScene = null;
    this.maskObject = null;

    //inputs
    this.inputManager = new InputManager();
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
    const tick = function () {
      if (_this.disposed) return;
      requestAnimationFrame(tick);
      if (_this.pause) return;
      css3DRenderer.render(_this.css3DScene, _this.itownsView.camera.camera3D);
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
    const geometry = new THREE.PlaneGeometry(size3D.width, size3D.height);

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

  /**
   *
   * @param {Boolean} value if true the css3D renderer stop rendering
   */
  setPause(value) {
    this.pause = value;
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
    this.add3DTilesLayer();

    //TODO parler a itowns remove listener of the resize
    this.itownsView.debugResize = this.itownsView.resize;
    this.itownsView.resize = function () {
      //nada
    };

    //start
    this.inputManager.startListening(this.itownsView.domElement);
  }

  /**
   * Adds WMS elevation Layer of Lyon in 2012 and WMS imagery layer of Lyon in 2009 (from Grand Lyon data).
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

  add3DTilesLayer() {
    if (!this.config['3DTilesLayer']) {
      console.warn('no 3DTilesLayer in config');
      return;
    }

    const $3DTilesLayer = new itowns.C3DTilesLayer(
      this.config['3DTilesLayer']['id'],
      {
        name: 'Lyon-2015-'.concat(this.config['3DTilesLayer']['id']),
        source: new itowns.C3DTilesSource({
          url: this.config['3DTilesLayer']['url'],
        }),
      },
      this.itownsView
    );

    itowns.View.prototype.addLayer.call(this.itownsView, $3DTilesLayer);
  }

  /**
   * Callback call on the resize event
   */
  onResize() {
    const w = window.innerWidth - this.rootHtml.offsetLeft;
    const h = window.innerHeight - this.rootHtml.offsetTop;

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
  }
}
