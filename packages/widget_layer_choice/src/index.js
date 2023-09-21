import * as itowns from 'itowns';
import {
  focusC3DTilesLayer,
  createDisplayable,
  createLabelInput,
} from '@ud-viz/utils_browser';

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
      item.innerText = layers[i].id;

      const visibilityLayer = createLabelInput('Visible', 'checkbox');
      visibilityLayer.input.checked = layers[i].visible;
      item.appendChild(visibilityLayer.parent);

      visibilityLayer.input.oninput = () => {
        layers[i].visible = visibilityLayer.input.checked;
        this.itownView.notifyChange();
      };

      const opacityLayer = createLabelInput('Opacity', 'range');
      opacityLayer.input.min = 0;
      opacityLayer.input.max = 1;
      opacityLayer.input.step = 0.1;
      opacityLayer.input.value = layers[i].opacity;
      item.appendChild(opacityLayer.parent);

      opacityLayer.input.oninput = () => {
        layers[i].opacity = opacityLayer.input.value;
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
      const scale = createLabelInput('Scale', 'range');
      scale.input.min = 0;
      scale.input.max = 2.5;
      scale.input.step = 0.1;

      scale.input.value = layers[i].scale;

      scale.input.oninput = () => {
        layers[i].scale = scale.input.value;
        this.itownView.notifyChange();
      };

      list.appendChild(scale.parent);
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
