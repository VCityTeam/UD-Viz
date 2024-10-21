import {
  createLocalStorageCheckbox,
  createLocalStorageDetails,
} from '@ud-viz/utils_browser';

import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { PlanarView } from 'itowns';
import {
  Vector3,
  Matrix3,
  Plane,
  PlaneGeometry,
  Mesh,
  MeshBasicMaterial,
  DoubleSide,
} from 'three';

/**
 * Representing a clipping plane in a 3D visualization
 * UI controls for manipulating the plane (managing its visibility and transformation)
 */
export class ClippingPlane {
  constructor(itownsView) {
    /** @type {Plane} */
    this.plane = new Plane();

    /**@type {PlanarView} */
    this.itownsView = itownsView;

    /** @type {HTMLDivElement} */
    this.domElement = document.createElement('div');

    /** @type {HTMLDetailsElement}*/
    this.details = null;
    /** @type {HTMLInputElement}*/
    this.planeVisible = null;
    /** @type {HTMLInputElement}*/
    this.clippingEnable = null;
    /** @type {Array<HTMLButtonElement>}*/
    this.buttons = [];

    /**@type {TransformControls} */
    this.transformControls = null;

    /**@type {Mesh} */
    this.quad = null;

    this.initUI();
    this.initQuad();
    this.initTransformControls();
    this.initCallback();
  }

  initUI() {
    this.details = createLocalStorageDetails(
      'clipping_plane_local_storage_key_point_cloud_visualizer',
      'Clipping plane',
      this.domElement
    );

    this.planeVisible = createLocalStorageCheckbox(
      'plane_visibility_key_loacal_storage',
      'Visible: ',
      this.details,
      false
    );

    this.clippingEnable = createLocalStorageCheckbox(
      'plane_enable_key_loacal_storage',
      'Enable: ',
      this.details
    );

    const mode = ['translate', 'rotate', 'scale'];
    this.buttons = [];

    mode.forEach((m) => {
      const buttonMode = document.createElement('button');
      buttonMode.innerText = m;
      buttonMode.mode = m;
      this.buttons[m + 'Button'] = buttonMode;
      this.details.appendChild(buttonMode);
    });
  }

  initQuad() {
    this.quad = new Mesh(
      new PlaneGeometry(),
      new MeshBasicMaterial({
        opacity: 0.5,
        transparent: true,
        side: DoubleSide,
      })
    );

    this.quad.visible = false;
    this.quad.name = 'quadOfClippingPlane';
  }

  update() {
    this.plane.normal.copy(
      new Vector3(0, 0, 1).applyNormalMatrix(
        new Matrix3().getNormalMatrix(this.quad.matrixWorld)
      )
    );
    // quad.position belongs to plane => quad.position.dot(plane.normal) = -constant
    this.plane.constant = -(
      this.plane.normal.x * this.quad.position.x +
      this.plane.normal.y * this.quad.position.y +
      this.plane.normal.z * this.quad.position.z
    );
  }

  initTransformControls() {
    this.transformControls = new TransformControls(
      this.itownsView.camera.camera3D,
      this.itownsView.mainLoop.gfxEngine.label2dRenderer.domElement
    );

    this.transformControls.addEventListener('change', this.update.bind(this));

    this.update();

    this.itownsView.scene.add(this.transformControls);
  }

  initCallback() {
    this.planeVisible.addEventListener('change', (event) => {
      this.quad.visible = event.target.checked;
      if (this.quad.visible) {
        this.transformControls.attach(this.quad);
      } else {
        this.transformControls.detach();
      }
      this.transformControls.updateMatrixWorld();
      this.itownsView.notifyChange();
    });

    this.clippingEnable.addEventListener('change', (event) => {
      this.itownsView.mainLoop.gfxEngine.renderer.localClippingEnabled =
        event.target.checked;
      this.itownsView.notifyChange();
    });

    this.buttons.forEach((button) => {
      button.addEventListener('click', () => {
        this.transformControls.setMode(button.mode);
        this.planeVisible.dispatchEvent(new Event('change'));
      });
    });
  }
}
