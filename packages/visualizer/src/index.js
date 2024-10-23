import { MAIN_LOOP_EVENTS } from 'itowns';
import { Scene, PointsMaterial, Box3, Raycaster } from 'three';
import {
  computeNearFarCamera,
  RequestAnimationFrameProcess,
} from '@ud-viz/utils_browser';

import { ClippingPlane } from './ClippingPlane';
import { TargetOrbitControlMesh } from './TargetOrbitControlMesh';
import { ViewManager } from './ViewManager';
import { LayerManager } from './LayerManager';
import { setUpCameraDefaults } from './cameraSetup';
import { setupLoadingUI, setUpSpeedControls } from './uiSetup';
import { Measure } from './Measure';

/**
 * @typedef {object} LayerConfig
 * @property {string} name - Name of the C3DTilesLayer.
 * @property {object} source - Source of the C3DTilesLayer.
 * @property {string} source.url - URL to the tileset.json.
 */

/**
 * Visualizer class for rendering 3D Tiles and managing interactions.
 *
 * @param {import("itowns").Extent} extent - The extent of the area being visualized in the itowns framework.
 * @param {Array<LayerConfig>} layerConfigs - Configuration parameters for 3DTiles layers.
 * @param {object} options - Configuration options for the visualizer.
 * @param {HTMLElement} options.parentDomElement - The DOM element where the planar view will be appended.
 * @param {string} options.domElementClass - CSS class to apply to the main DOM element.
 * @param {Array<string>} options.c3DTilesLoadingDomElementClasses - CSS classes for loading indicators.
 * @param {object} options.camera - Camera configuration options.
 * @param {object} options.camera.default - Default camera settings.
 * @param {object} options.camera.default.position - Default position for the camera.
 * @param {number} options.maxSubdivisionLevel - Maximum level of detail for base map texture.
 * @param {number} options.defaultPointCloudSize - Default size for point cloud points.
 * @param {number} [options.raycasterPointsThreshold=Visualizer.RAYCASTER_POINTS_THRESHOLD] - Threshold for raycaster points.
 * @param {number} [options.measure] - If true, initializes the measure tool.
 *
 * The constructor sets up the visualization environment, including initializing scenes,
 * camera settings, layer management, and UI components. It also handles the rendering loop
 * and event listeners for user interactions.
 *
 * Note: options.camera.default.quaternion is not available option since the camera
 * is initialized as pointing towards the center of the bounding box of the
 * observed 3DTiles.
 */
