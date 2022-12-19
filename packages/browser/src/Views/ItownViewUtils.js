import * as itowns from 'itowns';
import { TilesManager } from './Components';
import * as THREE from 'three';

import * as Widgets from '../Widgets/Widgets';
const $3DTemporalBatchTable = Widgets.$3DTemporalBatchTable;
const $3DTemporalBoundingVolume = Widgets.$3DTemporalBoundingVolume;
const $3DTemporalTileset = Widgets.$3DTemporalTileset;

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
  const baseMapLayerConfig = config.base_map_layers[0]; // the first one is the default one

  if (!baseMapLayerConfig) {
    console.warn('No "BaseMapLayer" field in the configuration file');
    return;
  }

  const wmsImagerySource = new itowns.WMSSource({
    extent: extent,
    name: baseMapLayerConfig['name'],
    url: baseMapLayerConfig['url'],
    version: baseMapLayerConfig['version'],
    crs: config['projection'],
    format: baseMapLayerConfig['format'],
  });
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
 * @param {itowns.View} itownsView
 * @param {itowns.Extent} extent extent of the view
 */
export function addElevationLayer(config, itownsView, extent) {
  if (!config['elevation_layer']) {
    console.warn('No "ElevationLayer" field in the configuration file');
    return;
  }

  // Url check
  if (!config['elevation_layer']['url']) {
    console.warn('Need an url in elevation_layer config');
    return;
  }

  // Name check
  if (!config['elevation_layer']['name']) {
    console.warn('Need a name in elevation_layer config');
    return;
  }

  // Format check
  if (!config['elevation_layer']['format']) {
    console.warn('Need a format in elevation_layer config');
    return;
  }
  const isTextureFormat =
    config['elevation_layer']['format'] == 'image/jpeg' ||
    config['elevation_layer']['format'] == 'image/png';

  // ColorTextureElevationMinZ check
  if (
    isTextureFormat &&
    !config['elevation_layer']['colorTextureElevationMinZ']
  ) {
    console.warn('Need a colorTextureElevationMinZ in elevation_layer config');
    return;
  }

  // ColorTextureElevationMaxZ check
  if (
    isTextureFormat &&
    !config['elevation_layer']['colorTextureElevationMaxZ']
  ) {
    console.warn('Need a colorTextureElevationMaxZ in elevation_layer config');
    return;
  }

  // Layer_name check
  if (!config['elevation_layer']['layer_name']) {
    console.warn('Need a layer_name in elevation_layer config');
    return;
  }

  // Add a WMS elevation source
  const wmsElevationSource = new itowns.WMSSource({
    extent: extent,
    url: config['elevation_layer']['url'],
    name: config['elevation_layer']['name'],
    crs: config['projection'],
    heightMapWidth: 256,
    format: config['elevation_layer']['format'],
  });

  const elevationLayerConfig = { source: wmsElevationSource };
  if (isTextureFormat) {
    elevationLayerConfig['useColorTextureElevation'] = true;
    elevationLayerConfig['colorTextureElevationMinZ'] =
      config['elevation_layer']['colorTextureElevationMinZ'];
    elevationLayerConfig['colorTextureElevationMaxZ'] =
      config['elevation_layer']['colorTextureElevationMaxZ'];
  }
  // Add a WMS elevation layer
  const wmsElevationLayer = new itowns.ElevationLayer(
    config['elevation_layer']['layer_name'],
    elevationLayerConfig
  );
  itownsView.addLayer(wmsElevationLayer);
}

/**
 * Makes the camera move to focus on the target position.
 *
 * @param {itowns.View} view The iTowns view.
 * @param {itowns.PlanarControls} controls The camera controls.
 * @param {THREE.Vector3} targetPos The target position.
 * @param {*} [options] Optional parameters for the travel. Accepted entries
 * are :
 * - `duration` : the duration of the movement, in seconds. The promise will
 * resolve after this value. If not specified, the value `auto` is used for
 * the movement (see the `PlanarControls.initateTravel` method), and the promise
 * resolves imediatly.
 * - `verticalDistance` : Desired height of the camera relative to the target
 * position.
 * - `horizontalDistance` : Desired distance of the camera from the target
 * position.
 */
export function focusCameraOn(view, controls, targetPos, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const duration = options.duration || null;
      const verticalDist = options.verticalDistance || 800;
      const horizontalDist = options.horizontalDistance || 1000;

      const cameraPos = view.camera.camera3D.position.clone();
      const direction = new THREE.Vector3().subVectors(targetPos, cameraPos);
      const currentDist = Math.sqrt(
        direction.x * direction.x + direction.y * direction.y
      );
      cameraPos.addScaledVector(direction, 1 - horizontalDist / currentDist);
      cameraPos.z = targetPos.z + verticalDist;
      const travelDuration = duration ? duration : 'auto';
      const timeoutDuration = duration ? duration * 1000 : 0;
      controls.initiateTravel(cameraPos, travelDuration, targetPos, true);
      setTimeout(resolve, timeoutDuration);
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Compute near and far camera attributes to fit a quadrilatere of the extent + height size
 *
 * @param {THREE.Camera} camera
 * @param {itowns.Extent} extent
 * @param {number} height
 */
export function computeNearFarCamera(camera, extent, height) {
  const points = [
    new THREE.Vector3(extent.west, extent.south, 0),
    new THREE.Vector3(extent.west, extent.south, height),
    new THREE.Vector3(extent.west, extent.north, 0),
    new THREE.Vector3(extent.west, extent.north, height),
    new THREE.Vector3(extent.east, extent.south, 0),
    new THREE.Vector3(extent.east, extent.south, height),
    new THREE.Vector3(extent.east, extent.north, 0),
    new THREE.Vector3(extent.east, extent.north, height),
  ];

  const dirCamera = camera.getWorldDirection(new THREE.Vector3());

  let min = Infinity;
  let max = -Infinity;
  points.forEach(function (p) {
    const pointDir = p.clone().sub(camera.position);
    const cos = pointDir.dot(dirCamera) / pointDir.length(); // Dircamera length is 1
    const dist = p.distanceTo(camera.position) * cos;
    if (min > dist) min = dist;
    if (max < dist) max = dist;
  });

  camera.near = Math.max(min, 0.000001);
  camera.far = max;

  camera.updateProjectionMatrix();
}
