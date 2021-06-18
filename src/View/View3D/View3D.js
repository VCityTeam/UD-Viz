/** @format */

import * as THREE from 'three';
import * as itowns from 'itowns';
import { CSS3DObject, CSS3DRenderer } from 'three-css3drenderer';

import './View3D.css';
import { InputManager } from '../../Components/InputManager';

import * as proj4 from 'proj4';

// Define EPSG:3946 projection which is the projection used in the 3D view
// (planarView of iTowns). It is indeed needed
// to convert the coordinates received from the world server
// to this coordinate system.
proj4.default.defs(
  'EPSG:3946',
  '+proj=lcc +lat_1=45.25 +lat_2=46.75' +
    ' +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
);

export class View3D {
  constructor(params = {}) {
    this.rootHtml = document.createElement('div');
    this.rootHtml.id = 'root_View3D';

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

    window.addEventListener('resize', this.onResize.bind(this));

    //conf
    this.config = params.config || {};

    //itowns view
    this.itownsView = null;

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

  appendToUI(el) {
    this.ui.appendChild(el);
  }

  getItownsView() {
    return this.itownsView;
  }

  html() {
    return this.rootHtml;
  }

  getInputManager() {
    return this.inputManager;
  }

  initCSS3D() {
    //CSS3DRenderer
    const css3DRenderer = new CSS3DRenderer();
    this.css3DRenderer = css3DRenderer;
    this.rootCss.appendChild(css3DRenderer.domElement);

    this.css3DScene = new THREE.Scene();
    this.maskObject = new THREE.Object3D();
    this.itownsView.scene.add(this.maskObject);

    const _this = this;

    const tick = function () {
      if (_this.disposed) return;
      requestAnimationFrame(tick);
      if (_this.pause) return;
      css3DRenderer.render(_this.css3DScene, _this.itownsView.camera.camera3D);
    };
    tick();

    setTimeout(this.onResize.bind(this), 100);
  }

  isCatchingEventsCSS3D() {
    return this.rootWebGL.style.pointerEvents === 'none';
  }

  catchEventsCSS3D(value) {
    if (value) {
      this.rootWebGL.style.pointerEvents = 'none';
    } else {
      this.rootWebGL.style.pointerEvents = '';
    }
  }

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

  setPause(value) {
    this.pause = value;
  }

  initItownsView(extent) {
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
      noControls: true,
    });

    //TODO parler a itowns remove listener of the resize
    this.itownsView.debugResize = this.itownsView.resize;
    this.itownsView.resize = function () {
      //nada
    };
  }

  onResize() {
    const w = window.innerWidth - this.rootHtml.offsetLeft;
    const h = window.innerHeight - this.rootHtml.offsetTop;

    //TODO remove this fonction
    if (this.itownsView) this.itownsView.debugResize(w, h);

    if (this.css3DRenderer) this.css3DRenderer.setSize(w, h);
  }

  dispose() {
    this.itownsView.dispose();
    window.removeEventListener('resize', this.onResize.bind(this));
    this.html().remove();
    this.inputManager.dispose();
    this.disposed = true;
  }

  getItownsView() {
    return this.itownsView;
  }
}