export class Visualizer {
  constructor(extent, layerConfigs, options = {}) {
    /** @type {Raycaster} */
    this.raycaster = new Raycaster();

    /** @type {ViewManager} */
    this.viewManager = new ViewManager(extent, options);

    /** @type {Scene} */
    this.topScene = new Scene(); // Scene for additional rendering layers
    this.itownsView.mainLoop.gfxEngine.renderer.autoClear = false; // Prevent automatic clearing of the renderer

    // Custom render function to manage the rendering order of scenes
    this.itownsView.render = () => {
      this.itownsView.mainLoop.gfxEngine.renderer.clear(); // Clear buffers before rendering
      this.itownsView.mainLoop.gfxEngine.renderer.render(
        this.itownsView.scene,
        this.itownsView.camera.camera3D
      ); // Render the main scene
      this.itownsView.mainLoop.gfxEngine.renderer.clearDepth(); // Clear depth buffer
      this.itownsView.mainLoop.gfxEngine.renderer.render(
        this.topScene,
        this.itownsView.camera.camera3D
      ); // Render the top scene
    };

    /** @type {ClippingPlane} */
    this.clippingPlane = new ClippingPlane(this.itownsView);

    // Init layer manager
    this.layerManager = new LayerManager(
      layerConfigs,
      this.itownsView,
      new PointsMaterial({
        size: options.defaultPointCloudSize || Visualizer.DEFAULT_POINT_SIZE,
        vertexColors: true,
        clippingPlanes: [this.clippingPlane.plane], // Set clipping planes for the material
      })
    );

    // Create mesh for target orbit controls
    this.targetOrbitControlsMesh = new TargetOrbitControlMesh(
      this.viewManager.orbitControls,
      this.itownsView.camera.camera3D,
      this.layerManager
    );
    this.topScene.add(this.targetOrbitControlsMesh.mesh); // Add mesh to the top scene

    // Set up default camera settings
    setUpCameraDefaults(
      this.viewManager.itownsView,
      this.viewManager.orbitControls,
      this.layerManager.layers,
      options.camera
    );

    // Set up loading UI for C3DTiles
    this.c3DTilesLoadingDomElement = setupLoadingUI(
      this.viewManager.domElement,
      this.layerManager.layers,
      this.viewManager.itownsView,
      options
    );

    // Set up controls for adjusting zoom speed
    this.domElementSpeedControls = setUpSpeedControls(
      this.viewManager.orbitControls
    );

    // Add global bounding box mesh to the scene which embed all 3Dtiles layers
    this.viewManager.itownsView.scene.add(this.layerManager.globalBBMesh);

    /** @type {Measure} */
    this.measure = null;
    if (options.measure) {
      this.measure = new Measure(
        this.viewManager.itownsView,
        this.layerManager,
        this.viewManager.itownsView.mainLoop.gfxEngine.label2dRenderer.domElement
      );

      this.topScene.add(this.measure.group);

      window.addEventListener('keyup', (event) => {
        if (event.key == 'Escape') {
          this.measure.leaveMeasureMode();
        }
      });

      this.measure.update(this.itownsView);
    }

    // Add clipping plane to the scene
    this.viewManager.itownsView.scene.add(this.clippingPlane.quad);

    // Set position and scale for the clipping plane
    this.clippingPlane.quad.position.set(
      extent.center().x,
      extent.center().y,
      300
    );
    this.clippingPlane.quad.scale.set(1000, 1000, 1000);

    const transformControlsProcess = new RequestAnimationFrameProcess(30); // Process to manage transform control of the clipping plane

    // Event listener for dragging changes on the clipping plane
    this.clippingPlane.transformControls.addEventListener(
      'dragging-changed',
      (event) => {
        this.viewManager.orbitControls.enabled = !event.value;
      }
    );

    // Start rendering updates for the clipping plane when it's visible
    transformControlsProcess.start(() => {
      if (!this.clippingPlane.quad.visible) return;
      this.clippingPlane.transformControls.updateMatrixWorld();
      this.viewManager.itownsView.render();
    });

    // Add a frame requester to dynamically compute near and far planes for the camera
    this.viewManager.itownsView.addFrameRequester(
      MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE,
      () => {
        const bb = new Box3().setFromObject(this.viewManager.itownsView.scene);
        computeNearFarCamera(
          this.viewManager.itownsView.camera.camera3D,
          bb.min,
          bb.max
        );
      }
    );

    // Notify changes to the view manager to trigger a redraw
    this.viewManager.itownsView.notifyChange(
      this.viewManager.itownsView.camera.camera3D
    );
  }

  /**
   * Getter for the itowns view instance.
   *
   * @returns {object} The current itowns view.
   */
  get itownsView() {
    return this.viewManager.itownsView;
  }

  /**
   * Getter for orbit controls.
   *
   * @returns {object} The current orbit controls.
   */
  get orbitControls() {
    return this.viewManager.orbitControls;
  }

  /**
   * Getter for the layer manager's layers.
   *
   * @returns {Array<object>} The layers managed by the layer manager.
   */
  get layers() {
    return this.layerManager.layers;
  }

  /**
   * Getter for the DOM element used in target dragging.
   *
   * @returns {HTMLElement} The target drag element.
   */
  get domElementTargetDragElement() {
    return this.targetOrbitControlsMesh.domElement;
  }

  /**
   * Getter for the DOM element associated with the measure tool.
   *
   * @returns {HTMLElement} The measure tool's DOM element.
   */
  get measureDomElement() {
    return this.measure.domElement;
  }

  /**
   * Getter for the clipping plane details.
   *
   * @returns {object} The details of the clipping plane.
   */
  get clippingPlaneDetails() {
    return this.clippingPlane.details;
  }

  /**
   * Default size for points in the point cloud visualization.
   *
   * @returns {number} The default point size.
   */
  static get DEFAULT_POINT_SIZE() {
    return 0.03;
  }

  /**
   * Key for storing target information in local storage.
   *
   * @returns {string} The key for target storage.
   */
  static get TARGET_LOCAL_STORAGE_KEY() {
    return 'target_local_storage_key_point_cloud_visualizer';
  }

  /**
   * Key for storing camera settings in local storage.
   *
   * @returns {string} The key for camera storage.
   */
  static get CAMERA_LOCAL_STORAGE_KEY() {
    return 'camera_local_storage_key_point_cloud_visualizer';
  }

  /**
   * Key for storing clipping plane settings in local storage.
   *
   * @returns {string} The key for clipping plane storage.
   */
  static get CLIPPING_PLANE_LOCAL_STORAGE_KEY() {
    return 'clipping_plane_local_storage_key_point_cloud_visualizer';
  }

  /**
   * Threshold for the raycaster points.
   *
   * @returns {number} The threshold value.
   */
  static get RAYCASTER_POINTS_THRESHOLD() {
    return 0.01;
  }
}
