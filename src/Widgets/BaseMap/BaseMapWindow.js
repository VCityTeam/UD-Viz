/** @format */

const THREE = require('three');

//Components
import { Window } from '../../Components/GUI/js/Window';

export class Debug3DTilesWindow extends Window {
  constructor(itownsView, baseMapLayers) {
    super('baseMap', 'base Map', false);
    this.baseMapLayers = baseMapLayers;
    this.itownsView = itownsView;
  }

  windowCreated() {
    this.window.style.left = '10px';
    this.window.style.top = 'unset';
    this.window.style.bottom = '10px';
    this.window.style.width = '270px';
    this.displayLayers();
  }

  displayLayers() {
    for (let layer of this.baseMapLayers) {
      let new_img = document.createElement('img');
      new_img.src = './assets/img/' + layer.id + '.png';
      new_img.id = layer.id + '_img';
      new_img.width = 400;
      new_img.height = 200;
      new_img.onclick = () => this.changeVisibleLayer(layer.id);
      this.baseDivElement.appendChild(new_img);
    }
  }
  changeVisibleLayer(layerID) {
    for (let layer of this.baseMapLayers) {
      layer.visible = (layer.id == layerID);
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
