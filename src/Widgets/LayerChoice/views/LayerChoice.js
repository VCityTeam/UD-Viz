/** @format */

//Components
import { Window } from '../../Components/GUI/js/Window';
import { LayerManager } from '../../Components/LayerManager/LayerManager';

export class LayerChoice extends Window {
  /**
   * Creates the layer choice windows
   *
   * @param {LayerManager} layerManager
   */
  constructor(layerManager) {
    super('layer_choice', 'Layer', false);

    /**
     * the layerManager
     */
    this.layerManager = layerManager;
  }

  get innerContentHtml() {
    return /*html*/ `
    <div id="${this.layerListId}">
        <div class ="box-section"> 
        <input type="checkbox" class="spoiler-check" id="color-layers-spoiler">
        <label for="color-layers-spoiler" class="section-title">Color Layers</Label>
          <div class="spoiler-box" id="${this.colorLayersId}">
          </div>
        </div>
      <div class ="box-section"> 
      <input type="checkbox" class="spoiler-check" id="elevation-layers-spoiler">
      <label for="elevation-layers-spoiler" class="section-title">Elevation Layers</Label>
        <div class="spoiler-box" id="${this.elevationLayersId}">
        </div>
      </div>
      <div class ="box-section"> 
        <input type="checkbox" class="spoiler-check" id="geometry-layers-spoiler">
        <label for="geometry-layers-spoiler" class="section-title">Geometry Layers</Label>
        <div class="spoiler-box" id="${this.geometryLayersId}">
        </div>
      </div>
    </div>

    `;
  }

  windowCreated() {
    this.innerContentColorLayers();
    this.innerContentElevationLayers();
    this.innerContentGeometryLayers();
  }

  // Create the description part of ColorLayers
  innerContentColorLayers() {
    let list = this.colorLayerListElement;
    list.innerHTML = '';
    let layers = this.layerManager.getColorLayers();
    for (let i = 0; i < layers.length; i++) {
      let item = document.createElement('div');
      item.innerHTML = `<label for="${
        layers[i].id
      }-spoiler" class="section-title">${layers[i].id}</Label>
                        Visible <input type="checkbox" id="checkbox_${i}" ${
  layers[i].visible ? 'checked' : ''
}></input></br>
                        <div id="opacity_${i}"> 
                          Opacity : <span id="color_value_opacity_${i}">${
  layers[i].opacity
}</span>  <input type ="range" id="range_${i}" min="0" max="1" step = "0.1" value="${
  layers[i].opacity
}"></input>
                        </div>`;

      item.oninput = (event) => {
        if (event.srcElement.id === 'checkbox_' + i) {
          layers[i].visible = event.srcElement.checked;
        }
        if (event.srcElement.id === 'range_' + i) {
          this.layerManager.updateOpacity(
            layers[i],
            event.srcElement.valueAsNumber
          );
        }
        let span_opacity = document.getElementById('color_value_opacity_' + i);
        span_opacity.innerHTML = `${layers[i].opacity}`;
        this.layerManager.notifyChange();
      };
      list.appendChild(item);
    }
  }

  // Create the description part of ElevationLayers
  innerContentElevationLayers() {
    let list = this.elevationLayerListElement;
    list.innerHTML = '';
    let layers = this.layerManager.getElevationLayers();
    for (let i = 0; i < layers.length; i++) {
      let item = document.createElement('div');
      item.innerHTML = `<h3>${layers[i].id}</h3>
                        Scale : <span id="elevation_value_scale_${i}">${layers[i].scale}</span> <input type ="range" id="${i}" min="1" max="10" step = "1" value="${layers[i].scale}"></input>`;

      item.oninput = (event) => {
        this.layerManager.updateScale(
          layers[i],
          event.srcElement.valueAsNumber
        );
        this.layerManager.notifyChange();
        let span_elevation = document.getElementById(
          'elevation_value_scale_' + i
        );
        span_elevation.innerHTML = `${layers[i].scale}`;
      };
      list.appendChild(item);
    }
  }

