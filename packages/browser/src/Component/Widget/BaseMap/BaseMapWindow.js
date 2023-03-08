import * as itowns from 'itowns';
import { findChildByID } from '../../HTMLUtil';

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
   * @param {object} baseMapLayersConfig The baseMapLayersConfig config
   * @param {itowns.Extent} appExtent The extent used to set up the layers
   */
  constructor(itownsView, baseMapLayersConfig, appExtent) {
    /** @type {HTMLElement} */
    this.rootHtml = document.createElement('div');
    this.rootHtml.innerHTML = this.innerContentHtml;

    /** @type {object} */
    this.baseMapLayersConfig = baseMapLayersConfig;

    /** @type {itowns.View} */
    this.itownsView = itownsView;

    this.createLayers(appExtent);
    this.displayLayersImage();
  }

  /**
   *
   * @returns {HTMLElement} - root html
   */
  html() {
    return this.rootHtml;
  }

  /**
   * Remove root html from DOM
   */
  dispose() {
    this.rootHtml.remove();
  }

  /**
   * Create a WMSSource and an Itowns ColorLayer from each baseMapLayer.
   * The first added is visible.
   *
   * @param {itowns.Extent} appExtent - application extent
   */
  createLayers(appExtent) {
    let i = 0;
    for (const layer of this.baseMapLayersConfig) {
      layer.id = 'baseMapLayer_' + i;
      const source = new itowns.WMSSource({
        extent: appExtent,
        name: layer.name,
        url: layer.url,
        version: layer.version,
        crs: appExtent.crs,
        format: 'image/jpeg',
      });
      // Add a WMS imagery layer
      const colorLayer = new itowns.ColorLayer(layer.id, {
        updateStrategy: {
          type: itowns.STRATEGY_DICHOTOMY,
          options: {},
        },
        source: source,
        transparent: true,
      });
      if (i != 0) colorLayer.visible = false;
      this.itownsView.addLayer(colorLayer);
      itowns.ColorLayersOrdering.moveLayerToIndex(this.itownsView, layer.id, i);
      i++;
    }
  }
  /**
   * Display in the widget an image of the Layer, referenced in the field layer.id.
   * It can either be an external URL or an image in the asset folder
   */
  displayLayersImage() {
    for (const layer of this.baseMapLayersConfig) {
      const new_img = document.createElement('img');
      new_img.src = layer.image;
      new_img.id = layer.id + '_img';
      new_img.width = 250; // icon dimension are hardcoded
      new_img.height = 200;
      new_img.onclick = () => this.changeVisibleLayer(layer.id);
      this.baseDivElement.appendChild(new_img);
    }
  }

  /**
   * It makes the layer with the given ID visible and hides all the other layers
   *
   * @param {string} layerID - the id of the layer to be displayed
   */
  changeVisibleLayer(layerID) {
    for (const layer of this.baseMapLayersConfig) {
      this.itownsView.getLayerById(layer.id).visible = layer.id == layerID;
    }
    this.itownsView.notifyChange(this.itownsView.camera.camera3D);
  }

  get innerContentHtml() {
    return /* html*/ `
    <div id="${this.baseDivId}"></div>
    `;
  }

  get baseDivId() {
    return `View_baseMap_div`;
  }

  get baseDivElement() {
    return findChildByID(this.rootHtml, this.baseDivId);
  }
}
