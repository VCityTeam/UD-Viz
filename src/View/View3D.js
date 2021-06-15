/** @format */

import * as proj4 from 'proj4';
import * as THREE from 'three';
import * as itowns from 'itowns';
import { CSS3DObject, CSS3DRenderer } from 'three-css3drenderer';

//TODO move THREEUtils.Transform at this level of Component
import THREEUtils from '../Game/Shared/Components/THREEUtils';

import './View3D.css';

const ID_VIEW3D = 'viewerDiv'; //only one View3D per at the same time
const ID_CSS3DVIEW = 'viewCss3D';

export class View3D {
  constructor(params = {}) {
    params.htmlParent = params.htmlParent || document.body;

    //html
    this.rootHtml = document.createElement('div');
    this.rootHtml.id = ID_VIEW3D; //itowns div
    params.htmlParent.appendChild(this.rootHtml);
    window.addEventListener('resize', this.onResize.bind(this));

    //conf
    this.config = params.config || {};

    //itowns view
    this.itownsView = null;

    this.pause = false;

    //CSS3D attributes
    this.css3DRenderer = null;
    this.css3DScene = null;
    this.maskObject = null;
  }

  initCSS3D() {
    //CSS3DRenderer
    const css3DRenderer = new CSS3DRenderer();
    css3DRenderer.domElement.id = ID_CSS3DVIEW;
    this.rootHtml.appendChild(css3DRenderer.domElement);
    this.css3DRenderer = css3DRenderer;

    this.css3DScene = new THREE.Scene();

    this.maskObject = new THREE.Object3D();
    this.itownsView.scene.add(this.maskObject);

    setTimeout(this.onResize.bind(this), 100);

    const _this = this;
    const tick = function () {
      requestAnimationFrame(tick);
      css3DRenderer.render(_this.css3DScene, _this.itownsView.camera.camera3D);
    };
    tick();
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

    this.css3DScene.add(newElement);

    //mask
    const geometry = new THREE.PlaneGeometry(size3D.width, size3D.height);

    const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
    material.color.set('black');
    material.opacity = 0;
    material.blending = THREE.NoBlending;

    // const material = new THREE.MeshBasicMaterial({
    //   color: 0xffff00,
    //   side: THREE.DoubleSide,
    // });

    const plane = new THREE.Mesh(geometry, material);
    plane.position.copy(transform.getPosition());
    plane.rotation.setFromVector3(transform.getRotation());
    plane.scale.copy(transform.getScale());
    plane.updateMatrixWorld();
    this.maskObject.add(plane);
  }

  init(extent) {
    this.initItownsView(extent);
  }

  setPause(value) {
    this.pause = value;
  }

  html() {
    return this.rootHtml;
  }

  initItownsView(extent) {
    // Define EPSG:3946 projection which is the projection used in the 3D view
    // (planarView of iTowns). It is indeed needed
    // to convert the coordinates received from the world server
    // to this coordinate system.
    proj4.default.defs(
      'EPSG:3946',
      '+proj=lcc +lat_1=45.25 +lat_2=46.75' +
        ' +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
    );

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

    this.itownsView = new itowns.PlanarView(this.rootHtml, extent, {
      disableSkirt: false,
      placement: {
        coord: coordinates,
        heading: heading,
        range: range,
        tilt: tilt,
      },
      noControls: false,
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
    this.itownsView.debugResize(w, h);

    if (this.css3DRenderer) this.css3DRenderer.setSize(w, h);
  }

  dispose() {
    this.itownsView.dispose();
    window.removeEventListener('resize', this.onResize.bind(this));
    this.rootHtml.remove();
  }

  getItownsView() {
    return this.itownsView;
  }
}
