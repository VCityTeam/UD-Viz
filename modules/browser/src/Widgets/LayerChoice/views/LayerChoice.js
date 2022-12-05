

// Components
import { Window } from '../../Components/GUI/js/Window';
import { LayerManager } from '../../../Components/LayerManager/LayerManager';

export class LayerChoice extends Window {
  /**
   * Creates the layer choice windows
   *
   * @param {LayerManager} layerManager
   */
  constructor(layerManager) {
    super('layer_choice', 'Layer', false);

    /**
     * The layerManager
     */
    this.layerManager = layerManager;
  }

  get innerContentHtml() {
    return /* html*/ `
    <div id="${this.layerListId}">
        <div class="box-section" id="${this.colorLayersBoxSectionId}"> 
        <input type="checkbox" class="spoiler-check" id="color-layers-spoiler">
        <label for="color-layers-spoiler" class="section-title">Color Layers</Label>
          <div class="spoiler-box" id="${this.colorLayersSpoilerBoxId}">
          </div>
        </div>
      <div class="box-section" id="${this.elevationLayersBoxSectionId}"> 
      <input type="checkbox" class="spoiler-check" id="elevation-layers-spoiler">
      <label for="elevation-layers-spoiler" class="section-title">Elevation Layers</Label>
        <div class="spoiler-box" id="${this.elevationLayersSpoilerBoxId}">
        </div>
      </div>
      <div class="box-section" id=${this.geometryLayersBoxSectionId}> 
        <input type="checkbox" class="spoiler-check" id="geometry-layers-spoiler">
        <label for="geometry-layers-spoiler" class="section-title">Geometry Layers</Label>
        <div class="spoiler-box" id="${this.geometryLayersSpoilerBoxId}">
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
    const list = this.colorLayersSpoilerBoxElement;
    list.innerHTML = '';
    const layers = this.layerManager.getColorLayers();
    for (let i = 0; i < layers.length; i++) {
      const item = document.createElement('div');
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
        const span_opacity = document.getElementById(
          'color_value_opacity_' + i
        );
        span_opacity.innerHTML = `${layers[i].opacity}`;
        this.layerManager.notifyChange();
      };
      list.appendChild(item);
    }
  }

  // Create the description part of ElevationLayers
  innerContentElevationLayers() {
    const list = this.elevationLayersSpoilerBoxElement;
    list.innerHTML = '';
    const layers = this.layerManager.getElevationLayers();
    for (let i = 0; i < layers.length; i++) {
      const item = document.createElement('div');
      item.innerHTML = `<h3>${layers[i].id}</h3>
                        Scale : <span id="elevation_value_scale_${i}">${layers[i].scale}</span> <input type ="range" id="${i}" min="1" max="10" step = "1" value="${layers[i].scale}"></input>`;

      item.oninput = (event) => {
        this.layerManager.updateScale(
          layers[i],
          event.srcElement.valueAsNumber
        );
        this.layerManager.notifyChange();
        const span_elevation = document.getElementById(
          'elevation_value_scale_' + i
        );
        span_elevation.innerHTML = `${layers[i].scale}`;
      };
      list.appendChild(item);
    }
  }

  // Create the description part of GeometryLayers
  innerContentGeometryLayers() {
    const list = this.geometryLayersSpoilerBoxElement;
    list.innerHTML = '';
    const layers = this.layerManager.getGeometryLayers();

    const div = document.createElement('div');
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
      const item = document.createElement('div');
      item.id = 'div' + layers[i].id;
      item.className = 'box-section';
      item.innerText = layers[i].id + ' ';

      const itemDivVisibility = document.createElement('span');
      itemDivVisibility.id = 'visible_' + layers[i].id;

      const itemCheckboxVisibility = document.createElement('input');
      itemCheckboxVisibility.setAttribute('type', 'checkbox');
      itemCheckboxVisibility.id = 'checkbox_' + layers[i].id;
      itemCheckboxVisibility.checked = layers[i].visible;
      itemCheckboxVisibility.onclick = (event) => {
        layers[i].visible = event.srcElement.checked;
        this.layerManager.notifyChange();
      };

      itemDivVisibility.appendChild(itemCheckboxVisibility);
      item.appendChild(itemDivVisibility);

      if (layers[i].isC3DTilesLayer) {
        const itemButton = document.createElement('button');
        itemButton.id = 'button_' + layers[i].id;
        itemButton.innerText = 'Focus';

        itemButton.onclick = () => {
          const tilesManager = this.layerManager.getTilesManagerByLayerID(
            layers[i].id
          );
          tilesManager.focusCamera();
        };
        item.appendChild(itemButton);
      } else {
        const itemDivOpacity = document.createElement('div');
        itemDivOpacity.id = 'opacity_' + layers[i].id;

        const itemRangeOpacity = document.createElement('input');
        itemRangeOpacity.setAttribute('type', 'range');
        itemRangeOpacity.min = 0;
        itemRangeOpacity.max = 1;
        itemRangeOpacity.step = 0.1;
        itemRangeOpacity.value = layers[i].opacity;

        itemRangeOpacity.onchange = (event) => {
          this.layerManager.updateOpacity(
            layers[i],
            event.srcElement.valueAsNumber
          );
          this.layerManager.notifyChange();
        };

        itemDivOpacity.appendChild(itemRangeOpacity);

        const itemSpanOpacity = document.createElement('span');
        itemSpanOpacity.innerText = ' Opacity';
        itemDivOpacity.appendChild(itemSpanOpacity);
        item.appendChild(itemDivOpacity);
      }

      list.appendChild(item);
    }
  }
  // //// GETTERS

  // /ID
  get colorLayersBoxSectionId() {
    return `box_section_${this.colorLayersId}`;
  }

  get colorLayersSpoilerBoxId() {
    return `spoiler_box_${this.colorLayersId}`;
  }

  get colorLayersId() {
    return `${this.windowId}_color_layers`;
  }

  get elevationLayersBoxSectionId() {
    return `box_section_${this.elevationLayersId}`;
  }

  get elevationLayersSpoilerBoxId() {
    return `spoiler_box_${this.elevationLayersId}`;
  }

  get elevationLayersId() {
    return `${this.windowId}_elevation_layers`;
  }

  get geometryLayersBoxSectionId() {
    return `box_section_${this.geometryLayersId}`;
  }

  get geometryLayersSpoilerBoxId() {
    return `spoiler_box_${this.geometryLayersId}`;
  }

  get geometryLayersId() {
    return `${this.windowId}_geometry_layers`;
  }

  get layerListId() {
    return `${this.windowId}_layer_list`;
  }

  // /HTML ELEMENTS

  get layerListElement() {
    return document.getElementById(this.layerListId);
  }

  get colorLayersBoxSectionElement() {
    return document.getElementById(this.colorLayersBoxSectionId);
  }

  get colorLayersSpoilerBoxElement() {
    return document.getElementById(this.colorLayersSpoilerBoxId);
  }

  get colorLayerListElement() {
    return document.getElementById(this.colorLayersId);
  }

  get elevationLayersBoxSectionElement() {
    return document.getElementById(this.elevationLayersBoxSectionId);
  }

  get elevationLayersSpoilerBoxElement() {
    return document.getElementById(this.elevationLayersSpoilerBoxId);
  }

  get elevationLayerListElement() {
    return document.getElementById(this.elevationLayersId);
  }

  get geometryLayersBoxSectionElement() {
    return document.getElementById(this.geometryLayersBoxSectionId);
  }

  get geometryLayersSpoilerBoxElement() {
    return document.getElementById(this.geometryLayersSpoilerBoxId);
  }

  get geometryLayerListElement() {
    return document.getElementById(this.geometryLayersId);
  }
}
