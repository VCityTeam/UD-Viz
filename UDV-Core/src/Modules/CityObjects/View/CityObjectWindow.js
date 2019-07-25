import { Window } from "../../../Utils/GUI/js/Window";
import { CityObjectProvider } from "../ViewModel/CityObjectProvider";
import { CityObjectStyle } from "../../../Utils/3DTiles/Model/CityObjectStyle";
import { CityObjectFilterSelector } from "./CityObjectFilterSelector";
import { CityObjectFilterWindow } from "./CityObjectFilterWindow";
import { AttributeFilterSelector } from "./AttributeFilterSelector";

import './CityObjectWindow.css';

/**
 * The main window of the city object module. It displays a short description
 * for the currently highlighted layer (filter and style), as well as the
 * selected city object.
 */
export class CityObjectWindow extends Window {
  /**
   * Constructs the window from the provider.
   * 
   * @param {CityObjectProvider} provider The city object provider.
   */
  constructor(provider) {
    super('cityObjects', 'City Objects', false);

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

    /**
     * The style for the layer chosen by the user, through the filter window.
     * 
     * @type {CityObjectStyle | string}
     */
    this.defaultLayerStyle = {materialProps: {color: 0xffa14f}};

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
     * The event listener for mouse clicks.
     * 
     * @type {(event: MouseEvent) => any}
     */
    this.mouseClickListener = (event) => {
      this.provider.selectCityObject(event);
      this.provider.applyStyles();
    };

    // Adding a filter selector for the attribute filter
    this.filterWindow.addFilterSelector(new AttributeFilterSelector(this.provider));

    // The event listener for filter selection (in the filter window). Updates
    // the layer in the provider.
    this.filterWindow.addEventListener(
      CityObjectFilterWindow.EVENT_FILTER_SELECTED,
      (filterLabel) => this._onFilterSelected(filterLabel));
    
    // The event listener for the layer change. Updates the layer description.
    this.provider.addEventListener(CityObjectProvider.EVENT_LAYER_CHANGED,
      () => this._updateLayerDescription());

    // Event listener for city object selection
    this.provider.addEventListener(CityObjectProvider.EVENT_CITY_OBJECT_SELECTED,
      (cityObject) => this._updateSelectedCityObjectDescription(cityObject));
  }

  get innerContentHtml() {
    return /*html*/`
      <div class="box-section">
        <h3 class="section-title">Layer</h3>
        <div>
          <p class="city-object-title">Filter <button id="${this.selectFilterButtonId}">Select</button></p>
          <p class="city-object-value" id="${this.selectedFilterId}"></p>
          <p class="city-object-title">Style</p>
          <p class="city-object-value" id="${this.selectedStyleId}"></p>
          <button id="${this.applyButtonId}">Apply styles</button>
        </div>
      </div>
      <div class="box-section">
        <h3 class="section-title">Selection</h3>
        <div id="${this.selectedCityObjectId}">

        </div>
        <div id="${this.extensionId}">

        </div>
        <hr>
        <button id="${this.selectButtonId}">Select city object</button>
        <button id="${this.clearSelectionButtonId}">Clear selection</button>
      </div>
    `;
  }

  windowCreated() {
    this.window.style.left = '10px';
    this.window.style.top = 'unset';
    this.window.style.bottom = '10px';
    this.window.style.width = '270px';

    this.filterWindow.appendTo(this.parentElement);
    this.filterWindow.disable();

    // Add extensions
    for (let extension of Object.values(this.extensions)) {
      this._createExtensionElement(extension);
    }

    this.selectFilterButtonElement.onclick =
      () => this.filterWindow.enable();

    this.applyButtonElement.onclick =
      () => this.provider.applyStyles();

    this.selectButtonElement.onclick =
      () => this._toggleCityObjectSelection();

    this.clearSelectionButtonElement.onclick =
      () => this._clearCityObjectSelection();

    this.clearSelectionButtonElement.disabled = true;
  }

  ///////////////////////
  ///// LAYER DESCRIPTION

  /**
   * Updates the layer description (filter and style).
   */
  _updateLayerDescription() {
    let layer = this.provider.getLayer();
    if (!!layer) {
      this.selectedFilterElement.innerText = layer.filter.toString();
      this.selectedStyleElement.innerText = JSON.stringify(layer.style);
    } else {
      this.selectedFilterElement.innerText = '';
      this.selectedStyleElement.innerText = '';
    }
  }

