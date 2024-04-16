import * as itownsWidget from 'itowns/widgets';
import * as itowns from 'itowns';
import { createLabelInput } from '@ud-viz/utils_browser';
import * as THREE from 'three';

const DEFAULT_OPTIONS = {
  position: 'top-right', // should be deprecated https://github.com/iTowns/itowns/issues/2005
};

/**
 * Within a list of already existing layers, add a UI entry for a newly
 * appended layer (together with a button for its removal).
 *
 * @param {itowns.View} view - The view to which the layer will be added
 * @param {itowns.C3DTilesLayer} layer - layer to be added to dom element
 * @param {HTMLDivElement} layersContainer - HTML division holding the listed layers
 * @param {string} [layerContainerClassName] - Class name of the layer container
 */
function addLayerToDomElement(
  view,
  layer,
  layersContainer,
  layerContainerClassName
) {
  const layerContainerDomElement = document.createElement('div');
  if (layerContainerClassName)
    layerContainerDomElement.classList.add(layerContainerClassName);
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
}

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
   * @param {boolean} options.displayExistingLayers - whether the existing layers should be listed in the UI or not (default is True)
   */
  constructor(view, options = {}) {
    super(view, options, DEFAULT_OPTIONS);
    // Available layers are optionnaly listed in the UI. Inhibiting this display
    // allows for an alternative usage of other widgets with a similar purpose
    // but different feature e.g. @ud-viz/widget_layer_choice.
    if (options.displayExistingLayers == undefined) {
      options.displayExistingLayers = true;
    }

    /** @type {THREE.Box3Helper} */
    this.displayedBBFeature = new THREE.Box3Helper(new THREE.Box3());
    this.displayedBBFeature.visible = false;
    view.scene.add(this.displayedBBFeature);

    // Inhibit click selection "through" the widget
    this.domElement.onclick = (event) => event.stopImmediatePropagation();

    // Display a UI section allowing the addition of a C3DTilesLayer out of
    // an url and a (local) tagname.
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
        if (options.displayExistingLayers)
          addLayerToDomElement(
            view,
            c3DTilesLayer,
            this.layersContainer,
            options.layerContainerClassName
          );
      } catch (error) {
        // do not catch error when a wrong url have been entered
        alert(error);
      }
    };

    if (options.displayExistingLayers) {
      this.layersContainer = document.createElement('div');
      this.layersContainer.innerText = 'Layers:';
      this.domElement.appendChild(this.layersContainer);

      // Initialize the list of existing layer
      view
        .getLayers()
        .filter((el) => el.isC3DTilesLayer)
        .forEach((layer) => {
          addLayerToDomElement(
            view,
            layer,
            this.layersContainer,
            options.layerContainerClassName
          );
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
    } // if (options.displayExistingLayers)
  } // Constructor()

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

    this.displayedBBFeature.visible = !!c3DTFeature;
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

    c3DTFeature.computeWorldBox3(this.displayedBBFeature.box);
    this.displayedBBFeature.updateMatrixWorld();

    // feature info
    this.c3DTFeatureInfoContainer.appendChild(
      createObjectDomElement(
        {
          info: c3DTFeature.getInfo(),
          boundingBox: this.displayedBBFeature.box,
        },
        'Feature'
      )
    );
  }
}
