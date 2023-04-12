// If functions declare here are needed by widgets these functions should be propose to itowns
// If not this function are just meant to be use in an @ud-viz/browser eg in Template

const THREE = require('three');
const itowns = require('itowns');

/**  ADD LAYER TO ITOWNS VIEW FROM CONFIG */

/**
 * It creates a 3D Tiles layer,
 * and adds it to the layer manager
 *
 * @param {*} layer - the layer object from the config file
 * @param {itowns.View} itownsView - the itowns view
 * @param {object} extensions - optional extensions
 * @returns {itowns.C3DTilesLayer} A 3D Tiles Layer
 */
export function createC3DTilesLayer(layer, itownsView, extensions = null) {
  if (!layer['id'] || !layer['url']) {
    throw (
      'Your layer does not have url id properties or both. ' +
      '(in UD-Viz/UD-Viz-Shared/examples/data/config/generalDemoConfig.json)'
    );
  }

  /** @type {itowns.C3DTilesLayer} */
  const $3dTilesLayer = new itowns.C3DTilesLayer(
    layer['id'],
    {
      name: layer['id'],
      source: new itowns.C3DTilesSource({
        url: layer['url'],
      }),
      registeredExtensions: extensions,
    },
    itownsView
  );

  return $3dTilesLayer;
}

/**
 * Setup and add 3D tiles to an itowns view
 *
 * @param {object} config3DTilesLayers An object containing 3D Tiles layers configs
 * @param {itowns.View} itownsView - the itowns view
 */
export function add3DTilesLayers(config3DTilesLayers, itownsView) {
  // Positional arguments verification
  if (!config3DTilesLayers) {
    console.warn('no 3DTilesLayers config');
    return;
  }
  for (const layer of config3DTilesLayers) {
    itowns.View.prototype.addLayer.call(
      itownsView,
      createC3DTilesLayer(layer, itownsView)
    );
  }
}

/**
 * Sets up a GeoJson layers and adds them to the itowns view (for the demos
 * that don't need more granularity than that).
 *
 * @param {object} configGeoJSONLayers An object containing GeoJSON layers configs
 * @param {itowns.View} itownsView - the itowns view
 * @param {itowns.Extent} extent extent of the view
 */
export function addGeoJsonLayers(configGeoJSONLayers, itownsView, extent) {
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
   */
  const setupAndAddGeoJsonLayer = function (layerConfig) {
    if (!layerConfig['id'] || !layerConfig['url']) {
      console.warn(
        'Your "GeoJsonLayer" field does not have either "url" or "id" properties. ' +
          '(in UD-Viz/examples/config/all_widget_config.json)'
      );
      return;
    }

    // Declare the data source for the layerConfig
    const source = new itowns.FileSource({
      url: layerConfig.url,
      crs: extent.crs,
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
 * Sets up LabelLayers and adds them to the itowns view.
 * The source of a LabelLayer can be either a WFS source or a File source.
 * The features in the source must be Point geometries.
 *
 * @param {object} configLabelLayers An object containing layers configs
 * @param {itowns.View} itownsView - the itowns view
 * @param {itowns.Extent} extent extent of the view
 */
export function addLabelLayers(configLabelLayers, itownsView, extent) {
  // Positional arguments verification
  if (!configLabelLayers) {
    console.warn('No "labelLayers" field in the configuration file');
    return;
  }
  /**
   * Create an iTowns LabelLayer based on the specified layerConfig.
   *
   * @param {object} layerConfig The JSON config of the layer
   * @param {string} layerConfig.id The ID of the layer
   * @param {string} layerConfig.sourceType The type of the source, should be either "file" or "wfs"
   * @param {object} layerConfig.style The iTowns style of the label layer
   * @param {string} layerConfig.url The URL of the layer
   * @param {string} layerConfig.name If the source is WFS, the name of the source
   * @param {object} layerConfig.zoom The min/max zoom to display the layer
   */
  const setupAndAddLabelLayer = function (layerConfig) {
    if (
      !layerConfig['id'] ||
      !layerConfig['url'] ||
      !layerConfig['sourceType']
    ) {
      console.warn(
        'Your "LabelLayer" field does not have either "url", "id" or "sourceType" properties. '
      );
      return;
    }

    let source = null;

    // Declare the data source for the LabelLayer
    if (layerConfig['sourceType'] == 'file') {
      source = new itowns.FileSource({
        url: layerConfig.url,
        crs: extent.crs,
        format: 'application/json',
      });
    } else if (layerConfig['sourceType'] == 'wfs') {
      source = new itowns.WFSSource({
        url: layerConfig.url,
        version: '2.0.0',
        typeName: layerConfig.name,
        crs: extent.crs,
        format: 'application/json',
      });
    } else {
      console.warn(
        'Unsupported LabelLayer sourceType ' + layerConfig['sourceType']
      );
      return;
    }

    const layerStyle = new itowns.Style(layerConfig.style);

    const zoom = { min: 0 };
    if (layerConfig.zoom) {
      if (layerConfig.zoom.min) zoom.min = layerConfig.zoom.min;
      if (layerConfig.zoom.max) zoom.max = layerConfig.zoom.max;
    }

    const labelLayer = new itowns.LabelLayer(layerConfig.id, {
      transparent: true,
      source: source,
      style: layerStyle,
      zoom: zoom,
    });
    itownsView.addLayer(labelLayer);
  };

  for (const layer of configLabelLayers) {
    setupAndAddLabelLayer(layer);
  }
}

/**
 * Add Base map layer to an itowns view
 *
 * @param {object} baseMapLayerConfig An object with the config of the base map
 * @param {itowns.View} itownsView The iTowns view
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
 * @param {object} configElevationLayer An object with the config of the elevation layer
 * @param {itowns.View} itownsView The iTowns view
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

/** CAMERA */

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
 * @returns {Promise} Promise of the camera focusing on target
 * @todo this function is used by widget should be contribute to itowns or be remove
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
 *
 * Focus a C3DTiles Layer
 *
 * @param {itowns.PlanarView} itownsView - view
 * @param {itowns.C3DTilesLayer} layer - layer to focus
 * @todo this function is used by widget should be contribue or removed
 */
export function focusC3DTilesLayer(itownsView, layer) {
  if (!layer.isC3DTilesLayer) return;

  const coordinates = itownsView.camera.position();
  const extent = layer.extent;
  coordinates.x = (extent.east + extent.west) / 2;
  coordinates.y = (extent.north + extent.south) / 2;
  coordinates.z = 200;
  if (layer.tileset.tiles[0])
    coordinates.z = layer.tileset.tiles[0].boundingVolume.box.max.z;
  focusCameraOn(itownsView, itownsView.controls, coordinates, {
    verticalDistance: 200,
    horizontalDistance: 200,
  });
}
