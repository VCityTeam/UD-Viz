import { createDisplayable, findChildByID } from '../../../HTMLUtil';
import * as itowns from 'itowns';
import { focusC3DTilesLayer } from '../../../ItownsUtil';

export class LayerChoice {
  /**
   *
   * @param {itowns.PlanarView} itownView - itowns view
   */
  constructor(itownView) {
    /** @type {HTMLElement} */
    this.domElement = null;

    /** @type {HTMLElement} */
    this.colorLayersSpoilerBoxElement = null;

    /** @type {HTMLElement} */
    this.elevationLayersSpoilerBoxElement = null;

    /** @type {HTMLElement} */
    this.geometryLayersSpoilerBoxElement = null;

    /** @type {itowns.PlanarView} */
    this.itownView = itownView;

    this.initHtml();
  }

  initHtml() {
    this.domElement = document.createElement('div');
    {
      // color
      const displayableColor = createDisplayable('Color Layers');
      this.domElement.appendChild(displayableColor.parent);
      this.colorLayersSpoilerBoxElement = displayableColor.container;

      // elevation
      const displayableElevation = createDisplayable('Elevation Layer');
      this.domElement.appendChild(displayableElevation.parent);
      this.elevationLayersSpoilerBoxElement = displayableElevation.container;

      // geometry
      const displayableGeometry = createDisplayable('Geometry Layers');
      this.domElement.appendChild(displayableGeometry.parent);
      this.geometryLayersSpoilerBoxElement = displayableGeometry.container;
    }

    this.innerContentColorLayers();
    this.innerContentElevationLayers();
    this.innerContentGeometryLayers();
  }

  /**
   * Create the description part of ColorLayers
   */
  innerContentColorLayers() {
    const list = this.colorLayersSpoilerBoxElement;
    list.innerHTML = '';
    const layers = this.itownView
      .getLayers()
      .filter((el) => el.isColorLayer == true);
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
          layers[i].opacity = event.srcElement.valueAsNumber;
        }
        const span_opacity = findChildByID(item, 'color_value_opacity_' + i);
        span_opacity.innerHTML = `${layers[i].opacity}`;
        this.itownView.notifyChange();
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
    const layers = this.itownView
      .getLayers()
      .filter((el) => el.isElevationLayer == true);
    for (let i = 0; i < layers.length; i++) {
      const item = document.createElement('div');
      item.innerHTML = `<h3>${layers[i].id}</h3>
                        Scale : <span id="elevation_value_scale_${i}">${layers[i].scale}</span> <input type ="range" id="${i}" min="1" max="10" step = "0.01" value="${layers[i].scale}"></input>`;

      item.oninput = (event) => {
        layers[i].scale = event.srcElement.valueAsNumber;
        this.itownView.notifyChange();
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
    const layers = this.itownView
      .getLayers()
      .filter((el) => el.isGeometryLayer == true);

    const div = document.createElement('div');

    const isOneLayerVisible = () => {
      const allLayers = this.itownView.getLayers();
      for (let index = 0; index < allLayers.length; index++) {
        const element = allLayers[index];
        if (element.visible) return true;
      }
      return false;
    };

    div.innerHTML = `
      All Visible <input type="checkbox" id="checkbox" ${
        isOneLayerVisible() ? 'checked' : ''
      }></input></br>
  `;
    div.onchange = (event) => {
      layers.forEach((layer) => {
        layer.visible = event.srcElement.checked;
      });
      this.itownView.notifyChange();
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
        this.itownView.notifyChange();
      };

      itemDivVisibility.appendChild(itemCheckboxVisibility);
      item.appendChild(itemDivVisibility);

      if (layers[i].isC3DTilesLayer) {
        const itemButton = document.createElement('button');
        itemButton.id = 'button_' + layers[i].id;
        itemButton.innerText = 'Focus';

        itemButton.onclick = () => {
          focusC3DTilesLayer(this.itownView, layers[i]);
        };
        item.appendChild(itemButton);
      }
      const itemDivOpacity = document.createElement('div');
      itemDivOpacity.id = 'opacity_' + layers[i].id;

      const itemRangeOpacity = document.createElement('input');
      itemRangeOpacity.setAttribute('type', 'range');
      itemRangeOpacity.min = 0;
      itemRangeOpacity.max = 1;
      itemRangeOpacity.step = 0.1;
      itemRangeOpacity.value = layers[i].opacity;

      itemRangeOpacity.onchange = () => {
        layers[i].opacity = itemRangeOpacity.valueAsNumber;
        this.itownView.notifyChange();
      };

      itemDivOpacity.appendChild(itemRangeOpacity);

      const itemSpanOpacity = document.createElement('span');
      itemSpanOpacity.innerText = ' Opacity';
      itemDivOpacity.appendChild(itemSpanOpacity);
      item.appendChild(itemDivOpacity);

      list.appendChild(item);
    }
  }
}
