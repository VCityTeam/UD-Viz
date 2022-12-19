import {
  LayerManager,
  addBaseMapLayer,
  addElevationLayer,
  add3DTilesLayersFromConfig,
  setupAndAddGeoJsonLayers,
  checkParentChild,
} from '../../Components/Components';

import { computeNearFarCamera } from '../';
import { Base } from './View';
import { proj4 } from 'proj4';

export class Planar extends Base {
  constructor(options) {
    super(options);
    // Projection
    this.projection = this.config['projection'] || 'EPSG:3946';
    proj4.default.defs(
      this.projection,
      '+proj=lcc +lat_1=45.25 +lat_2=46.75' +
        ' +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
    );

    // Itowns view
    this.itownsView = null;
    this.extent = null; // Area handle by itowns
    this.hasItownsControls = params.hasItownsControls || false;
    this.itownsRequesterBeforeRender = function () {
      computeNearFarCamera(_this.getCamera(), _this.getExtent(), 400);
    };
  }

  /**
   * Init the itowns.PlanarView of this view with a given extent
   *
   * @param {itowns.Extent} extent the extent of the itowns.PlanarView
   */
  initItownsView(extent) {
    this.extent = extent;

    const coordinates = extent.center();

    let heading = -50;
    let range = 3000;
    let tilt = 10;

    // Assign default value or config value
    if (
      this.config &&
      this.config['camera'] &&
      this.config['camera']['position']
    ) {
      if (this.config['camera']['position']['heading'])
        heading = this.config['camera']['position']['heading'];

      if (this.config['camera']['position']['range'])
        range = this.config['camera']['position']['range'];

      if (this.config['camera']['position']['tilt'])
        tilt = this.config['camera']['position']['tilt'];

      if (this.config['camera']['position']['x'])
        coordinates.x = this.config['camera']['position']['x'];

      if (this.config['camera']['position']['y'])
        coordinates.y = this.config['camera']['position']['y'];
    }

    const placement = {
      coord: coordinates,
      heading: heading,
      range: range,
      tilt: tilt,
    };

    // MaxSubdivisionLevel
    const maxSubdivisionLevel = this.config['maxSubdivisionLevel'] || 3;

    this.itownsView = new itowns.PlanarView(this.rootWebGL, extent, {
      disableSkirt: false,
      placement: placement,
      maxSubdivisionLevel: maxSubdivisionLevel,
      noControls: !this.hasItownsControls,
    });

    // Init 3D rendering attributes with itownsview
    this.scene = this.itownsView.scene;
    this.renderer = this.itownsView.mainLoop.gfxEngine.renderer;
    this.camera = this.itownsView.camera.camera3D;

    // Layermanager
    this.layerManager = new LayerManager(this.itownsView);

    addBaseMapLayer(this.config, this.itownsView, this.extent);
    addElevationLayer(this.config, this.itownsView, this.extent);
    add3DTilesLayersFromConfig(this.config, this.layerManager, this.itownsView);
    setupAndAddGeoJsonLayers(this.config, this.itownsView);

    // Disable itowns resize
    this.itownsViewResize = this.itownsView.resize.bind(this.itownsView);
    this.itownsView.resize = function () {};
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
   * @returns {itowns.Extent} return the extent of the itowns view
   */
  getExtent() {
    return this.extent;
  }

  onResize() {
    super.onResize();
    this.itownsViewResize(this.size.x, this.size.y);
  }

  dispose() {
    super.dispose();
    this.itownsView.dispose();
  }
}
