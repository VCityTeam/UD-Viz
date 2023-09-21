import * as itowns from 'itowns';

/**
 * It manages multiple WMS sources used as Itowns ColoLayer for background.
 *
 * @class
 */
export class BaseMap {
  /**
   * Manages multiple WMS sources used as Itowns ColoLayer for background
   *
   * @param {itowns.View} itownsView An ItownsView.
   * @param {Array<object>} baseMapLayersConfigs The baseMapLayersConfigs config
   * @param {itowns.Extent} appExtent The extent used to set up the layers
   */
  constructor(itownsView, baseMapLayersConfigs, appExtent) {
    /** @type {HTMLElement} */
    this.domElement = document.createElement('div');

    /** @type {object} */
    this.baseMapLayersConfigs = baseMapLayersConfigs;

    /** @type {itowns.View} */
    this.itownsView = itownsView;

    this.createLayers(appExtent);
    this.displayLayersImage();
  }

  /**
   * Create a WMSSource and an Itowns ColorLayer from each baseMapLayer.
   * The first added is visible.
   *
   * @param {itowns.Extent} appExtent - application extent
   */
  createLayers(appExtent) {
    let i = 0;
    for (const config of this.baseMapLayersConfigs) {
      config.layer.id = 'baseMapLayer_' + i;
      const source = new itowns.WMSSource({
        extent: appExtent,
        name: config.layer.name,
        url: config.layer.url,
        version: config.layer.version,
        crs: appExtent.crs,
        format: 'image/jpeg',
      });
      // Add a WMS imagery layer
      const colorLayer = new itowns.ColorLayer(config.layer.id, {
        updateStrategy: {
          type: itowns.STRATEGY_DICHOTOMY,
          options: {},
        },
        source: source,
        transparent: true,
      });
      if (i != 0) colorLayer.visible = false;
      this.itownsView.addLayer(colorLayer);
      itowns.ColorLayersOrdering.moveLayerToIndex(
        this.itownsView,
        config.layer.id,
        i
      );
      i++;
    }
  }
  /**
   * Display in the widget an image of the Layer, referenced in the field layer.id.
   * It can either be an external URL or an image in the asset folder
   */
  displayLayersImage() {
    for (const config of this.baseMapLayersConfigs) {
      const iconLayer = document.createElement('div');

      const img = document.createElement('img');
      img.src = config.pathIcon;
      img.id = config.layer.id + '_img';
      img.width = 250; // icon dimension are hardcoded
      img.height = 200;
      img.onclick = () => this.changeVisibleLayer(config.layer.id);
      iconLayer.appendChild(img);

      const label = document.createElement('div');
      label.innerText = config.label;
      iconLayer.appendChild(label);

      this.domElement.appendChild(iconLayer);
    }
  }

  /**
   * It makes the layer with the given ID visible and hides all the other layers
   *
   * @param {string} layerID - the id of the layer to be displayed
   */
  changeVisibleLayer(layerID) {
    for (const config of this.baseMapLayersConfigs) {
      this.itownsView.getLayerById(config.layer.id).visible =
        config.layer.id == layerID;
    }
    this.itownsView.notifyChange(this.itownsView.camera.camera3D);
  }
}
