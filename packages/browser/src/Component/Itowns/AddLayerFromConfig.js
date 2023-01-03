const THREE = require('three');
const itowns = require('itowns');
import { TilesManager } from './Itowns';

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
 * @param config3DTilesLayers
 * @param {LayerManager} layerManager a layer manager
 * @param {itowns.View} itownsView - the itowns view
 * @returns a map of each 3d tiles layer
 */
export function add3DTilesLayers(
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

/**
 * Sets up a GeoJson layers and adds them to the itowns view (for the demos
 * that don't need more granularity than that).
 *
 * @param {string} layerConfig The name of the layer to setup from the
 * generalDemoConfig.json config file (should be one of the properties
 * of the 3DTilesLayer object in
 * UD-Viz/examples/config/all_widget_config.json
 * config file).
 * @param config
 * @param configGeoJSONLayers
 * @param itownsView
 */
export function addGeoJsonLayers(configGeoJSONLayers, itownsView) {
  // Positional arguments verification
  if (!configGeoJSONLayers) {
    console.warn('No "GeoJSONLayers" field in the configuration file');
    return;
  }
  /**
   * Create an iTowns GeoJson layer based on the specified layerConfig.
   *
   * @param {string} layerConfig The name of the layer to setup from the
   * all_widget_config.json config file (should be one of the properties
   * of the GeoJsonLayer object in
   * UD-Viz/examples/config/all_widget_config.json
   * config file).
   * @param layer
   */
  const setupAndAddGeoJsonLayer = function (layerConfig) {
    if (!layerConfig['id'] || !layerConfig['url'] || !layerConfig['crs']) {
      console.warn(
        'Your "GeoJsonLayer" field does not have either "url", "crs" or "id" properties. ' +
          '(in UD-Viz/examples/config/all_widget_config.json)'
      );
      return;
    }

    // Declare the data source for the layerConfig
    const source = new itowns.FileSource({
      url: layerConfig.url,
      crs: layerConfig.crs, // should be the extent ? TODO_ISSUE
      format: 'application/json',
    });

    const layerStyle = new itowns.Style(layerConfig.style);

    const geojsonLayer = new itowns.ColorLayer(layerConfig.id, {
      name: layerConfig.id,
      transparent: true,
      source: source,
      style: layerStyle,
    });
    itownsView.addLayer(geojsonLayer);
  };

  for (const layer of configGeoJSONLayers) {
    setupAndAddGeoJsonLayer(layer);
  }
}

/**
 * Add Base map layer to an itowns view
 *
 * @param {*} config must contains a field background_image_layer
 * @param baseMapLayerConfig
 * @param {itowns.View} itownsView
 * @param {itowns.Extent} extent extent of the view
 */
export function addBaseMapLayer(baseMapLayerConfig, itownsView, extent) {
  if (!baseMapLayerConfig) {
    console.warn('No baseMap config ');
    return;
  }

  if (!baseMapLayerConfig.name) {
    console.warn('no name in baseMap config');
    return;
  }

  if (!baseMapLayerConfig.url) {
    console.warn('no url in baseMap config');
    return;
  }

  if (!baseMapLayerConfig.version) {
    console.warn('no version in baseMap config');
    return;
  }

  if (!baseMapLayerConfig.format) {
    console.warn('no format in baseMap config');
    return;
  }

  const wmsImagerySource = new itowns.WMSSource({
    extent: extent,
    name: baseMapLayerConfig['name'],
    url: baseMapLayerConfig['url'],
    version: baseMapLayerConfig['version'],
    crs: extent.crs,
    format: baseMapLayerConfig['format'],
  });

  if (!baseMapLayerConfig.layer_name) {
    console.warn('no layer_name in baseMap config');
    return;
  }

  // Add a WMS imagery layer
  const wmsImageryLayer = new itowns.ColorLayer(
    baseMapLayerConfig['layer_name'],
    {
      updateStrategy: {
        type: itowns.STRATEGY_DICHOTOMY,
        options: {},
      },
      source: wmsImagerySource,
      transparent: true,
    }
  );
  itownsView.addLayer(wmsImageryLayer);
}

/**
 * Add Elevation map layer to an itowns view
 *
 * @param {*} config must contains a field elevation_layer
 * @param configElevationLayer
 * @param {itowns.View} itownsView
 * @param {itowns.Extent} extent extent of the view
 */
export function addElevationLayer(configElevationLayer, itownsView, extent) {
  if (!configElevationLayer) {
    console.warn('No "ElevationLayer" field in the configuration file');
    return;
  }

  // Url check
  if (!configElevationLayer['url']) {
    console.warn('Need an url in elevation_layer config');
    return;
  }

  // Name check
  if (!configElevationLayer['name']) {
    console.warn('Need a name in elevation_layer config');
    return;
  }

  // Format check
  if (!configElevationLayer['format']) {
    console.warn('Need a format in elevation_layer config');
    return;
  }
  const isTextureFormat =
    configElevationLayer['format'] == 'image/jpeg' ||
    configElevationLayer['format'] == 'image/png';

  // ColorTextureElevationMinZ check
  if (isTextureFormat && !configElevationLayer['colorTextureElevationMinZ']) {
    console.warn('Need a colorTextureElevationMinZ in elevation_layer config');
    return;
  }

  // ColorTextureElevationMaxZ check
  if (isTextureFormat && !configElevationLayer['colorTextureElevationMaxZ']) {
    console.warn('Need a colorTextureElevationMaxZ in elevation_layer config');
    return;
  }

  // Layer_name check
  if (!configElevationLayer['layer_name']) {
    console.warn('Need a layer_name in elevation_layer config');
    return;
  }

  // Add a WMS elevation source
  const wmsElevationSource = new itowns.WMSSource({
    extent: extent,
    url: configElevationLayer['url'],
    name: configElevationLayer['name'],
    crs: extent.crs,
    heightMapWidth: 256,
    format: configElevationLayer['format'],
  });

  const elevationLayerConfig = { source: wmsElevationSource };
  if (isTextureFormat) {
    elevationLayerConfig['useColorTextureElevation'] = true;
    elevationLayerConfig['colorTextureElevationMinZ'] =
      configElevationLayer['colorTextureElevationMinZ'];
    elevationLayerConfig['colorTextureElevationMaxZ'] =
      configElevationLayer['colorTextureElevationMaxZ'];
  }
  // Add a WMS elevation layer
  const wmsElevationLayer = new itowns.ElevationLayer(
    configElevationLayer['layer_name'],
    elevationLayerConfig
  );
  itownsView.addLayer(wmsElevationLayer);
}
