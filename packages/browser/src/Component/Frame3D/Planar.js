import { computeNearFarCamera } from '../THREEUtil';
import { Base } from './Base/Base';
import { LayerManager } from '../Itowns/Itowns';
const itowns = require('itowns'); // import that way jsdoc resolve type sometime ... lol
const THREE = require('three');

export class Planar extends Base {
  /**
   *
   * @param {itowns.Extent} extent
   * @param {object} options
   * @param {boolean} options.hasItownsControls
   * @param {boolean} options.useItownsMainLoop - rendering is done in itowns.mainLoop default is true
   * @param {itowns.Coordinates} options.coordinates - itowns coordinates of the initial camera position
   * @param {number} options.heading
   * @param {number} options.range
   * @param {number} options.tilt
   * @param {number} options.maxSubdivisionLevel
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

    /** @type {itowns.PlanarView} */
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

    /** @type {LayerManager} */
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

  enableItownsViewRendering(value) {
    if (value) {
      this.itownsView.render = null;
    } else {
      this.itownsView.render = () => {};
    }
  }

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
   * @returns {itowns.PlanarView} the itowns view
   */
  getItownsView() {
    return this.itownsView;
  }

  /**
   *
   * @returns {LayerManager}
   */
  getLayerManager() {
    return this.layerManager;
  }

  onResize() {
    super.onResize(false); // dont resize three variables since itownsResize is doing it
    this.itownsViewResize(this.size.x, this.size.y);
  }

  dispose() {
    super.dispose();
    this.itownsView.dispose();
  }
}
