const THREE = require('three');

import { CityObjectStyle } from '../../../Itowns/3DTiles/Model/CityObjectStyle';

import { CityObjectProvider } from '../ViewModel/CityObjectProvider';
import { CityObjectFilterSelector } from './CityObjectFilterSelector';
import { CityObjectFilterWindow } from './CityObjectFilterWindow';
import { AttributeFilterSelector } from './AttributeFilterSelector';

import { findChildByID } from '../../../HTMLUtil';

import './CityObjectWindow.css';

/**
 * The main window of the city object module. It displays a short description
 * for the currently highlighted layer (filter and style), as well as the
 * selected city object.
 */
export class CityObjectWindow {
  /**
   * Constructs the window from the provider.
   *
   * @param {CityObjectProvider} provider The city object provider.
   */
  constructor(provider) {
    /** @type {HTMLElement} */
    this.rootHtml = document.createElement('div');
    this.rootHtml.innerHTML = this.innerContentHtml;

    /**
     * The city object provider.
     *
     * @type {CityObjectProvider}
     */
    this.provider = provider;

    /**
     * The window for selected filters.
     *
     * @type {CityObjectFilterWindow}
     */
    this.filterWindow = new CityObjectFilterWindow();
    this.rootHtml.appendChild(this.filterWindow.html());

    /**
     * The style for the layer chosen by the user, through the filter window.
     *
     * @type {CityObjectStyle | string}
     */
    this.defaultLayerStyle = { materialProps: { color: 0xffa14f } };

    /**
     * Wether the use is currently selecting a city object.
     *
     * @type {boolean}
     */
    this.isSelectingCityObject = false;

    /**
     * The list of extensions
     *
     * @type {Array<{html: string, label: string, id: string}>}
     */
    this.extensions = [];

    /**
     * @callback cbMouseEvent
     * @param {MouseEvent} event - file reader event
     * @returns {any} Result
     */
    /**
     * The event listener for mouse clicks.
     *
     * @type {cbMouseEvent}
     */
    this.mouseClickListener = (event) => {
      this.provider.selectCityObject(event);
      this.provider.applyStyles();
    };
    this.htmlListened = null;

    // Adding a filter selector for the attribute filter
    this.filterWindow.addFilterSelector(
      new AttributeFilterSelector(this.provider)
    );

    // The event listener for filter selection (in the filter window). Updates
    // the layer in the provider.
    this.filterWindow.addEventListener(
      CityObjectFilterWindow.EVENT_FILTER_SELECTED,
      (filterLabel) => this._onFilterSelected(filterLabel)
    );
    // The event listener for the layer change. Updates the layer description.
    this.provider.addEventListener(CityObjectProvider.EVENT_LAYER_CHANGED, () =>
      this._updateLayerDescription()
    );

    // Event listener for city object selection
    this.provider.addEventListener(
      CityObjectProvider.EVENT_CITY_OBJECT_SELECTED,
      (cityObject) => this._updateSelectedCityObjectDescription(cityObject)
    );

    this._updateLayerDescription();
    this._updateSelectedCityObjectDescription();

    // Add extensions
    for (const extension of Object.values(this.extensions)) {
      this._createExtensionElement(extension);
    }

    this.clearFilterButtonElement.onclick = () => this.provider.removeLayer();

    this.clearSelectionButtonElement.onclick = () =>
      this._clearCityObjectSelection();

    this.clearSelectionButtonElement.disabled = true;

    this.focusObjectButtonElement.onclick = () => this.provider.focusOnObject();

    this.focusObjectButtonElement.disabled = true;
  }

  addListenerTo(div) {
    this.removeListener();
    div.addEventListener('mousedown', this.mouseClickListener);
    this.htmlListened = div;
  }

  removeListener() {
    if (this.htmlListened)
      this.htmlListened.removeEventListener(
        'mousedown',
        this.mouseClickListener
      );
  }

  html() {
    return this.rootHtml;
  }

  dispose() {
    this.rootHtml.remove();

    this.provider.removeLayer();
    this.provider.unselectCityObject();

    this.removeListener();
  }

  get innerContentHtml() {
    return /* html*/ `
      <div class="box-section" id="${this.filterDivId}">
        <h3 class="section-title">Filter<span class="color-indicator" id="${this.layerColorIndicatorId}"></span></h3>
        <div>
          <p class="city-object-title">
            <button id="${this.clearFilterButtonId}">Clear</button>
          </p>
          <p class="city-object-value" id="${this.selectedFilterId}"></p>
        </div>
      </div>
      <div class="box-section">
        <h3 class="section-title">Selection<span class="color-indicator" id="${this.selectionColorIndicatorId}"></span>
          <button id="${this.focusObjectButtonId}">Focus</button>
        </h3>
        <div id="${this.selectedCityObjectId}">

        </div>
        <div data-ext-container-default="div">

        </div>
        <hr>
        <div data-ext-container-default="button">
          <button id="${this.clearSelectionButtonId}">Clear selection</button>
        </div>
      </div>
    `;
  }

