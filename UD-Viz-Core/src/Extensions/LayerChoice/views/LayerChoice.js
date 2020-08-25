import { Window } from "../../../Utils/GUI/js/Window";

export class LayerChoice extends Window {
  /**
   * Creates the layer choice windows 
   * 
   * @param {itowns.View} itownsView 
   */
  constructor(layerManager) {
    super('layer_choice', 'Layer', false);

    /**
     * 
     * 
     * @type {itowns.View}
     */
    this.layerManager = layerManager;
  }

  get innerContentHtml() {
    return /*html*/`
    <ul id="${this.layerListId}">
    </ul>
    <div class ="layer_lists"> 
      <h2>Color Layers</h3>
      <ul id= "${this.colorLayersId}">
      </ul>
    </div>
    <div class ="layer_lists"> 
      <h2>Elevation Layers</h3>
      <ul id= "${this.elevationLayersId}">
      </ul>
    </div>
    <div class ="layer_lists"> 
      <h2>Geometry Layers</h3>
      <ul id= "${this.geometryLayersId}">
      </ul>
    </div>
    `;
  }

  windowCreated() {
    this.innerContentColorLayers();
    this.innerContentElevationLayers();
    this.innerContentGeometryLayers();

  }

  innerContentColorLayers() {
    let list = this.colorLayerListElement;
    list.innerHTML = '';
    let layers = this.layerManager.getColorLayers();
    for (let i = 0; i < layers.length; i++) {
      let itemVisible = document.createElement('div');
      itemVisible.innerHTML = `<h3>${layers[i].id}</h3>
                      Visible <input type="checkbox" id="${i}" ${layers[i].visible ? "checked" : ""}></input></li>`;
      itemVisible.onchange = (event) => {
        layers[event.srcElement.id].visible = event.srcElement.checked;
        this.layerManager.notifyChange();
      };
      list.appendChild(itemVisible);
      let item = document.createElement('div');
      item.innerHTML = `Opacity : ${layers[i].opacity} <input type ="range" id="${i}" min="0" max="1" step = "0.1" value="${layers[i].opacity}"></input>`;
      item.onchange = (event) => {
        this.layerManager.updateOpacity(layers[i], event.srcElement.valueAsNumber);
        item.innerHTML = `Opacity : ${layers[i].opacity} <input type ="range" id="${i}" min="0" max="1" step = "0.1" value="${layers[i].opacity}"></input>`;
        this.layerManager.notifyChange();
      };
      list.appendChild(item);
    }
  }

  innerContentElevationLayers() {
    let list = this.elevationLayerListElement;
    list.innerHTML = '';
    let layers = this.layerManager.getElevationLayers();
    for (let i = 0; i < layers.length; i++) {
      let item = document.createElement('div');
      item.innerHTML = `<h3>${layers[i].id}</h3>
                        Scale : ${layers[i].scale} <input type ="range" id="${i}" min="1" max="10" step = "1" value="${layers[i].scale}"></input>`;
      item.onchange = (event) => {
        this.layerManager.updateScale(layers[i], event.srcElement.valueAsNumber);
        item.innerHTML = `<h3>${layers[i].id}</h3>
         Scale : ${layers[i].scale}<input type ="range" id="${i}" min="1" max="10" step = "1" value="${layers[i].scale}"></input>`;
        this.layerManager.notifyChange();
      };
      list.appendChild(item);
    }
  }

  innerContentGeometryLayers() {
    let list = this.geometryLayerListElement;
    list.innerHTML = '';
    let layers = this.layerManager.getGeometryLayers();
    for (let i = 0; i < layers.length; i++) {
      let itemVisible = document.createElement('div');
      itemVisible.innerHTML = `<h3>${layers[i].id}</h3>
                      Visible <input type="checkbox" id="${i}" ${layers[i].visible ? "checked" : ""}></input></li>`;
      itemVisible.onchange = (event) => {
        layers[event.srcElement.id].visible = event.srcElement.checked;
        this.layerManager.notifyChange();
      };
      list.appendChild(itemVisible);
      let item = document.createElement('div');
      item.innerHTML = `Opacity : ${layers[i].opacity} <input type ="range" id="${i}" min="0" max="1" step = "0.1" value="${layers[i].opacity}"></input>`;
      item.onchange = (event) => {
        this.layerManager.updateOpacity(layers[i], event.srcElement.valueAsNumber);
        item.innerHTML = `Opacity : ${layers[i].opacity} <input type ="range" id="${i}" min="0" max="1" step = "0.1" value="${layers[i].opacity}"></input>`;
        this.layerManager.notifyChange();
      };
      list.appendChild(item);
    }
  }
  ////// GETTERS

  get colorLayersId() {
    return `${this.windowId}_color_layers`;
  }

  get elevationLayersId() {
    return `${this.windowId}_elevation_layers`;
  }

  get geometryLayersId() {
    return `${this.windowId}_geometry_layers`;
  }

  get layerListId() {
    return `${this.windowId}_layer_list`;
  }

  get layerListElement() {
    return document.getElementById(this.layerListId);
  }

  get colorLayerListElement() {
    return document.getElementById(this.colorLayersId);
  }

  get elevationLayerListElement() {
    return document.getElementById(this.elevationLayersId);
  }

  get geometryLayerListElement() {
    return document.getElementById(this.geometryLayersId);
  }
}