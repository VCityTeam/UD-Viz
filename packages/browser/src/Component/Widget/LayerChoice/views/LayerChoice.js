import { LayerManager } from '../../../Itowns/LayerManager/LayerManager';
import { findChildByID } from '../../../HTMLUtil';

export class LayerChoice {
  /**
   * Creates the layer choice windows
   *
   * @param {LayerManager} layerManager The LayerManager holding iTowns layers
   */
  constructor(layerManager) {
    this.rootHtml = document.createElement('div');
    this.rootHtml.innerHTML = this.innerContentHtml;

    /**
     * The layerManager
     */
    this.layerManager = layerManager;

    this.innerContentColorLayers();
    this.innerContentElevationLayers();
    this.innerContentGeometryLayers();
  }

  html() {
    return this.rootHtml;
  }

  dispose() {
    this.rootHtml.remove();
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

  /**
   * Create the description part of ColorLayers
   */
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
        const span_opacity = findChildByID(item, 'color_value_opacity_' + i);
        span_opacity.innerHTML = `${layers[i].opacity}`;
        this.layerManager.notifyChange();
      };
      list.appendChild(item);
    }
  }

  /**
   * Create the description part of ElevationLayers
   */
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
        const span_elevation = findChildByID(
          item,
          'elevation_value_scale_' + i
        );
        span_elevation.innerHTML = `${layers[i].scale}`;
      };
      list.appendChild(item);
    }
  }

  /**
   * Create the description part of GeometryLayers
   */
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
    return `layer_choice_color_layers`;
  }

  get elevationLayersBoxSectionId() {
    return `box_section_${this.elevationLayersId}`;
  }

  get elevationLayersSpoilerBoxId() {
    return `spoiler_box_${this.elevationLayersId}`;
  }

  get elevationLayersId() {
    return `layer_choice_elevation_layers`;
  }

  get geometryLayersBoxSectionId() {
    return `box_section_${this.geometryLayersId}`;
  }

  get geometryLayersSpoilerBoxId() {
    return `spoiler_box_${this.geometryLayersId}`;
  }

  get geometryLayersId() {
    return `layer_choice_geometry_layers`;
  }

  get layerListId() {
    return `layer_choice_layer_list`;
  }

  // /HTML ELEMENTS

  get layerListElement() {
    return findChildByID(this.rootHtml, this.layerListId);
  }

  get colorLayersBoxSectionElement() {
    return findChildByID(this.rootHtml, this.colorLayersBoxSectionId);
  }

  get colorLayersSpoilerBoxElement() {
    return findChildByID(this.rootHtml, this.colorLayersSpoilerBoxId);
  }

  get colorLayerListElement() {
    return findChildByID(this.rootHtml, this.colorLayersId);
  }

  get elevationLayersBoxSectionElement() {
    return findChildByID(this.rootHtml, this.elevationLayersBoxSectionId);
  }

  get elevationLayersSpoilerBoxElement() {
    return findChildByID(this.rootHtml, this.elevationLayersSpoilerBoxId);
  }

  get elevationLayerListElement() {
    return findChildByID(this.rootHtml, this.elevationLayersId);
  }

  get geometryLayersBoxSectionElement() {
    return findChildByID(this.rootHtml, this.geometryLayersBoxSectionId);
  }

  get geometryLayersSpoilerBoxElement() {
    return findChildByID(this.rootHtml, this.geometryLayersSpoilerBoxId);
  }

  get geometryLayerListElement() {
    return findChildByID(this.rootHtml, this.geometryLayersId);
  }
}
