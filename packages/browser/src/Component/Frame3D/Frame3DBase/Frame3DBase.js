import * as THREE from 'three';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { checkParentChild } from '../../HTMLUtil';
import { Billboard } from '../Component/Billboard';

import './Frame3DBase.css';

/**
 * @classdesc The basic view of an ud-viz application
 * @todo expliquer le css renderer and so on
 */
export class Frame3DBase {
  /**
   * @param {object} options
   * @param {HTMLElement} options.htmlParent
   * @param {boolean} options.catchEventsCSS3D
   * @param {number} options.css3DRendererFps
   * @param {boolean} init3D
   */
  constructor(options = {}, init3D = true) {
    // Root html
    this.rootHtml = document.createElement('div');
    this.rootHtml.id = 'root_Frame3DBase';

    // Add to DOM
    if (options.htmlParent) {
      options.htmlParent.appendChild(this.rootHtml);
    } else {
      document.body.appendChild(this.rootHtml);
    }

    // Root webgl
    this.rootWebGL = document.createElement('div');
    this.rootWebGL.id = 'viewerDiv'; // => So Widget can access rootWebGL with id

    // Root css
    this.rootCss = document.createElement('div');
    this.rootCss.id = 'css_Frame3DBase';

    this.rootHtml.appendChild(this.rootCss);
    this.rootHtml.appendChild(this.rootWebGL);

    // Ui
    this.ui = document.createElement('div');
    this.ui.classList.add('ui_Frame3DBase');
    this.rootWebGL.appendChild(this.ui);

    // Listen resize event
    this.resizeListener = this.onResize.bind(this);
    window.addEventListener('resize', this.resizeListener);

    // Pause
    this.isRendering = true;

    /** @type {THREE.Vector2} Size of the frame3D */
    this.size = new THREE.Vector2(1, 1);

    /** @type {THREE.Scene} */
    this.scene = null;

    /** @type {THREE.WebGLRenderer} */
    this.renderer = null;

    /** @type {THREE.PerspectiveCamera} */
    this.camera = null;

    /** @type {CSS3DRenderer} */
    this.css3DRenderer = null;

    /** @type {THREE.Scene} */
    this.css3DScene = null;

    /** @type {Billboard[]} */
    this.billboards = [];

    // Default catch events
    const catchEventsCSS3D = options.catchEventsCSS3D || false;
    this.catchEventsCSS3D(catchEventsCSS3D);

    // listeners Frame3DBase.EVENT (why not using eventSender of ud-viz/core ?)
    this.listeners = {};
    this.listeners[Frame3DBase.EVENT.DISPOSE] = [];
    this.listeners[Frame3DBase.EVENT.RESIZE] = [];

    if (init3D) {
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

  on(eventID, listener) {
    if (!this.listeners[eventID])
      throw new Error('this event is not a Frame3DBase.EVENT');
    this.listeners[eventID].push(listener);
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
   * @returns {HTMLElement} the root html of this view
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
    this.rootCss.onmousedown = (event) => {
      if (!this.isCatchingEventsCSS3D()) return;

      let onBillboard = false;
      if (event.path.length) {
        const firstHoverEl = event.path[0];

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

  renderCSS3D() {
    if (!this.isRendering || !this.css3DRenderer) return;
    this.css3DRenderer.render(this.css3DScene, this.getCamera());
  }

  // Allow user to set a custom render pass
  setRender(f) {
    this.render = () => {
      if (!this.isRendering) return; // encapsulate to stop with isRendering flag
      f();
    };
  }

  render() {
    // Default Render
    if (!this.isRendering) return;
    this.renderer.clearColor();
    this.renderer.render(this.scene, this.camera);
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

  /**
   *
   * @param {*} billboard
   */
  appendBillboard(billboard) {
    if (!this.css3DRenderer) this.initCSS3D();

    this.getScene().add(billboard.getMaskObject());
    this.css3DScene.add(billboard.getCss3DObject());
    this.billboards.push(billboard);
  }

  /**
   *
   * @param {*} billboard
   */
  removeBillboard(billboard) {
    this.scene.remove(billboard.getMaskObject());
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

  getSize() {
    return this.size;
  }

  /**
   *
   * @param {*} updateTHREEVariables
   */
  onResize(updateTHREEVariables = true) {
    let offsetLeft = parseInt(this.rootWebGL.style.left);
    if (isNaN(offsetLeft)) offsetLeft = 0;
    let offsetTop = parseInt(this.rootWebGL.style.top);
    if (isNaN(offsetTop)) offsetTop = 0;

    this.size.x = window.innerWidth - offsetLeft;
    this.size.y = window.innerHeight - offsetTop;

    if (this.css3DRenderer)
      this.css3DRenderer.setSize(this.size.x, this.size.y);

    if (updateTHREEVariables) {
      this.camera.aspect = this.size.x / this.size.y;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.size.x, this.size.y);
    }

    this.listeners[Frame3DBase.EVENT.RESIZE].forEach((listener) => {
      listener(this);
    });
  }

  /**
   * Remove html from the DOM and stop listeners
   */
  dispose() {
    window.removeEventListener('resize', this.resizeListener);
    this.html().remove();

    this.listeners[Frame3DBase.EVENT.DISPOSE].forEach((listener) => {
      listener(this);
    });
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

Frame3DBase.EVENT = {
  DISPOSE: 'dispose',
  RESIZE: 'resize',
};
