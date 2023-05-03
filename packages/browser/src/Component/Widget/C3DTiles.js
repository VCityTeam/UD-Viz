import * as itownsWidget from 'itowns/widgets';
import * as itowns from 'itowns';
import { createLabelInput } from '../HTMLUtil';
import * as THREE from 'three';

const DEFAULT_OPTIONS = {
  position: 'top-right', // should be deprecated https://github.com/iTowns/itowns/issues/2005
};

export class C3DTiles extends itownsWidget.Widget {
  /**
   *
   * @param {itowns.View} view - itowns view
   * @param {object} options - options
   * @param {HTMLElement} options.overrideStyle - style applied to 3DTilesLayer add
   * @param {HTMLElement} options.parentElement - parent element of the widget
   * @param {string} options.layerContainerClassName - class name of the layer container div
   * @param {string} options.urlContainerClassName - class name of the layer container div
   * @param {string} options.c3DTFeatureInfoContainerClassName - class name of the c3DTFeatureInfo container div
   */
  constructor(view, options) {
    super(view, options, DEFAULT_OPTIONS);

    // cant click through the widget
    this.domElement.onclick = (event) => event.stopImmediatePropagation();

    // add C3DTilesLayer from url
    const urlObject = createLabelInput('url', 'text');
    if (options.urlContainerClassName)
      urlObject.parent.classList.add(options.urlContainerClassName);
    this.domElement.appendChild(urlObject.parent);

    // name of the 3DTiles requested
    const name3DTilesObject = createLabelInput('name', 'text');
    urlObject.parent.appendChild(name3DTilesObject.parent);

    // request tileset.json button
    const requestButton = document.createElement('button');
    requestButton.innerText = 'Add 3DTiles From URL';
    urlObject.parent.appendChild(requestButton);

    // layers container
    const layersContainer = document.createElement('div');
    layersContainer.innerText = 'Layers:';
    this.domElement.appendChild(layersContainer);

    /**
     *
     * @param {itowns.C3DTilesLayer} layer - layer to add to dom element
     */
    const addLayerToDomElement = (layer) => {
      const layerContainerDomElement = document.createElement('div');
      if (options.layerContainerClassName)
        layerContainerDomElement.classList.add(options.layerContainerClassName);
      layersContainer.appendChild(layerContainerDomElement);

      // visibility checkbox
      const { input, parent } = createLabelInput(layer.name, 'checkbox');
      layerContainerDomElement.appendChild(parent);

      input.checked = layer.visible;
      input.onchange = () => {
        layer.visible = input.checked;
        view.notifyChange();
      };

      // remove button
      const removeButton = document.createElement('button');
      removeButton.innerText = 'Remove';
      layerContainerDomElement.appendChild(removeButton);

      removeButton.onclick = () => {
        view.removeLayer(layer.id, true); // clear cache
        layerContainerDomElement.remove();
      };
    };

    requestButton.onclick = () => {
      // add layer
      const url = urlObject.input.value;

      try {
        const c3DTilesLayer = new itowns.C3DTilesLayer(
          THREE.MathUtils.generateUUID(),
          {
            style: options.overrideStyle || null,
            name: name3DTilesObject.input.value,
            source: new itowns.C3DTilesSource({
              url: url,
            }),
          },
          view
        );
        itowns.View.prototype.addLayer.call(view, c3DTilesLayer);
        addLayerToDomElement(c3DTilesLayer);
      } catch (error) {
        // do not catch error when a wrong url have been entered
        alert(error);
      }
    };

    // initialize with current layer
    view
      .getLayers()
      .filter((el) => el.isC3DTilesLayer)
      .forEach((layer) => {
        addLayerToDomElement(layer);
      });

    /**
     * c3DTfeature display container
     *
     @type {HTMLDivElement} */
    this.c3DTFeatureInfoContainer = document.createElement('div');
    if (options.c3DTFeatureInfoContainerClassName)
      this.c3DTFeatureInfoContainer.classList.add(
        options.c3DTFeatureInfoContainerClassName
      );

    this.c3DTFeatureInfoContainer.hidden = true; // hidden by default
    this.domElement.appendChild(this.c3DTFeatureInfoContainer);
  }

  /**
   *
   * @param {itowns.C3DTFeature|null} c3DTFeature - feature to display info if null nothing is display
   * @param {itowns.C3DTilesLayer|null} layer - layer of the feature
   * @param {number} [stepPadding=20] - number of pixels to pad left each indent of the info object displayed
   */
  displayC3DTFeatureInfo(c3DTFeature = null, layer = null, stepPadding = 20) {
    // clear
    while (this.c3DTFeatureInfoContainer.firstChild)
      this.c3DTFeatureInfoContainer.firstChild.remove();

    this.c3DTFeatureInfoContainer.hidden = !c3DTFeature;

    if (!c3DTFeature) return;

    const createObjectDomElement = (object, label, indent = 0) => {
      const result = document.createElement('div');

      const labelDomElement = document.createElement('div');
      labelDomElement.innerText = label;
      labelDomElement.style.paddingLeft = indent * stepPadding + 'px';
      result.appendChild(labelDomElement);

      if (!object) return result;

      for (const key in object) {
        const value = object[key];
        if (value instanceof Object) {
          result.appendChild(createObjectDomElement(value, key, indent + 1));
        } else {
          const content = document.createElement('div');
          content.innerText = key + ': ' + value;
          content.style.paddingLeft = (indent + 1) * stepPadding + 'px';
          result.appendChild(content);
        }
      }

      return result;
    };

    // label layer
    const labelLayerDomElement = document.createElement('div');
    labelLayerDomElement.innerText = layer.name;
    this.c3DTFeatureInfoContainer.appendChild(labelLayerDomElement);

    // feature info
    this.c3DTFeatureInfoContainer.appendChild(
      createObjectDomElement(c3DTFeature.getInfo(), 'Feature info')
    );
  }
}
