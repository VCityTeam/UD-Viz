import * as THREE from 'three';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { checkParentChild } from '../../HTMLUtil';
import { Billboard } from '../Component/Billboard';

import './Frame3DBase.css';

/** @class*/
export class Frame3DBase {
  /**
   * Basic Frame3D wrap different html element to handle CSS3D rendering {@link CSS3DRenderer}.
   * It's possible to add {@link Billboard} to this.
   * Composed with {@link THREE.Scene} + {@link THREE.PerspectiveCamera} + {@link THREE.WebGLRenderer}.
   *
   * @param {object} options - options to configure frame3Dbase
   * @param {HTMLElement} [options.htmlParent=document.body] - html parent element of root html frame3DBase
   * @param {boolean} [options.catchEventsCSS3D=false] - event are catch by css3D element (ie {@link Billboard})
   * @param {boolean} [init3D=true] - {@link THREE.Scene} + {@link THREE.PerspectiveCamera} + {@link THREE.WebGLRenderer} should be init
   */
  constructor(options = {}, init3D = true) {
    /**
     * root html 
     *
      @type {HTMLDivElement} */
    this.rootHtml = document.createElement('div');
    this.rootHtml.id = 'root_Frame3DBase';

    // Add to DOM
    if (options.htmlParent) {
      options.htmlParent.appendChild(this.rootHtml);
    } else {
      document.body.appendChild(this.rootHtml);
    }

    /**
     * root webgl (where canvas is added)
     *
      @type {HTMLDivElement}  */
    this.rootWebGL = document.createElement('div');
    this.rootWebGL.id = 'viewerDiv'; // => So Widget can access rootWebGL with id

    /**
     * root css (where css3Delement are added)
     *
      @type {HTMLDivElement}  */
    this.rootCss = document.createElement('div');
    this.rootCss.id = 'css_Frame3DBase';

    /** 
     * where ui element should be added (note that you have to handle manually z-index element composing ui, should it be automatically ?) 
     *  
     @type {HTMLDivElement}*/
    this.ui = document.createElement('div');
    this.ui.classList.add('ui_Frame3DBase');

    // add dom layer
    this.rootHtml.appendChild(this.ui);
    this.rootHtml.appendChild(this.rootCss);
    this.rootHtml.appendChild(this.rootWebGL);

    /**
     * reference resize listener to remove it on dispose
     *
      @type {Function} */
    this.resizeListener = this.onResize.bind(this);
    window.addEventListener('resize', this.resizeListener);

    /**
     * flag to stop rendering 3D
     *
      @type {boolean} */
    this.isRendering = true;

    /**
     * Size of the frame3D
     *
      @type {THREE.Vector2} */
    this.size = new THREE.Vector2();
    this.updateSize();

    /**
     * canvas scene 3D
     *
      @type {THREE.Scene} */
    this.scene = null;

    /**
     * canvas renderer
     *
      @type {THREE.WebGLRenderer} */
    this.renderer = null;

    /**
     * camera 3D
     *
      @type {THREE.PerspectiveCamera} */
    this.camera = null;

    /**
     * css renderer
     *
      @type {CSS3DRenderer} */
    this.css3DRenderer = null;

    /**
     * css scene
     *
      @type {THREE.Scene} */
    this.css3DScene = null;

    /**
     * current billboards in frame3D
     *
      @type {Billboard[]} */
    this.billboards = [];

    // Default catch events
    const catchEventsCSS3D = options.catchEventsCSS3D || false;
    this.catchEventsCSS3D(catchEventsCSS3D);

    /**
     * listeners of {@link Frame3DBase.EVENT}
     *
      @type {Object<string,Function[]>} */
    this.listeners = {};
    for (const key in Frame3DBase.EVENT) {
      this.listeners[Frame3DBase.EVENT[key]] = [];
    }

    if (init3D) {
      // Initialize 3D

      THREE.Object3D.DefaultUp.set(0, 0, 1);

      this.scene = new THREE.Scene();
      const canvas = document.createElement('canvas');
      this.rootWebGL.appendChild(canvas);
      this.renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        logarithmicDepthBuffer: true,
        alpha: true,
      });
      this.camera = new THREE.PerspectiveCamera(60, 1, 1, 1000); // Default params
      this.scene.add(this.camera);
    }
  }

  /**
   * Register a listener on a {@link Frame3DBase.EVENT}
   *
   * @param {string} eventID - event to add listener {@link Frame3DBase.EVENT}
   * @param {Function} listener - callback to call on eventID
   */
  on(eventID, listener) {
    if (!this.listeners[eventID])
      throw new Error('this event is not a Frame3DBase.EVENT');
    this.listeners[eventID].push(listener);
  }

  /**
   * Resize with css html element
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
   * @param {HTMLElement} el - html element to add to ui
   */
  appendToUI(el) {
    /**
     * can be override in css with !important
     * (but very usefull since in 99.9% we want our el to have a z-index of 2 since ui is beside rootcss and rootwebl)
     */
    el.style.zIndex = Frame3DBase.DEFAULT_UI_Z_INDEX;

    this.ui.appendChild(el);
  }

  /**
   *
   * @returns {HTMLDivElement} - frame3DBase root html
   */
  html() {
    return this.rootHtml;
  }

  /**
   * Init the css3D renderer
   */
  initCSS3D() {
    // CSS3DRenderer
    this.css3DRenderer = new CSS3DRenderer();

    // Add html el
    this.rootCss.appendChild(this.css3DRenderer.domElement);

    // Create a new scene for the css3D renderer
    this.css3DScene = new THREE.Scene();

    // Listen to switch mode between css3D and webgl controls
    const raycaster = new THREE.Raycaster();

    // check if enter css3D event
    this.rootWebGL.onmousedown = (event) => {
      if (this.isCatchingEventsCSS3D()) return;
      if (checkParentChild(event.target, this.ui)) return; // Do not propagate if it's the ui that has been clicked

      const el = this.rootWebGL;

      const mouse = new THREE.Vector2(
        -1 + (2 * event.offsetX) / (el.clientWidth - parseInt(el.offsetLeft)),
        1 - (2 * event.offsetY) / (el.clientHeight - parseInt(el.offsetTop))
      );

      raycaster.setFromCamera(mouse, this.getCamera());

      for (let index = 0; index < this.billboards.length; index++) {
        const element = this.billboards[index];

        const i = raycaster.intersectObject(element.getMaskObject());
        if (i.length) {
          this.catchEventsCSS3D(true);
          element.select(true);
          return;
        }
      }
    };

    // check if enter canvas webgl event
    this.rootCss.onmousedown = (event) => {
      if (!this.isCatchingEventsCSS3D()) return;

      let onBillboard = false;

      // compatible chrome & firefox
      const path = event.path || (event.composedPath && event.composedPath());

      if (path.length) {
        const firstHoverEl = path[0];

        for (let index = 0; index < this.billboards.length; index++) {
          const element = this.billboards[index];
          if (element.getHtml() == firstHoverEl) {
            onBillboard = true;
            break;
          }
        }
      }
      if (!onBillboard) {
        this.catchEventsCSS3D(false);
        this.billboards.forEach(function (b) {
          b.select(false);
        });
      }
    };

    // need an async call to resize
    setTimeout(this.resizeListener, 10);
  }

  /**
   * Render css3D
   *
   * @returns {void}
   */
  renderCSS3D() {
    if (!this.isRendering || !this.css3DRenderer) return;
    this.css3DRenderer.render(this.css3DScene, this.getCamera());
  }

  /**
   * Customize how to render the frame3D
   *
   * @param {Function} f - custom rendering function
   */
  setRender(f) {
    this.render = () => {
      if (!this.isRendering) return; // encapsulate to stop with isRendering flag
      f();
    };
  }

  /**
   * Render scene3D
   *
   * @returns {void}
   */
  render() {
    // Default Render
    if (!this.isRendering) return;
    this.renderer.clearColor();
    this.renderer.render(this.scene, this.camera);
  }

  /**
   *
   * @returns {boolean} - false if root webgl is catching events, true if it's root css
   */
  isCatchingEventsCSS3D() {
    return this.rootWebGL.style.pointerEvents === 'none';
  }

  /**
   *
   * @param {boolean} value - if true allow css3D html elements to catch user events, otherwise no
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
   * @param {Billboard} billboard - billboard to add in frame3D
   */
  appendBillboard(billboard) {
    if (!this.css3DRenderer) this.initCSS3D();

    this.getScene().add(billboard.getMaskObject());
    this.css3DScene.add(billboard.getCss3DObject());
    this.billboards.push(billboard);
  }

  /**
   *
   * @param {Billboard} billboard - billboard to remove
   */
  removeBillboard(billboard) {
    this.scene.remove(billboard.getMaskObject());
    this.css3DScene.remove(billboard.getCss3DObject());

    const index = this.billboards.indexOf(billboard);
    this.billboards.splice(index, 1);
  }

  /**
   *
   * @param {boolean} value - false => stop rendering, otherwise true
   */
  setIsRendering(value) {
    this.isRendering = value;
  }

  /**
   *
   * @returns {THREE.Vector2} - size of frame3D
   */
  getSize() {
    return this.size;
  }

  /**
   * Resize frame3D
   *
   * @param {boolean} [updateTHREEVariables=true] - camera and renderer should be updated
   */
  onResize(updateTHREEVariables = true) {
    this.updateSize();

    if (this.css3DRenderer)
      this.css3DRenderer.setSize(this.size.x, this.size.y);

    if (updateTHREEVariables) {
      this.camera.aspect = this.size.x / this.size.y;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.size.x, this.size.y);
    }

    this.listeners[Frame3DBase.EVENT.RESIZE].forEach((listener) => {
      listener();
    });
  }

  /**
   * update `this.size`
   */
  updateSize() {
    let offsetLeft = parseInt(this.rootWebGL.style.left);
    if (isNaN(offsetLeft)) offsetLeft = 0;
    let offsetTop = parseInt(this.rootWebGL.style.top);
    if (isNaN(offsetTop)) offsetTop = 0;

    this.size.x = window.innerWidth - offsetLeft;
    this.size.y = window.innerHeight - offsetTop;
  }

  /**
   * Remove html from the DOM and stop listeners
   */
  dispose() {
    window.removeEventListener('resize', this.resizeListener);
    this.html().remove();

    this.listeners[Frame3DBase.EVENT.DISPOSE].forEach((listener) => {
      listener();
    });
  }

  /**
   *
   * @returns {THREE.PerspectiveCamera} - camera 3D
   */
  getCamera() {
    return this.camera;
  }

  /**
   *
   * @returns {THREE.Scene} - scene 3D
   */
  getScene() {
    return this.scene;
  }

  /**
   *
   * @returns {THREE.WebGLRenderer} - renderer 3D
   */
  getRenderer() {
    return this.renderer;
  }

  /**
   *
   * @returns {HTMLDivElement} - root webgl
   */
  getRootWebGL() {
    return this.rootWebGL;
  }
}

Frame3DBase.DEFAULT_UI_Z_INDEX = 2;

/**
 * Events triggered by {@link Frame3DBase}
 */
Frame3DBase.EVENT = {
  DISPOSE: 'dispose',
  RESIZE: 'resize',
};
