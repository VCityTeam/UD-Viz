import {
  addBaseMapLayer,
  addElevationLayer,
  setupAndAddGeoJsonLayers,
} from './Component/Component';
import { computeNearFarCamera } from '../Base/Component/Component';
import { Base } from '../Base/Base';
import * as proj4 from 'proj4';
import { LayerManager } from './LayerManager/LayerManager';

/**
 * These extensions should belong elsewhere since it should be possible
 * to manipulate Temporal 3DTiles without having a dependence to its widget...
 */
import * as Widgets from './Widgets/Widgets';
const $3DTemporalBatchTable = Widgets.$3DTemporalBatchTable;
const $3DTemporalBoundingVolume = Widgets.$3DTemporalBoundingVolume;
const $3DTemporalTileset = Widgets.$3DTemporalTileset;

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

    // Disable itowns resize https://github.com/VCityTeam/UD-Viz/issues/374
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

/**
 * It creates a 3D Tiles layer,
 * and adds it to the layer manager
 *
 * @param {*} layer - the layer object from the config file
 * @param  {LayerManager_LayerManager} layerManager - the layer manager object
 * @param {itowns.View} itownsView - the itowns view
 * @returns {itowns.C3DTilesLayer} A 3D Tiles Layer
 */
export function setup3DTilesLayer(layer, layerManager, itownsView) {
  if (!layer['id'] || !layer['url']) {
    throw (
      'Your layer does not have url id properties or both. ' +
      '(in UD-Viz/UD-Viz-Core/examples/data/config/generalDemoConfig.json)'
    );
  }

  const extensionsConfig = layer['extensions'];
  const extensions = new itowns.C3DTExtensions();
  if (extensionsConfig) {
    for (let i = 0; i < extensionsConfig.length; i++) {
      if (extensionsConfig[i] === '3DTILES_temporal') {
        extensions.registerExtension('3DTILES_temporal', {
          [itowns.C3DTilesTypes.batchtable]: $3DTemporalBatchTable,
          [itowns.C3DTilesTypes.boundingVolume]: $3DTemporalBoundingVolume,
          [itowns.C3DTilesTypes.tileset]: $3DTemporalTileset,
        });
      } else if (extensionsConfig[i] === '3DTILES_batch_table_hierarchy') {
        extensions.registerExtension('3DTILES_batch_table_hierarchy', {
          [itowns.C3DTilesTypes.batchtable]:
            itowns.C3DTBatchTableHierarchyExtension,
        });
      } else {
        console.warn(
          'The 3D Tiles extension ' +
            extensionsConfig[i] +
            ' specified in generalDemoConfig.json is not supported ' +
            'by UD-Viz yet. Only 3DTILES_temporal and ' +
            '3DTILES_batch_table_hierarchy are supported.'
        );
      }
    }
  }

  let overrideMaterial = false;
  let material;
  if (layer['pc_size']) {
    material = new THREE.PointsMaterial({
      size: layer['pc_size'],
      vertexColors: true,
    });
    overrideMaterial = true;
  }
  const $3dTilesLayer = new itowns.C3DTilesLayer(
    layer['id'],
    {
      name: layer['id'],
      source: new itowns.C3DTilesSource({
        url: layer['url'],
      }),
      registeredExtensions: extensions,
      overrideMaterials: overrideMaterial,
    },
    itownsView
  );
  if (overrideMaterial) {
    $3dTilesLayer.overrideMaterials = material;
    $3dTilesLayer.material = material;
  }

  const $3DTilesManager = new TilesManager(itownsView, $3dTilesLayer);

  if (layer['color']) {
    const color = parseInt(layer['color']);
    $3DTilesManager.color = color;
  }

  layerManager.tilesManagers.push($3DTilesManager);

  return $3dTilesLayer;
}

/**
 * Setup and add 3D tiles to an itowns view
 *
 * @param {*} config must contain a 3DTilesLayers field array with each 3d tile url
 * @param {LayerManager} layerManager a layer manager
 * @param {itowns.View} itownsView - the itowns view
 * @returns a map of each 3d tiles layer
 */
export function add3DTilesLayersFromConfig(config, layerManager, itownsView) {
  // Positional arguments verification
  if (!config['3DTilesLayers']) {
    return;
  }

  const layers = {};
  for (const layer of config['3DTilesLayers']) {
    layers[layer.id] = setup3DTilesLayer(layer, layerManager, itownsView);
    itowns.View.prototype.addLayer.call(itownsView, layers[layer.id]);
  }
  return layers;
}
