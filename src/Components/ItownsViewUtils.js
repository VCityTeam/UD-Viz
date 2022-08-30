import * as itowns from 'itowns';
import { TilesManager } from './Components';

import * as Widgets from '../Widgets/Widgets';
const $3DTemporalBatchTable = Widgets.$3DTemporalBatchTable;
const $3DTemporalBoundingVolume = Widgets.$3DTemporalBoundingVolume;
const $3DTemporalTileset = Widgets.$3DTemporalTileset;

/**
 * Setup and add 3D tiles to an itowns view
 *
 * @param {*} config must contain a 3DTilesLayers field array with each 3d tile url
 * @param {LayerManager} layerManager a layer manager
 * @param {itowns.View} itownsView
 * @returns a map of each 3d tiles layer
 */
export function setupAndAdd3DTilesLayers(config, layerManager, itownsView) {
  // Positional arguments verification
  if (!config['3DTilesLayers']) {
    return;
  }

  const setup3DTilesLayer = function (layer) {
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

    const $3dTilesLayer = new itowns.C3DTilesLayer(
      layer['id'],
      {
        name: layer['id'],
        source: new itowns.C3DTilesSource({
          url: layer['url'],
        }),
        registeredExtensions: extensions,
        overrideMaterials: false,
      },
      itownsView
    );

    const $3DTilesManager = new TilesManager(itownsView, $3dTilesLayer);

    if (layer['color']) {
      const color = parseInt(layer['color']);
      $3DTilesManager.color = color;
    }

    layerManager.tilesManagers.push($3DTilesManager);

    return [$3dTilesLayer, $3DTilesManager];
  };

  const layers = {};
  for (const layer of config['3DTilesLayers']) {
    layers[layer.id] = setup3DTilesLayer(layer);
    itowns.View.prototype.addLayer.call(itownsView, layers[layer.id][0]);
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
 * @param itownsView
 */
export function setupAndAddGeoJsonLayers(config, itownsView) {
  // Positional arguments verification
  if (!config['GeoJSONLayers']) {
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
  const setupAndAddGeoJsonLayer = function (layer) {
    if (!layer['id'] || !layer['url'] || !layer['crs']) {
      console.warn(
        'Your "GeoJsonLayer" field does not have either "url", "crs" or "id" properties. ' +
          '(in UD-Viz/examples/config/all_widget_config.json)'
      );
      return;
    }

    // Declare the data source for the layer
    const source = new itowns.FileSource({
      url: layer.url,
      crs: layer.crs,
      format: 'application/json',
    });

    const layerStyle = new itowns.Style(layer.style);

    const geojsonLayer = new itowns.ColorLayer(layer.id, {
      name: layer.id,
      transparent: true,
      source: source,
      style: layerStyle,
    });
    itownsView.addLayer(geojsonLayer);
  };

  for (const layer of config['GeoJSONLayers']) {
    setupAndAddGeoJsonLayer(layer);
  }
}

/**
 * Add Base map layer to an itowns view
 *
 * @param {*} config must contains a field background_image_layer
 * @param {itowns.View} itownsView
 * @param {itowns.Extent} extent extent of the view
 */
export function addBaseMapLayer(config, itownsView, extent) {
  if (!config['background_image_layer']) {
    console.warn('No "BaseMapLayer" field in the configuration file');
    return;
  }

  const wmsImagerySource = new itowns.WMSSource({
    extent: extent,
    name: config['background_image_layer']['name'],
    url: config['background_image_layer']['url'],
    version: config['background_image_layer']['version'],
    projection: config['projection'],
    format: config['background_image_layer']['format'],
  });
  // Add a WMS imagery layer
  const wmsImageryLayer = new itowns.ColorLayer(
    config['background_image_layer']['layer_name'],
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
 * @param {itowns.View} itownsView
 * @param {itowns.Extent} extent extent of the view
 */
export function addElevationLayer(config, itownsView, extent) {
  if (!config['elevation_layer']) {
    console.warn('No "ElevationLayer" field in the configuration file');
    return;
  }

  // Add a WMS elevation source
  const wmsElevationSource = new itowns.WMSSource({
    extent: extent,
    url: config['elevation_layer']['url'],
    name: config['elevation_layer']['name'],
    projection: config['projection'],
    heightMapWidth: 256,
    format: config['elevation_layer']['format'],
  });
  // Add a WMS elevation layer
  const wmsElevationLayer = new itowns.ElevationLayer(
    config['elevation_layer']['layer_name'],
    {
      useColorTextureElevation: true,
      colorTextureElevationMinZ: 144,
      colorTextureElevationMaxZ: 622,
      source: wmsElevationSource,
    }
  );
  itownsView.addLayer(wmsElevationLayer);
}
