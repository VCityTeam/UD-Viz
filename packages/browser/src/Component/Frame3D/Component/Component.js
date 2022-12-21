import * as itowns from 'itowns';

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
export function setupAndAddGeoJsonLayers(configGeoJSONLayers, itownsView) {
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
      crs: layerConfig.crs,
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

export { Billboard } from './Billboard';