  // Create the description part of GeometryLayers
  innerContentGeometryLayers() {
    let list = this.geometryLayerListElement;
    list.innerHTML = '';
    let layers = this.layerManager.getGeometryLayers();

    let div = document.createElement('div');
    div.innerHTML = `
      All Visible <input type="checkbox" id="checkbox" ${
  this.layerManager.isOneLayerVisible() ? 'checked' : ''
}></input></br>
  `;
    div.onchange = (event) => {
      this.layerManager.changeVisibility(event.srcElement.checked);
      this.layerManager.notifyChange();
    };
    list.append(div);
    for (let i = 0; i < layers.length; i++) {
      let tilesManager = this.layerManager.getTilesManagerByLayerID(
        layers[i].id
      );

      let itemDivClasses = document.createElement('div');
      let tiles = undefined;
      let htmlTiles = '';
      if (tilesManager !== undefined) {
        tiles = tilesManager.getTilesWithGeom();
        for (let j = 0; j < tiles.length; j++) {
          if (tiles[j].asAttributeInBatchTable('classe')) {
            let classe =
              tiles[j].batchTable.content.classe[
                tiles[j].cityObjects[0].batchId
              ];
            htmlTiles += `<p><input type="checkbox" id="checkbox_${i}_${j}" ${
              tiles[j].getMesh().visible ? 'checked' : ''
            }>${classe}</input></p>`;
          }
        }
      }
      itemDivClasses.innerHTML = htmlTiles;

      itemDivClasses.oninput = (event) => {
        if (event.srcElement.id.includes('checkbox_' + i + '_')) {
          let tileIndex = event.srcElement.id.split('_'); //.slice(-1)[0];
          tileIndex = tileIndex[tileIndex.length - 1];
          tiles[tileIndex].getMesh().visible =
            !tiles[tileIndex].getMesh().visible;
          this.layerManager.notifyChange();
        }
      };

      let item = document.createElement('div');

      let itemInput = document.createElement('input');
      itemInput.type = 'checkbox';
      itemInput.className = 'spoiler-check';
      itemInput.id = layers[i].id + '-spoiler';

      let itemLabel = document.createElement('label');
      itemLabel.htmlFor = layers[i].id + '-spoiler';
      itemLabel.className = 'subsection-title';
      itemLabel.innerHTML = layers[i].id + ' ';
      console.log(layers[i]);
      if (layers[i].isC3DTilesLayer) {
        let itemButton = document.createElement('button');
        itemButton.id = 'button_' + layers[i].id;
        itemButton.innerText = 'Focus';

        itemButton.onclick = (event) => {
          let tilesManager = this.layerManager.getTilesManagerByLayerID(
            layers[i].id
          );
          tilesManager.focusCamera();
        };
        itemLabel.appendChild(itemButton);
      }
      let itemDivSpoiler = document.createElement('div');
      itemDivSpoiler.className = 'spoiler-box';

      let itemDivVisibility = document.createElement('div');
      itemDivVisibility.id = 'visible_' + i;
      itemDivVisibility.innerHTML = `Visible <input type="checkbox" id="checkbox_${i}" ${
        layers[i].visible ? 'checked' : ''
      }></input></br>`;

      itemDivVisibility.oninput = (event) => {
        if (event.srcElement.id === 'checkbox_' + i) {
          layers[i].visible = event.srcElement.checked;
        }
      };

      let itemDivOpacity = document.createElement('div');
      itemDivOpacity.id = 'opacity' + i;
      itemDivOpacity.innerHTML = `Opacity : <span id="geometry_value_opacity_${i}">${layers[i].opacity}</span> <input type ="range" id="range_${i}" min="0" max="1" step = "0.1" value="${layers[i].opacity}">`;

      itemDivOpacity.oninput = (event) => {
        if (event.srcElement.id === 'range_' + i) {
          this.layerManager.updateOpacity(
            layers[i],
            event.srcElement.valueAsNumber
          );
        }
      };

      itemDivSpoiler.appendChild(itemDivVisibility);
      itemDivSpoiler.appendChild(itemDivOpacity);
      itemDivSpoiler.appendChild(itemDivClasses);

      item.appendChild(itemInput);
      item.appendChild(itemLabel);
      item.appendChild(itemDivSpoiler);

      item.oninput = (event) => {
        let div_visible = document.getElementById('visible_' + i);
        div_visible.innerHTML = `Visible <input type="checkbox" id="checkbox_${i}" ${
          layers[i].visible ? 'checked' : ''
        }></input></br>`;
        let span_opacity = document.getElementById(
          'geometry_value_opacity_' + i
        );
        span_opacity.innerHTML = `${layers[i].opacity}`;
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
