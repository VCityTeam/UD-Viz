import { Window } from "../../../Utils/GUI/js/Window";

export class LayerChoice extends Window {
  /**
   * Creates the layer choice windows 
   * 
   * @param {itowns.View} itownsView 
   */
  constructor(itownsView) {
    super('layer_choice', 'Layer', false);

    /**
     * 
     * 
     * @type {itowns.View}
     */
    this.view = itownsView;
  }

  get innerContentHtml() {
    return /*html*/`
    <ul id="${this.layerListId}">
    </ul>
    `;
  }

  windowCreated() {
    let list = this.layerListElement;
    list.innerHTML = '';
    for (let i = 0; i < this.getLayers.length; i++) {
      let item = document.createElement('li');
      item.innerHTML = /*html*/`
         <li><input type="checkbox" id="${i}" checked></input>${this.getLayers[i].id}</li>
       `;
      item.onchange = (event) => {
        this.getLayers[event.srcElement.id].visible = event.srcElement.checked;
        this.view.notifyChange();
      };
      list.appendChild(item);
    }
  }

  ////// GETTERS

  get layerListId() {
    return `${this.windowId}_layer_list`;
  }

  get layerListElement() {
    return document.getElementById(this.layerListId);
  }

  get getLayers() {
    return this.view.getLayers(layer => layer.id !== "planar" && layer.isGeometryLayer);
  }




}