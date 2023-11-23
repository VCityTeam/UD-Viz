import * as THREE from 'three';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { DomElement3D } from './DomElement3D';
import {
  defaultConfigScene,
  initScene,
  checkParentChild,
} from '@ud-viz/utils_browser';

/** @class*/
export class Base {
  /**
   * Basic Frame3D wrap different html element to handle CSS3D rendering {@link CSS3DRenderer}.
   * It's possible to add {@link DomElement3D} to this.
   * Composed with {@link THREE.Scene} + {@link THREE.PerspectiveCamera} + {@link THREE.WebGLRenderer}.
   *
   * @param {object} options - options to configure frame3Dbase
   * @param {string} [options.domElementClass] - dom element class name
   * @param {HTMLElement} [options.parentDomElement=document.body] - dom parent element of domElement frame3DBase
   * @param {boolean} [options.catchEventsCSS3D=false] - event are catch by css3D element (ie {@link DomElement3D})
   * @param {import('@ud-viz/utils_browser').SceneConfig} [options.sceneConfig] - scene config
   * @param {boolean} [init3D=true] - {@link THREE.Scene} + {@link THREE.PerspectiveCamera} + {@link THREE.WebGLRenderer} should be init
   */
  constructor(options = {}, init3D = true) {
    /**  
     * root html
     *
      @type {HTMLDivElement} */
    this.domElement = document.createElement('div');

    /**
     * `this.domElement` has be added to the DOM in order to compute its dimension
     * this is necessary because the itowns.PlanarView need these dimension in order to be initialized correctly
     */
    if (options.parentDomElement instanceof HTMLElement) {
      options.parentDomElement.appendChild(this.domElement);
    } else {
      document.body.appendChild(this.domElement);
    }

    /**
     * root webgl (where canvas is added)
     *
      @type {HTMLDivElement}  */
    this.domElementWebGL = document.createElement('div');

    /**
     * root css (where css3Delement are added)
     *
      @type {HTMLDivElement}  */
    this.domElementCss = document.createElement('div');

    /** 
     * where ui element should be added (note that you have to handle manually z-index element composing ui, should it be automatically ?) 
     *  
     @type {HTMLDivElement}*/
    this.domElementUI = document.createElement('div');

    // add dom layer
    this.domElement.appendChild(this.domElementUI);
    this.domElement.appendChild(this.domElementCss);
    this.domElement.appendChild(this.domElementWebGL);

    if (typeof options.domElementClass == 'string') {
      this.domElementWebGL.classList.add(options.domElementClass);
      this.domElementCss.classList.add(options.domElementClass);
      this.domElementUI.classList.add(options.domElementClass);
    }

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
     * current domElements 3D in frame3D
     *
      @type {DomElement3D[]} */
    this.domElement3DArray = [];

    // Default catch events
    const catchEventsCSS3D = options.catchEventsCSS3D || false;
    this.catchEventsCSS3D(catchEventsCSS3D);

    /**
     * listeners of {@link Base.EVENT}
     *
      @type {Object<string,Function[]>} */
    this.listeners = {};
    for (const key in Base.EVENT) {
      this.listeners[Base.EVENT[key]] = [];
    }

    /** @type {import('../THREEUtil').SceneConfig} */
    this.sceneConfig = options.sceneConfig || defaultConfigScene;

    /** @type {THREE.DirectionalLight|null} */
    this.directionalLight = null;

    if (init3D) {
      // Initialize 3D

      THREE.Object3D.DEFAULT_UP.set(0, 0, 1);

      this.scene = new THREE.Scene();
      const canvas = document.createElement('canvas');
      if (options.domElementClass)
        canvas.classList.add(options.domElementClass);
      this.domElementWebGL.appendChild(canvas);
      this.renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        logarithmicDepthBuffer: true,
        alpha: true,
      });
      this.camera = new THREE.PerspectiveCamera(60, 1, 1, 1000); // Default params
      this.scene.add(this.camera);

