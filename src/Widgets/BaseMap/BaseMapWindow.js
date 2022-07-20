/** @format */

const THREE = require('three');
import * as itowns from 'itowns';

//Components
import { Window } from '../Components/GUI/js/Window';

export class BaseMap extends Window {
  constructor(itownsView, baseMapLayers,appExtent,appProjection) {
    super('baseMap', 'base Map', false);
    this.appExtent= appExtent;
    this.appProjection = appProjection;
    this.baseMapLayers = baseMapLayers;
    this.itownsView = itownsView;
    this.createLayers();
  }

  windowCreated() {
    this.window.style.left = '10px';
    this.window.style.top = 'unset';
    this.window.style.bottom = '10px';
    this.window.style.width = '270px';
    this.displayLayers();
  }

  createLayers(){
    let i = 0;
    for(let layer of this.baseMapLayers){
      layer.id = "baseMapLayer_"+i;
      let source = new itowns.WMSSource({
        extent: this.appExtent,
        name: layer.name,
        url: layer.url,
        version: layer.version,
        projection: this.appProjection,
        format: "image/jpeg",
      });
      // Add a WMS imagery layer
      let colorLayer = new itowns.ColorLayer(
        layer.id,
        {
          updateStrategy: {
            type: itowns.STRATEGY_DICHOTOMY,
            options: {},
          },
          source: source,
          transparent: true,
        }
      );
      if(i!=0)
        layer.visible = false;
      this.itownsView.addLayer(colorLayer); 
      i++;
    }
  }

  displayLayers() {
    for (let layer of this.baseMapLayers) {
      let new_img = document.createElement('img');
      new_img.src = layer.image;
      new_img.id = layer.id + '_img';
      new_img.width = 250;
      new_img.height = 200;
      new_img.onclick = () => this.changeVisibleLayer(layer.id);
      this.baseDivElement.appendChild(new_img);
    }
  }
  
  changeVisibleLayer(layerID) {
    for (let layer of this.baseMapLayers) {
      this.itownsView.getLayerById(layer.id).visible = (layer.id == layerID);
    }
    this.itownsView.notifyChange();
  }

  get innerContentHtml() {
    return /*html*/ `
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
