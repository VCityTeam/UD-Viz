import {
  addBaseMapLayer,
  addElevationLayer,
  setupAndAddGeoJsonLayers,
} from './Component/Component';
import { computeNearFarCamera } from '../THREEUtil';
import { Base } from './Base/Base';
import { LayerManager, TilesManager } from '../Itowns/Itowns';
const itowns = require('itowns'); // import that way jsdoc resolve type sometime ... lol
const THREE = require('three');

/**
 * These extensions should belong elsewhere since it should be possible
 * to manipulate Temporal 3DTiles without having a dependence to its widget...
 */
import * as Widget from '../Widget/Widget';
const $3DTemporalBatchTable = Widget.$3DTemporalBatchTable;
const $3DTemporalBoundingVolume = Widget.$3DTemporalBoundingVolume;
const $3DTemporalTileset = Widget.$3DTemporalTileset;

/**
 * It creates a 3D Tiles layer,
 * and adds it to the layer manager
 *
 * @param {*} layer - the layer object from the config file
 * @param  {LayerManager} layerManager - the layer manager object
 * @param {itowns.View} itownsView - the itowns view
 * @returns {itowns.C3DTilesLayer} A 3D Tiles Layer
 */
function setup3DTilesLayer(layer, layerManager, itownsView) {
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
            ' specified in 3D_tiles_layers is not supported ' +
            'by @ud-viz/browser yet. Only 3DTILES_temporal and ' +
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
function add3DTilesLayersFromConfig(
  config3DTilesLayers,
  layerManager,
  itownsView
) {
  // Positional arguments verification
  if (!config3DTilesLayers) {
    console.warn('no 3DTilesLayers config');
    return;
  }
  const layers = {};
  for (const layer of config3DTilesLayers) {
    layers[layer.id] = setup3DTilesLayer(layer, layerManager, itownsView);
    itowns.View.prototype.addLayer.call(itownsView, layers[layer.id]);
  }
  return layers;
}

export class Planar extends Base {
  /**
   *
   * @param {itowns.Extent} extent
   * @param {object} options
   * @param {boolean} options.hasItownsControls
   * @param {boolean} options.useItownsMainLoop - rendering is done in itowns.mainLoop default is true
   * @param {itowns.Coordinates} options.coordinates
   * @param {number} options.heading
   * @param {number} options.range
   * @param {number} options.tilt
   * @param {number} options.maxSubdivisionLevel
   * @param {object} options.configBaseMapLayer - create a type def to mutualize between here and addBaseMapLayer method
   * @param {object} options.configElevationLayer - create a type def to mutualize between here and addElevationLayer method
   * @param {object} options.config3DTilesLayers - create a type def to mutualize between here and addElevationLayer method
   * @param {object} options.configGeoJSONLayers - create a type def to mutualize between here and addElevationLayer method
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

    // Add optional layer
    if (options.configBaseMapLayer) {
      addBaseMapLayer(options.configBaseMapLayer, this.itownsView, extent);
    }
    if (options.configElevationLayer) {
      addElevationLayer(options.configElevationLayer, this.itownsView, extent);
    }
    if (options.config3DTilesLayers) {
      add3DTilesLayersFromConfig(
        options.config3DTilesLayers,
        this.layerManager,
        this.itownsView
      );
    }
    if (options.configGeoJSONLayers) {
      setupAndAddGeoJsonLayers(options.configGeoJSONLayers, this.itownsView);
    }

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

  setIsRendering(value) {
    super.setIsRendering(value); // css3D rendering
    this.enableItownsViewRendering(value); // itownsView rendering
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