  // /////////////////////
  // /// LAYER DESCRIPTION

  /**
   * Updates the layer description (filter and style).
   */
  _updateLayerDescription() {
    if (this.isCreated) {
      const layer = this.provider.getLayer();
      if (this.selectedFilterElement) {
        if (layer) {
          this.layerColorIndicatorElement.style.display = '';
          this.selectedFilterElement.innerText = layer.filter.toString();
          this.layerColorIndicatorElement.style.background =
            '#' +
            new THREE.Color(layer.style.materialProps.color).getHexString();
        } else {
          this.selectedFilterElement.innerText = '';
          this.layerColorIndicatorElement.style.display = 'none';
        }
      }
    }
  }

  // ///////////////////
  // /// FILTER SELECTOR

  /**
   * Adds a filter selector in the city object filter window.
   *
   * @param {CityObjectFilterSelector} filterSelector The filter selector to
   * add.
   */
  addFilterSelector(filterSelector) {
    this.filterWindow.addFilterSelector(filterSelector);
  }

  /**
   * Triggered when the user selects a filter in the filter selection window.
   * Sets the correct layer in the provider.
   *
   * @param {string} filterLabel The selected filter label.
   */
  _onFilterSelected(filterLabel) {
    if (filterLabel) {
      this.provider.setLayer(filterLabel, this.defaultLayerStyle);
    } else {
      this.provider.removeLayer();
    }
  }

  /**
   * Sets the default style for the layer defined by the user (through the
   * filter selection window).
   *
   * @param {CityObjectStyle | string} style The default style for the layer.
   */
  setDefaultLayerStyle(style) {
    this.defaultLayerStyle = style;
  }

  // //////////////////////
  // /// BUILDING SELECTION

  /**
   * Clears the selected city object.
   */
  _clearCityObjectSelection() {
    this.provider.unselectCityObject();
    this.provider.applyStyles();
    this._updateSelectedCityObjectDescription();
  }

  /**
   * Updates the description for the selected city object.
   *
   * @param {import("../../../Itowns/3DTiles/Model/CityObject").CityObject} cityObject The selected city object.
   */
  _updateSelectedCityObjectDescription(cityObject) {
    this.selectionColorIndicatorElement.style.background =
      '#' +
      new THREE.Color(
        this.provider.defaultSelectionStyle.materialProps.color
      ).getHexString();

    if (!cityObject) {
      this.selectedCityObjectElement.innerHTML = '';
      this.clearSelectionButtonElement.disabled = true;
      this.focusObjectButtonElement.disabled = true;
      return;
    }

    this.clearSelectionButtonElement.disabled = false;
    this.focusObjectButtonElement.disabled = false;

    let html = /* html*/ `
      <p class="city-object-title">Attributes</p>
      <p class="city-object-value">
        Tile ID : ${cityObject.tile.tileId}<br>
        Batch ID : ${cityObject.batchId}<br>
        Layer : ${cityObject.tile.layer.name}
    `;
    for (const prop of Object.entries(cityObject.props)) {
      if (prop[0] != 'group' && prop[0] != 'properties') {
        html += `
        <br>${prop[0]} : ${prop[1]}
      `;
      }
    }
    html += '</p>';
    this.selectedCityObjectElement.innerHTML = html;
  }

  // ///////////
  // /// GETTERS

  get selectedFilterId() {
    return `city_object_main_selected_filter`;
  }

  get selectedFilterElement() {
    return findChildByID(this.rootHtml, this.selectedFilterId);
  }

  get focusObjectButtonId() {
    return `city_object_main_focus_object`;
  }

  get focusObjectButtonElement() {
    return findChildByID(this.rootHtml, this.focusObjectButtonId);
  }

  get clearFilterButtonId() {
    return `city_object_main_co_clear_filter_button`;
  }

  get clearFilterButtonElement() {
    return findChildByID(this.rootHtml, this.clearFilterButtonId);
  }

  get selectedCityObjectId() {
    return `city_object_main_co_selected_paragraph`;
  }

  get selectedCityObjectElement() {
    return findChildByID(this.rootHtml, this.selectedCityObjectId);
  }

  get clearSelectionButtonId() {
    return `city_object_main_co_clear_selection_button`;
  }

  get clearSelectionButtonElement() {
    return findChildByID(this.rootHtml, this.clearSelectionButtonId);
  }

  get layerColorIndicatorId() {
    return `city_object_main_layer_color_indicator`;
  }

  get layerColorIndicatorElement() {
    return findChildByID(this.rootHtml, this.layerColorIndicatorId);
  }

  get selectionColorIndicatorId() {
    return `city_object_main_selection_color_indicator`;
  }

  get selectionColorIndicatorElement() {
    return findChildByID(this.rootHtml, this.selectionColorIndicatorId);
  }

  get filterDivId() {
    return `city_object_main_filter_div`;
  }

  get filterDivElement() {
    return findChildByID(this.rootHtml, this.filterDivId);
  }
}
