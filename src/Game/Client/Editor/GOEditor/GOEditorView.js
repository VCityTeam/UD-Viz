/** @format */
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GameObject from '../../../Shared/GameObject/GameObject';
const THREE = require('three');

import { HeightMapView } from './Heightmap/HeightmapView';
import { BodyView } from './Body/BodyView';

import './GOEditor.css';
import '../Editor.css';
import { GOEditorModel } from './GOEditorModel';

export class GOEditorView {
  constructor(config, assetsManager) {
    this.config = config;

    //where ui is append
    this.rootHtml = document.createElement('div');
    this.rootHtml.classList.add('root_GOEditorView');

    //where html goes
    this.ui = document.createElement('div');
    this.ui.classList.add('ui_GOEditorView');
    this.rootHtml.appendChild(this.ui);

    //where to render
    const canvas = document.createElement('canvas');
    canvas.classList.add('canvas_GOEditorView');
    this.canvas = canvas;
    this.rootHtml.appendChild(canvas);

    //to access 3D model
    this.assetsManager = assetsManager;

    //model
    this.model = null;

    this.pause = false;

    //THREE

    //camera

    this.camera = new THREE.OrthographicCamera(0, 0, 0, 0, 0, 10000);

    //renderer
    this.renderer = new THREE.WebGLRenderer({ canvas: canvas });
    //clear color
    this.renderer.setClearColor(0x6699cc, 1);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    //controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    //other view
    this.heightMapView = null;
    this.bodyView = null;

    //html
    this.opacitySlider = null;
    this.checkboxGizmo = null;
    this.addHeightmap = null;
    this.addBody = null;
  }

  setPause(value) {
    this.pause = value;
  }

  enableControls(value) {
    this.controls.enabled = value;
  }

  getCamera() {
    return this.camera;
  }

  getRenderer() {
    return this.renderer;
  }

  html() {
    return this.rootHtml;
  }

  focusGameObject() {
    const bbox = this.model.getBoundingBox();

    //set target
    const center = bbox.max.clone().lerp(bbox.min, 0.5);
    this.controls.target = center.clone();
    const cameraPos = new THREE.Vector3(center.x, center.y, bbox.max.z);
    this.camera.position.copy(cameraPos);

    this.camera.top = this.camera.updateProjectionMatrix();
  }

  tick() {
    requestAnimationFrame(this.tick.bind(this));

    if (this.pause || !this.model) return;
    this.controls.update();
    this.renderer.render(this.model.getScene(), this.camera);
  }

  onResize() {
    const w = this.rootHtml.clientWidth - this.ui.clientWidth;
    const h = this.rootHtml.clientHeight - this.rootHtml.offsetTop;

    const aspect = w / h;
    const size = 300;
    this.camera.left = -size;
    this.camera.right = size;
    this.camera.top = size / aspect;
    this.camera.bottom = -size / aspect;

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  getModel() {
    return this.model;
  }

  initCallbacks() {
    const _this = this;

    window.addEventListener('resize', this.onResize.bind(this));

    //checkbox
    this.checkboxGizmo.oninput = function (event) {
      if (!_this.model) return;
      const value = event.target.checked;
      _this.model.setGizmoVisibility(value);
    };

    //slider
    this.opacitySlider.oninput = function (event) {
      if (!_this.model) return;

      const ratio = parseFloat(event.target.value) / 100;
      const o = _this.model.getGameObject().getObject3D();
      if (!o) return;
      o.traverse(function (child) {
        if (child.material) {
          child.material.transparent = true;
          child.material.opacity = ratio;
        }
      });
    };

    //add heightmap
    this.addHeightmap.onclick = function (event) {
      if (!_this.model || _this.heightMapView || !_this.model.getGameObject())
        return;
      _this.heightMapView = new HeightMapView(_this);
      _this.heightMapView.init();
      _this.ui.appendChild(_this.heightMapView.html());
    };

    this.addBody.onclick = function () {
      if (!_this.model || _this.bodyView || !_this.model.getGameObject())
        return;
      _this.bodyView = new BodyView(_this);
      _this.bodyView.init();
      _this.ui.appendChild(_this.bodyView.html());
    };
  }

  initUI() {
    //opacity object slider label
    const labelOpacity = document.createElement('div');
    labelOpacity.innerHTML = 'GameObject opacity';
    this.ui.appendChild(labelOpacity);

    //opacity of the gameobject
    const opacitySlider = document.createElement('input');
    opacitySlider.setAttribute('type', 'range');
    opacitySlider.value = '100';
    this.ui.appendChild(opacitySlider);
    this.opacitySlider = opacitySlider; //ref

    //label checkbox
    const labelCheckboxGizmo = document.createElement('div');
    labelCheckboxGizmo.innerHTML = 'Gizmo Visibility';
    this.ui.appendChild(labelCheckboxGizmo);

    //checkbox
    const checkboxGizmo = document.createElement('input');
    checkboxGizmo.setAttribute('type', 'checkbox');
    this.ui.appendChild(checkboxGizmo);
    this.checkboxGizmo = checkboxGizmo;

    //add heightmap information
    const addHeightmap = document.createElement('div');
    addHeightmap.innerHTML = 'Heightmap';
    addHeightmap.classList.add('button_Editor');
    this.ui.appendChild(addHeightmap);
    this.addHeightmap = addHeightmap;

    //add body information
    const addBody = document.createElement('div');
    addBody.innerHTML = 'Body';
    addBody.classList.add('button_Editor');
    this.ui.appendChild(addBody);
    this.addBody = addBody;
  }

  onGameObject(gameobject) {
    this.model = new GOEditorModel(this.assetsManager);
    this.model.initScene();
    this.model.setGameObject(gameobject);
    this.focusGameObject();
    if (this.heightMapView) {
      this.heightMapView.dispose();
      this.heightMapView = null;
    }
    if (this.bodyView) {
      this.bodyView.dispose();
      this.bodyView = null;
    }
    this.updateUI();
    this.onResize();
  }

  updateUI() {
    this.opacitySlider.oninput({ target: this.opacitySlider }); //force update opacity
    this.checkboxGizmo.oninput({ target: this.checkboxGizmo });
  }

  load() {
    const _this = this;
    return new Promise((resolve, reject) => {
      _this.initUI();

      //start tick
      _this.tick();

      _this.initCallbacks();

      resolve();
    });
  }
}
