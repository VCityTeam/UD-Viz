import { loadMultipleJSON } from '@ud-viz/utils_browser';
import * as proj4 from 'proj4';
import { PointCloudVisualizer } from '@ud-viz/point_cloud_visualizer';
import { LayerChoice } from '@ud-viz/widget_layer_choice';
import { Bookmark } from '@ud-viz/widget_bookmark';
import * as itowns from 'itowns';
/* { ColoLayer, Extent, WMSSource, ElevationLayer, STRATEGY_DICHOTOMY */

loadMultipleJSON([
  './assets/config/extents.json',
  './assets/config/crs.json',
  './assets/config/layer/3DTiles_point_cloud.json',
  './assets/config/layer/elevation.json',
  './assets/config/layer/base_maps.json',
])
  .then((configs) => {
    proj4.default.defs(
      configs['crs'][0].name,
      configs['crs'][0].transform
    );

    const extent = new itowns.Extent(
      configs['extents'][0].name,
      parseInt(configs['extents'][0].west),
      parseInt(configs['extents'][0].east),
      parseInt(configs['extents'][0].south),
      parseInt(configs['extents'][0].north)
    );

    const DEFAULT_POINT_SIZE = 0.1;

    const app = new PointCloudVisualizer(
      extent,
      configs['3DTiles_point_cloud'],
      {
        parentDomElement: document.body,
        domElementClass: 'full_screen',
        defaultPointCloudSize: DEFAULT_POINT_SIZE,
        c3DTilesLoadingDomElementClasses: ['centered', 'loading'],
        camera: {
          default: {
            position: {
              x: 1844753,
              y: 5174961,
              z: 1000,
            },
          },
        },
        measure: true,
      }
    );

    // add elevation layer
    const isTextureFormat =
      configs['elevation']['format'] == 'image/jpeg' ||
      configs['elevation']['format'] == 'image/png';
    app.itownsView.addLayer(
      new itowns.ElevationLayer(
        configs['elevation']['layer_name'],
        {
          useColorTextureElevation: isTextureFormat,
          colorTextureElevationMinZ: isTextureFormat
            ? configs['elevation']['colorTextureElevationMinZ']
            : null,
          colorTextureElevationMaxZ: isTextureFormat
            ? configs['elevation']['colorTextureElevationMaxZ']
            : null,
          source: new itowns.WMSSource({
            extent: extent,
            url: configs['elevation']['url'],
            name: configs['elevation']['name'],
            crs: extent.crs,
            heightMapWidth: 256,
            format: configs['elevation']['format'],
          }),
        }
      )
    );

    // add basemaps
    configs['base_maps'].forEach((baseMapConfig) => {
      app.itownsView.addLayer(
        new itowns.ColorLayer(baseMapConfig.name, {
          updateStrategy: {
            type: itowns.STRATEGY_DICHOTOMY,
            options: {},
          },
          name: baseMapConfig.name,
          source: new itowns.WMSSource({
            extent: extent,
            name: baseMapConfig.source.name,
            url: baseMapConfig.source.url,
            version: baseMapConfig.source.version,
            crs: extent.crs,
            format: baseMapConfig.source.format,
          }),
          transparent: true,
        })
      );
    });

    // build ui
    const ui = document.createElement('div');
    ui.classList.add('ui');
    document.body.appendChild(ui);

    // speed controls
    ui.appendChild(app.domElementSpeedControls);
    // drag element
    app.domElementTargetDragElement.classList.add('drag_element');
    ui.appendChild(app.domElementTargetDragElement);
    // measure
    ui.appendChild(app.measureDomElement);
    // camera near far
    ui.appendChild(app.clippingPlaneDetails);

    // widget layer choice
    const layerParams = [];
    app.itownsView.getLayers().forEach((layer) => {
      if (
        layer.id == 'planar' ||
        layer.isElevationLayer ||
        layer.isColorLayer
      ) {
        layerParams.push({ layer: layer });
      }
    });
    app.pointCloudLayers.forEach((layer) => {
      layerParams.push({
        isPointCloud: true,
        layer: layer,
        defaultPointCloudSize: DEFAULT_POINT_SIZE,
      });
    });
    const widgetLayerChoice = new LayerChoice(
      app.itownsView,
      layerParams
    );
    widgetLayerChoice.domElement.classList.add('widget_layer_choice');

    ui.appendChild(widgetLayerChoice.domElement);

    // widget bookmark
    const widget = new Bookmark(app.itownsView, {
      parentElement: ui,
    });
    widget.domElement.classList.add('widget_bookmark');

    // eslint-disable-next-line no-constant-condition
    if ('RUN_MODE' == 'production')
      loadingScreen(app.itownsView, ['UD-VIZ', 'UDVIZ_VERSION']);

    window.addEventListener('keydown', (event) => {
      if (event.key == 'p') console.log(app);
    });
  });