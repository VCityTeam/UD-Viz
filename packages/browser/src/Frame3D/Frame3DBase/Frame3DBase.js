import * as THREE from 'three';
import { CSS3DRenderer } from 'three/examples/jsm/renderers/CSS3DRenderer';
import { checkParentChild } from '../../HTMLUtil';
import { DomElement3D } from '../DomElement3D';

import './Frame3DBase.css';

/** @class*/
export class Frame3DBase {
  /**
   * Basic Frame3D wrap different html element to handle CSS3D rendering {@link CSS3DRenderer}.
   * It's possible to add {@link DomElement3D} to this.
   * Composed with {@link THREE.Scene} + {@link THREE.PerspectiveCamera} + {@link THREE.WebGLRenderer}.
   *
   * @param {object} options - options to configure frame3Dbase
   * @param {HTMLElement} [options.parentDomElement=document.body] - dom parent element of domElement frame3DBase
   * @param {boolean} [options.catchEventsCSS3D=false] - event are catch by css3D element (ie {@link DomElement3D})
   * @param {boolean} [init3D=true] - {@link THREE.Scene} + {@link THREE.PerspectiveCamera} + {@link THREE.WebGLRenderer} should be init
   */
  constructor(options = {}, init3D = true) {
    /**
     * root html 
     *
      @type {HTMLDivElement} */
    this.domElement = document.createElement('div');
    this.domElement.classList.add('root_Frame3DBase');

    // Add to DOM
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
    this.domElementWebGL.classList.add('webGL_Frame3DBase');

    /**
     * root css (where css3Delement are added)
     *
      @type {HTMLDivElement}  */
    this.domElementCss = document.createElement('div');
    this.domElementCss.classList.add('css_Frame3DBase');

    /** 
     * where ui element should be added (note that you have to handle manually z-index element composing ui, should it be automatically ?) 
     *  
     @type {HTMLDivElement}*/
    this.domElementUI = document.createElement('div');
    this.domElementUI.classList.add('ui_Frame3DBase');

    // add dom layer
    this.domElement.appendChild(this.domElementUI);
    this.domElement.appendChild(this.domElementCss);
    this.domElement.appendChild(this.domElementWebGL);

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
     * current domElements 3D in frame3D
     *
      @type {DomElement3D[]} */
    this.domElement3DArray = [];

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
      this.domElementWebGL.appendChild(canvas);
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
    this.renderer.clearColor();
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
   */
  appendDomElement3D(domElement3D) {
    if (!this.css3DRenderer) this.initCSS3D();

    this.scene.add(domElement3D.maskObject);
    this.css3DScene.add(domElement3D.css3DObject);
    this.domElement3DArray.push(domElement3D);
  }

  /**
   *
   * @param {DomElement3D} domElement3D - domElement3D to remove
   */
  removeDomElement3D(domElement3D) {
    this.scene.remove(domElement3D.maskObject);
    this.css3DScene.remove(domElement3D.css3DObject);

    const index = this.domElement3DArray.indexOf(domElement3D);
    this.domElement3DArray.splice(index, 1);
  }

  /**
   *
   * @param {boolean} value - false => stop rendering, otherwise true
   */
  setIsRendering(value) {
    this.isRendering = value;
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
    let offsetLeft = parseInt(this.domElementWebGL.style.left);
    if (isNaN(offsetLeft)) offsetLeft = 0;
    let offsetTop = parseInt(this.domElementWebGL.style.top);
    if (isNaN(offsetTop)) offsetTop = 0;

    this.size.x = window.innerWidth - offsetLeft;
    this.size.y = window.innerHeight - offsetTop;
  }

  /**
   * Remove html from the DOM and stop listeners
   */
  dispose() {
    window.removeEventListener('resize', this.resizeListener);
    this.domElement.remove();

    this.listeners[Frame3DBase.EVENT.DISPOSE].forEach((listener) => {
      listener();
    });
  }
}

/**
 * Events triggered by {@link Frame3DBase}
 */
Frame3DBase.EVENT = {
  DISPOSE: 'dispose',
  RESIZE: 'resize',
};