      // init with sceneconfig
      this.directionalLight = initScene(
        this.camera,
        this.renderer,
        this.scene,
        this.sceneConfig
      );
    }
  }

  /**
   * Register a listener on a {@link Base.EVENT}
   *
   * @param {string} eventID - event to add listener {@link Base.EVENT}
   * @param {Function} listener - callback to call on eventID
   */
  on(eventID, listener) {
    if (!this.listeners[eventID])
      throw new Error('this event is not a Base.EVENT');
    this.listeners[eventID].push(listener);
  }

  /**
   * Init the css3D renderer
   */
  initCSS3D() {
    // CSS3DRenderer
    this.css3DRenderer = new CSS3DRenderer();

    // Add html el
    this.domElementCss.appendChild(this.css3DRenderer.domElement);

    // Create a new scene for the css3D renderer
    this.css3DScene = new THREE.Scene();

    // Listen to switch mode between css3D and webgl controls
    const raycaster = new THREE.Raycaster();

    // check if enter css3D event
    this.domElementWebGL.onmousedown = (event) => {
      if (this.isCatchingEventsCSS3D()) return;
      if (checkParentChild(event.target, this.domElementUI)) return; // Do not propagate if it's the ui that has been clicked

      const el = this.domElementWebGL;

      const mouse = new THREE.Vector2(
        -1 + (2 * event.offsetX) / (el.clientWidth - parseInt(el.offsetLeft)),
        1 - (2 * event.offsetY) / (el.clientHeight - parseInt(el.offsetTop))
      );

      raycaster.setFromCamera(mouse, this.camera);

      for (let index = 0; index < this.domElement3DArray.length; index++) {
        const element = this.domElement3DArray[index];

        const i = raycaster.intersectObject(element.maskObject);
        if (i.length) {
          this.catchEventsCSS3D(true);
          element.select(true);
          return;
        }
      }
    };

    // check if enter canvas webgl event
    this.domElementCss.onmousedown = (event) => {
      if (!this.isCatchingEventsCSS3D()) return;

      let onDomElement3D = false;

      // compatible chrome & firefox
      const path = event.path || (event.composedPath && event.composedPath());

      if (path.length) {
        const firstHoverEl = path[0];

        for (let index = 0; index < this.domElement3DArray.length; index++) {
          const element = this.domElement3DArray[index];
          if (element.domElement == firstHoverEl) {
            onDomElement3D = true;
            break;
          }
        }
      }
      if (!onDomElement3D) {
        this.catchEventsCSS3D(false);
        this.domElement3DArray.forEach(function (b) {
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
    this.css3DRenderer.render(this.css3DScene, this.camera);
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
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
  }

  /**
   *
   * @returns {boolean} - false if root webgl is catching events, true if it's root css
   */
  isCatchingEventsCSS3D() {
    return this.domElementWebGL.style.pointerEvents === 'none';
  }

  /**
   *
   * @param {boolean} value - if true allow css3D html elements to catch user events, otherwise no
   */
  catchEventsCSS3D(value) {
    if (value) {
      this.domElementWebGL.style.pointerEvents = 'none';
    } else {
      this.domElementWebGL.style.pointerEvents = '';
    }
  }

  /**
   *
   * @param {DomElement3D} domElement3D - domElement3D to add in frame3D
   * @param {THREE.Object3D} parent - parent of the maskElement
   */
  appendDomElement3D(domElement3D, parent = this.scene) {
    if (!this.css3DRenderer) this.initCSS3D();
    parent.add(domElement3D);
    this.css3DScene.add(domElement3D.css3DObject);
    this.domElement3DArray.push(domElement3D);
  }

  /**
   *
   * @param {DomElement3D} domElement3D - domElement3D to remove
   */
  removeDomElement3D(domElement3D) {
    domElement3D.parent.remove(domElement3D);
    this.css3DScene.remove(domElement3D.css3DObject);
    const index = this.domElement3DArray.indexOf(domElement3D);
    this.domElement3DArray.splice(index, 1);
  }

  /**
   * Resize frame3D
   *
   * @param {boolean} [updateTHREEVariables=true] - camera and renderer should be updated
   */
  onResize(updateTHREEVariables = true) {
    if (this.css3DRenderer)
      this.css3DRenderer.setSize(
        this.domElementCss.clientWidth,
        this.domElementCss.clientHeight
      );

    if (updateTHREEVariables) {
      this.camera.aspect =
        this.domElementWebGL.clientWidth / this.domElementWebGL.clientHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(
        this.domElementWebGL.clientWidth,
        this.domElementWebGL.clientHeight
      );
    }

    this.listeners[Base.EVENT.RESIZE].forEach((listener) => {
      listener();
    });
  }

  /**
   * Remove html from the DOM and stop listeners
   */
  dispose() {
    window.removeEventListener('resize', this.resizeListener);
    this.domElement.remove();

    this.listeners[Base.EVENT.DISPOSE].forEach((listener) => {
      listener();
    });
  }
}

/**
 * Events triggered by {@link Base}
 */
Base.EVENT = {
  DISPOSE: 'dispose',
  RESIZE: 'resize',
};
