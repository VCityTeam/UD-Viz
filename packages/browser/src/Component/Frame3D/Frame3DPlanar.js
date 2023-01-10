import { computeNearFarCamera } from '../THREEUtil';
import { Frame3DBase } from './Frame3DBase/Frame3DBase';
import { LayerManager } from '../Itowns/Itowns';
const itowns = require('itowns');
const THREE = require('three');

/**
 * @typedef {object} Frame3DPlanarOption
 * @property {boolean} hasItownsControls - If true enable Itowns View Controls
 * @property {boolean} useItownsMainLoop - Rendering is done in itowns.mainLoop default is true
 * @property {itowns.Coordinates} coordinates {@link http://www.itowns-project.org/itowns/docs/#api/Geographic/Coordinates Coordinates}
 * @property {number} heading - Camera heading placement
 * @property {number} range -  Camera range placement
 * @property {number} tilt - Camera tilt placement
 * @property {number} maxSubdivisionLevel - TODO
 */

/** @classdesc It's a class that extends the {@link Base} class and adds a PlanarView to it */
export class Frame3DPlanar extends Frame3DBase {
  /**
   *
   * @param {itowns.Extent} extent - Geographical bounding rectangle. {@link http://www.itowns-project.org/itowns/docs/#api/Geographic/Extent Extent}
   * @param {Frame3DPlanarOption} [options={}] - {@link Frame3DPlanarOption}
   * @param {boolean} [options.hasItownsControls=false] - if true initialize PlanarControl
   * @param {boolean} [options.useItownsMainLoop=true] - rendering is done in itowns.mainLoop
   * @param {itowns.Coordinates} options.coordinates - itowns coordinates of the initial camera position. {@link http://www.itowns-project.org/itowns/docs/#api/Geographic/Coordinates Coordinates}
   * @param {number} [options.heading=-50] - camera heading placement
   * @param {number} [options.range=3000] - camera range placement
   * @param {number} [options.tilt=10] - camera tilt placement
   * @param {number} options.maxSubdivisionLevel - Maximum subdivision level for PlanarLayer
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
    const maxSubdivisionLevel = options.maxSubdivisionLevel || 3;

    /** @type {itowns.PlanarView} - planar view */
    this.itownsView = new itowns.PlanarView(this.rootWebGL, extent, {
      disableSkirt: false,
      placement: {
        coord: coordinates,
        heading: heading,
        range: range,
        tilt: tilt,
      },
      maxSubdivisionLevel: maxSubdivisionLevel,
      noControls: true, // no controls to use the method enableItownsViewControls to handle params pass to PlanarControls
    });

    if (hasItownsControls) this.enableItownsViewControls(true);

    // Disable itowns resize https://github.com/VCityTeam/UD-Viz/issues/374
    this.itownsViewResize = this.itownsView.resize.bind(this.itownsView);
    this.itownsView.resize = function () {};

    // fill parent class attributes create by the itownsView
    this.scene = this.itownsView.scene;
    this.renderer = this.itownsView.mainLoop.gfxEngine.renderer;
    this.camera = this.itownsView.camera.camera3D;

    /** @type {LayerManager} - layer manager */
    this.layerManager = new LayerManager(this.itownsView);

    let useItownsMainLoop = true;
    if (options.useItownsMainLoop != undefined)
      useItownsMainLoop = options.useItownsMainLoop;
    if (useItownsMainLoop) {
      // by default itownsView is rendering

      // requester compute near far
      this.itownsView.addFrameRequester(
        itowns.MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE,
        () => {
          // z is HARDCODED https://github.com/VCityTeam/UD-Viz/issues/469
          const min = new THREE.Vector3(extent.west, extent.south, 0);
          const max = new THREE.Vector3(extent.east, extent.north, 500);

          computeNearFarCamera(this.camera, min, max);
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
   * Enable / disable PlanarControls
   *
   * @param {boolean} value - true enable / false disable
   * @returns {void}
   */
  enableItownsViewControls(value) {
    if (
      (value && this.itownsView.controls) ||
      (!value && !this.itownsView.controls)
    ) {
      console.log('no change to apply');
      return;
    }

    if (value) {
      /* eslint-disable no-new */
      new itowns.PlanarControls(this.itownsView, {
        handleCollision: false,
        focusOnMouseOver: false,
        focusOnMouseClick: false,
      });
    } else {
      this.itownsView.controls.dispose();
      this.itownsView.controls = null;
    }
  }

  /**
   *
   * @returns {itowns.PlanarView} - itowns view
   */
  getItownsView() {
    return this.itownsView;
  }

  /**
   *
   * @returns {LayerManager} - layer manager
   */
  getLayerManager() {
    return this.layerManager;
  }

  /**
   * Resize Frame3D
   */
  onResize() {
    super.onResize(false); // dont resize three variables since itownsResize is doing it
    this.itownsViewResize(this.size.x, this.size.y);
  }

  /**
   * Dispose Frame3D
   */
  dispose() {
    super.dispose();
    this.itownsView.dispose();
  }
}
