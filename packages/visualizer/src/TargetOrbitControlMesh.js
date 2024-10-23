import { Mesh, MeshBasicMaterial, BoxGeometry } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RequestAnimationFrameProcess } from '@ud-viz/utils_browser';

export class TargetOrbitControlMesh {
  constructor(orbitControls, camera3D, layerManager) {
    /** @type {HTMLElement} */
    this.domElement = document.createElement('div');

    /** @type {OrbitControls} */
    this.orbitControls = orbitControls;

    /** @type {Mesh} */
    this.mesh = new Mesh(
      new BoxGeometry(),
      new MeshBasicMaterial({ color: 'red' })
    );

    this.mesh.name = 'target_orbit_controls';

    this.initUI(camera3D, layerManager);

    this.orbitControls.addEventListener('change', () => {
      this.update();
    });

    this.update();
  }

  initUI(camera3D, layerManager) {
    const element = document.createElement('div');
    element.classList.add('drag_element');
    element.draggable = true;

    element.ondragend = (event) => {
      if (event.target === element) {
        const i = layerManager.eventTo3DTilesIntersect(event, camera3D);
        if (i) this.moveCamera(camera3D, null, i.point, 500);
      }
    };
    this.domElement.appendChild(element);
  }

  update() {
    this.mesh.position.copy(this.orbitControls.target.clone());
    const scale =
      this.orbitControls.object.position.distanceTo(this.orbitControls.target) /
      150;
    this.mesh.scale.set(scale, scale, scale);
    this.mesh.updateMatrixWorld();
  }

  /**
   *
   * @param camera3D
   * @param {Vector3} destPosition - destination position of the camera
   * @param {Vector3} destTarget - destination target of the orbit controls
   * @param {number} duration - duration in ms
   * @returns {Promise} - promise resolving when the camera has moved
   */
  moveCamera(camera3D, destPosition, destTarget, duration = 1500) {
    if (!destPosition) destPosition = camera3D.position.clone();
    if (!destTarget) destTarget = this.orbitControls.target.clone();
    const startCameraPosition = camera3D.position.clone();
    const startCameraTargetPosition = this.orbitControls.target.clone();

    this.mesh.visible = false;

    this.orbitControls.enabled = false;
    const process = new RequestAnimationFrameProcess(30);

    let currentDuration = 0;

    return new Promise((resolve) => {
      process.start((dt) => {
        currentDuration += dt;
        const ratio = Math.min(Math.max(0, currentDuration / duration), 1);

        camera3D.position.lerpVectors(startCameraPosition, destPosition, ratio);

        this.orbitControls.target.lerpVectors(
          startCameraTargetPosition,
          destTarget,
          ratio
        );

        this.orbitControls.update();

        if (ratio == 1) {
          this.orbitControls.enabled = true;
          this.mesh.visible = true;
          process.stop();
          resolve();
        }
      });
    });
  }
}
