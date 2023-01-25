import * as itowns from 'itowns';

// Component
import { Window } from '../Component/GUI/js/Window';

export class BaseMap extends Window {
  /**
   * Manages multiple WMS sources used as Itowns ColoLayer for background
   *
   * @param {itowns.View} itownsView An ItownsView.
   * @param {object} baseMapLayers The baseMapLayers
   * @param {itowns.Extent} appExtent The extent used to set up the layers
   */
  constructor(itownsView, baseMapLayers, appExtent) {
    super('baseMap', 'base Map', false);
    this.appExtent = appExtent;
    this.baseMapLayers = baseMapLayers;
    this.itownsView = itownsView;
    this.createLayers();
  }

  /**
   * Set Window style and display layers images when the window is created
   */
  windowCreated() {
    this.window.style.left = '10px';
    this.window.style.top = 'unset';
    this.window.style.bottom = '10px';
    this.window.style.width = '270px';
    this.displayLayersImage();
  }

  /**
   * Create a WMSSource and an Itowns ColorLayer from each baseMapLayer.
   * The first added is visible.
   */
  createLayers() {
    let i = 0;
    for (const layer of this.baseMapLayers) {
      layer.id = 'baseMapLayer_' + i;
      const source = new itowns.WMSSource({
        extent: this.appExtent,
        name: layer.name,
        url: layer.url,
        version: layer.version,
        crs: this.appExtent.crs,
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
    for (const layer of this.baseMapLayers) {
      const new_img = document.createElement('img');
      new_img.src = layer.image;
      new_img.id = layer.id + '_img';
      new_img.width = 250;
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
    for (const layer of this.baseMapLayers) {
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
    return `${this.windowId}_baseMap_div`;
  }

  get baseDivElement() {
    return document.getElementById(this.baseDivId);
  }
}