  /////////////////////
  ///// FILTER SELECTOR

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
    if (!!filterLabel) {
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

  ////////////////////////
  ///// BUILDING SELECTION

  /**
   * Toggles the city object selection.
   */
  _toggleCityObjectSelection() {
    this.isSelectingCityObject = !this.isSelectingCityObject;
    if (this.isSelectingCityObject) {
      this.selectButtonElement.innerText = 'Finish selection';
      window.addEventListener('mousedown', this.mouseClickListener);
    } else {
      this.selectButtonElement.innerText = 'Select city object';
      window.removeEventListener('mousedown', this.mouseClickListener);
    }
  }

  /**
   * Clears the selected city object.
   */
  _clearCityObjectSelection() {
    this.selectedCityObjectElement.innerHTML = '';
    this.clearSelectionButtonElement.disabled = true;
    this.provider.unselectCityObject();
    this.provider.applyStyles();
  }

  /**
   * Updates the description for the selected city object.
   * 
   * @param {CityObject} cityObject The selected city object.
   */
  _updateSelectedCityObjectDescription(cityObject) {
    if (!cityObject) {
      return;
    }

    this.clearSelectionButtonElement.disabled = false;

    this.selectedCityObjectElement.innerHTML = /*html*/`
      <p class="city-object-title">Tile ID</p>
      <p class="city-object-value">${cityObject.tile.tileId}</p>
      <p class="city-object-title">Batch ID</p>
      <p class="city-object-value">${cityObject.batchId}</p>
    `;
    for (let prop of Object.entries(cityObject.props)) {
      this.selectedCityObjectElement.innerHTML += /*html*/`
      <p class="city-object-title">${prop[0]}</p>
      <p class="city-object-value">${prop[1]}</p>
      `;
    }
  }

  ////////////////
  ///// EXTENSIONS

  /**
   * Creates a new extension for the city object window. An extension is 
   * a piece of HTML identified by a label.
   * 
   * @param {string} label The extension label.
   * @param {object} options The extension options.
   * @param {string} options.html The inside HTML of the
   * extension.
   */
  addExtension(label, options) {
    if (!!this.extensions[label]) {
      throw 'Extension already exists : ' + label;
    }
    options.label = label;
    options.id = label.replace(/ +/, ' ').toLowerCase();
    this.extensions[label] = options;

    if (this.isCreated) {
      this._createExtensionElement(options);
    }
  }

  /**
   * Removes an existing extension.
   * 
   * @param {string} label The extension label.
   */
  removeExtension(label) {
    let extension = this.extensions[label];
    if (!extension) {
      throw 'Extension does not exist : ' + label;
    }

    let element = document.getElementById(extension.id);
    if (element) {
      element.parentElement.removeChild(element);
    }
    delete this.extensions[label];
  }

  /**
   * Proceeds to create an extension.
   * 
   * @private
   * 
   * @param {object} extension 
   * @param {string} extension.id The id of the element.
   * @param {string} extension.label The label of the extension.
   * @param {string} extension.html The inside HTML of the
   * extension.
   */
  _createExtensionElement(extension) {
    let panel = document.createElement('div');
    panel.id = extension.id;
    panel.innerHTML = extension.html;
    let container = this.extensionElement;
    container.appendChild(panel);
  }

  /////////////
  ///// GETTERS

  get applyButtonId() {
    return `${this.windowId}_apply_button`;
  }

  get applyButtonElement() {
    return document.getElementById(this.applyButtonId);
  }

  get selectFilterButtonId() {
    return `${this.windowId}_filter_button`;
  }

  get selectFilterButtonElement() {
    return document.getElementById(this.selectFilterButtonId);
  }

  get selectedFilterId() {
    return `${this.windowId}_selected_filter`;
  }

  get selectedFilterElement() {
    return document.getElementById(this.selectedFilterId);
  }

  get selectedStyleId() {
    return `${this.windowId}_selected_style`;
  }

  get selectedStyleElement() {
    return document.getElementById(this.selectedStyleId);
  }

  get selectButtonId() {
    return `${this.windowId}_co_select_button`;
  }

  get selectButtonElement() {
    return document.getElementById(this.selectButtonId);
  }

  get selectedCityObjectId() {
    return `${this.windowId}_co_selected_paragraph`;
  }

  get selectedCityObjectElement() {
    return document.getElementById(this.selectedCityObjectId);
  }

  get clearSelectionButtonId() {
    return `${this.windowId}_co_clear_selection_button`;
  }

  get clearSelectionButtonElement() {
    return document.getElementById(this.clearSelectionButtonId);
  }

  get extensionId() {
    return `${this.windowId}_extension`;
  }

  get extensionElement() {
    return document.getElementById(this.extensionId);
  }
}