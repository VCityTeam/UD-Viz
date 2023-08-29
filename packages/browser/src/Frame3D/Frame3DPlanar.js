import { Frame3DBase } from './Frame3DBase/Frame3DBase';
import {
  defaultConfigScene,
  initScene,
  computeNearFarCamera,
} from '../THREEUtil';
const itowns = require('itowns');
const THREE = require('three');

/**
 * @typedef {object} Frame3DPlanarOption
 * @property {boolean} [hasItownsControls=false] - If true enable Itowns View Controls
 * @property {boolean} [useItownsMainLoop=true] - Rendering is done in itowns.mainLoop
 * @property {itowns.Coordinates} coordinates {@link http://www.itowns-project.org/itowns/docs/#api/Geographic/Coordinates Coordinates}
 * @property {number} [heading=-50] - Camera heading placement
 * @property {number} [range=3000] -  Camera range placement
 * @property {number} [tilt=10] - Camera tilt placement
 * @property {number} [maxSubdivisionLevel=5] - Maximum subdivision level for PlanarLayer
 * @property {import('../THREEUtil').SceneConfig} sceneConfig - scene config
 */

/** @classdesc It's a class that extends the {@link Frame3DBase} class and adds a PlanarView to it */
export class Frame3DPlanar extends Frame3DBase {
  /**
   *
   * @param {itowns.Extent} extent - Geographical bounding rectangle. {@link http://www.itowns-project.org/itowns/docs/#api/Geographic/Extent Extent}
   * @param {Frame3DPlanarOption} [options={}] - {@link Frame3DPlanarOption}
   */
  constructor(extent, options = {}) {
    super(options, false); // do not init3D since itownsView will do it

    const hasItownsControls = options.hasItownsControls || false;
    const coordinates = extent.center(); // default coordinates are extent center
    if (options.coordinates) {
      if (options.coordinates.x)
        coordinates.x = parseFloat(options.coordinates.x);
      if (options.coordinates.y)
        coordinates.y = parseFloat(options.coordinates.y);
    }
    const heading = options.heading || -50;
    const range = options.range || 3000;
    const tilt = options.tilt || 10;
    const maxSubdivisionLevel = options.maxSubdivisionLevel || 5;

    /**
     * planar view
     *
      @type {itowns.PlanarView} */
    this.itownsView = new itowns.PlanarView(this.domElementWebGL, extent, {
      disableSkirt: false,
      placement: {
        coord: coordinates,
        heading: heading,
        range: range,
        tilt: tilt,
      },
      maxSubdivisionLevel: maxSubdivisionLevel,
      noControls: !hasItownsControls,
      controls: {
        handleCollision: false,
        focusOnMouseOver: false,
        focusOnMouseClick: false,
      },
    });

    // fill parent class attributes create by the itownsView
    /** @type {THREE.Scene} */
    this.scene = this.itownsView.scene;
    /** @type {THREE.WebGLRenderer} */
    this.renderer = this.itownsView.mainLoop.gfxEngine.renderer;
    /** @type {THREE.PerspectiveCamera} */
    this.camera = this.itownsView.camera.camera3D;

    /** @type {import('../THREEUtil').SceneConfig} */
    this.sceneConfig = options.sceneConfig || defaultConfigScene;

    /** @type {THREE.DirectionalLight} */
    this.directionalLight = initScene(
      this.camera,
      this.renderer,
      this.scene,
      this.sceneConfig
    );

    let useItownsMainLoop = true;
    if (options.useItownsMainLoop != undefined)
      useItownsMainLoop = options.useItownsMainLoop;
    if (useItownsMainLoop) {
      // by default itownsView is rendering

      // requester compute near far
      this.itownsView.addFrameRequester(
        itowns.MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE,
        () => {
          const bb = new THREE.Box3().setFromObject(this.scene);
          computeNearFarCamera(this.camera, bb.min, bb.max);
        }
      );

      // requester rendering css3D
      this.itownsView.addFrameRequester(
        itowns.MAIN_LOOP_EVENTS.BEFORE_RENDER,
        () => {
          this.renderCSS3D();
        }
      );
    }
  }

  /**
   * Disable/enable itowns rendering from itowns.mainLoop
   *
   * @param {boolean} value - true enable / false disable
   */
  enableItownsViewRendering(value) {
    if (value) {
      this.itownsView.render = null;
    } else {
      this.itownsView.render = () => {};
    }
  }

  /**
   * Render scene3D + labels
   */
  render() {
    super.render();

    // render also label layers
    if (this.isRendering && this.itownsView.tileLayer) {
      this.itownsView.mainLoop.gfxEngine.label2dRenderer.render(
        this.itownsView.tileLayer.object3d,
        this.itownsView.camera.camera3D
      );
    }
  }

  /**
   * Resize Frame3D
   */
  onResize() {
    super.onResize(false); // dont resize three variables since itownsResize is doing it
  }

  /**
   * Dispose Frame3D
   */
  dispose() {
    super.dispose();
    this.itownsView.dispose();
  }
}
