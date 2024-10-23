import { Camera, Vector3, Mesh, MeshBasicMaterial, BoxGeometry } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { RequestAnimationFrameProcess } from '@ud-viz/utils_browser';
import { LayerManager } from './LayerManager';

export class TargetOrbitControlMesh {
  /**
   * Constructor to initialize the camera controller and related UI elements.
   * Sets up the orbit controls, camera mesh, and initializes the UI for interaction.
   * Adds an event listener on the orbit controls to update the mesh when changes occur.
   *
   * @param {OrbitControls} orbitControls - The orbit controls used to manipulate the camera.
   * @param {Camera} camera3D - The 3D camera being controlled.
   * @param {LayerManager} layerManager - A manager handling different layers in the scene.
   */
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

  /**
   * Initializes the UI, creating a draggable element that interacts with the 3D camera and layers.
   * Adds drag-and-drop functionality to allow users to move the camera to a new position based on interaction.
   *
   * @param {Camera} camera3D - The camera that will be moved on drag end.
   * @param {LayerManager} layerManager - The layer manager that handles intersections with 3D tiles.
   */
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

  /**
   * Updates the position and scale of the mesh to reflect the current orbit target.
   *
   * This function ensures that the red target mesh follows the orbit control's target position.
   * It also adjusts the scale of the mesh based on the camera's distance to the target,
   * making the mesh appear proportional regardless of zoom level.
   */
  update() {
    this.mesh.position.copy(this.orbitControls.target.clone());
    const scale =
      this.orbitControls.object.position.distanceTo(this.orbitControls.target) /
      150;
    this.mesh.scale.set(scale, scale, scale);
    this.mesh.updateMatrixWorld();
  }

  /**
   * Smoothly moves the camera to a specified position and target over a defined duration.
   *
   * @param {Camera} camera3D - The 3D camera object to move.
   * @param {Vector3} destPosition - The destination position to move the camera to. If null, the current camera position will be used.
   * @param {Vector3} destTarget - The destination target of the orbit controls (where the camera is looking). If null, the current orbit target will be used.
   * @param {number} duration - The duration of the animation in milliseconds (default is 1500 ms).
   * @returns {Promise} - A promise that resolves when the camera has finished moving to the destination.
   *
   * The function disables the camera's orbit controls during the transition, hides the mesh (presumably representing an object in the scene),
   * and smoothly interpolates between the camera's current position and the destination. The transition is controlled using a `RequestAnimationFrameProcess`
   * that updates every 30ms. When the transition is complete, the orbit controls are re-enabled, and the mesh is made visible again.
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
