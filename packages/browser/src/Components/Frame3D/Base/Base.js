import * as THREE from 'three';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { checkParentChild } from '../../Components/HTMLUtils';

import './Base.css';

export class Base {
  /**
   *  Base View of an ud-viz application
   *  expliquer le css renderer and so on
   * @param {object} config
   * @param {object} options
   * @param {HTMLElement} options.htmlParent
   * @param {boolean} options.catchEventsCSS3D
   */
  constructor(config, options = {}) {
    // Conf
    if (!config) throw new Error('no config');
    this.config = config;

    // Root html
    this.rootHtml = document.createElement('div');
    this.rootHtml.id = 'root_ViewBase';

    // Add to DOM
    if (options.htmlParent) {
      options.htmlParent.appendChild(this.rootHtml);
    } else {
      document.body.appendChild(this.rootHtml);
    }

    // Root webgl
    this.rootWebGL = document.createElement('div');
    this.rootWebGL.id = 'viewerDiv'; // => So Widgets can access rootWebGL with id

    // Root css
    this.rootCss = document.createElement('div');
    this.rootCss.id = 'css_BaseView';

    this.rootHtml.appendChild(this.rootCss);
    this.rootHtml.appendChild(this.rootWebGL);

    // Ui
    this.ui = document.createElement('div');
    this.ui.classList.add('ui_BaseView');
    this.rootWebGL.appendChild(this.ui);

    // Listen resize event
    this.resizeListener = this.onResize.bind(this);
    window.addEventListener('resize', this.resizeListener);

    // Pause
    this.isRendering = true;

    // Size of the view
    this.size = new THREE.Vector2();

    // Flag
    this.disposed = false;

    // 3D rendering attributes
    this.scene = null; // The three js scene
    this.renderer = null; // The webgl renderer
    this.camera = null; // The camera used to render the scene

    // CSS3D attributes
    this.css3DRenderer = null;
    this.css3DScene = null;
    this.billboards = [];
    const raycaster = new THREE.Raycaster();
    this.toCSS3DEvent = (event) => {
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

    this.toWebGLEvent = (event) => {
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

    // Default catch events
    const catchEventsCSS3D = options.catchEventsCSS3D || false;
    this.catchEventsCSS3D(catchEventsCSS3D);
  }

  /**
   * Initialize Scene + Camera + Renderer with THREE
   */
  init3D() {
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
    const css3DRenderer = new CSS3DRenderer();
    this.css3DRenderer = css3DRenderer;

    // Add html el
    this.rootCss.appendChild(css3DRenderer.domElement);

    // Create a new scene for the css3D renderer
    this.css3DScene = new THREE.Scene();

    // Listen to switch mode between css3D and webgl controls
    this.rootWebGL.onmousedown = this.toCSS3DEvent;
    this.rootCss.onmousedown = this.toWebGLEvent;

    // Start ticking render of css3D renderer
    const fps = 20;

    let now;
    let then = Date.now();
    let delta;
    const tick = () => {
      if (this.disposed) return; // Stop requesting frame if disposed

      requestAnimationFrame(tick);

      now = Date.now();
      delta = now - then;

      if (delta > 1000 / fps) {
        // Update time stuffs
        then = now - (delta % 1000) / fps;

        if (!this.isRendering) return;
        css3DRenderer.render(this.css3DScene, this.getCamera());
      }
    };
    tick();

    // Launch an async resize
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

  start(extent) {
    console.error('DEPRECATED SHOULD BE DONE IN APP');
    this.initItownsView(extent);
    // Start
    // this.inputManager.startListening(this.rootWebGL);

    // Dynamic near far computation
    this.itownsView.addFrameRequester(
      itowns.MAIN_LOOP_EVENTS.BEFORE_RENDER,
      this.itownsRequesterBeforeRender
    );
  }

  getSize() {
    return this.size;
  }

  /**
   *
   * @param {*} updateTHREEVariables
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

    console.warn('WARNING: camera + renderer not resize');
  }

  /**
   * Remove html from the DOM and stop listeners
   */
  dispose() {
    window.removeEventListener('resize', this.resizeListener);
    this.html().remove();
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

import * as Components from './Components/Components';
export { Components };
