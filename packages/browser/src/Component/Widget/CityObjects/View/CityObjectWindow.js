const THREE = require('three');
import { CityObjectProvider } from '../ViewModel/CityObjectProvider';
import { CityObjectFilterSelector } from './CityObjectFilterSelector';
import { CityObjectFilterWindow } from './CityObjectFilterWindow';
import { AttributeFilterSelector } from './AttributeFilterSelector';
import * as itowns from 'itowns';

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
   * @param {itowns.PlanarView} itownsView view.
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
     * @callback cbMouseEvent
     * @param {MouseEvent} event - file reader event
     * @returns {any} Result
     */

    const updateUI = () => {
      if (this.provider.selectedID) {
        this.focusObjectButtonElement.disabled = false;
        this.clearSelectionButtonElement.disabled = false;
      } else {
        this.focusObjectButtonElement.disabled = true;
        this.clearSelectionButtonElement.disabled = true;
      }
      this._updateLayerDescription();
      this._updateSelectedCityObjectDescription();
    };
    updateUI();

    /**
     * The event listener for mouse clicks.
     *
     * @type {cbMouseEvent}
     */
    this.mouseClickListener = (event) => {
      this.provider.selectFromMouseEvent(event);
      updateUI();
    };

    /** @type {HTMLElement|null} */
    this.htmlListened = null;

    // Adding a filter selector for the attribute filter
    this.filterWindow.addFilterSelector(
      new AttributeFilterSelector(this.provider)
    );

    // The event listener for filter selection (in the filter window). Updates
    // the layer in the provider.
    this.filterWindow.addEventListener(
      CityObjectFilterWindow.EVENT_FILTER_SELECTED,
      (filterLabel) => {
        this._onFilterSelected(filterLabel);
        updateUI();
      }
    );

    this.clearFilterButtonElement.onclick = () => {
      this.provider.setCurrentFilterLabel(null);
      updateUI();
    };

    this.clearSelectionButtonElement.onclick = () => {
      this.provider.setSelectedID(null);
      updateUI();
    };

    this.focusObjectButtonElement.onclick = () =>
      this.provider.focusSelection();
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
    if (this.selectedFilterElement) {
      if (this.provider.currentFilterLabel) {
        this.layerColorIndicatorElement.style.display = '';
        this.selectedFilterElement.innerText =
          this.provider.filters[this.provider.currentFilterLabel].toString(); // ouch
        this.layerColorIndicatorElement.style.background =
          '#' +
          new THREE.Color(
            this.provider.layerSelectionStyle.fill.color
          ).getHexString();
      } else {
        this.selectedFilterElement.innerText = '';
        this.layerColorIndicatorElement.style.display = 'none';
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
      this.provider.setCurrentFilterLabel(filterLabel); // this is used as an uid
    } else {
      this.provider.setCurrentFilterLabel(null);
    }
  }

  // //////////////////////
  // /// BUILDING SELECTION

  /**
   * Updates the description for the selected city object.
   *
   */
  _updateSelectedCityObjectDescription() {
    this.selectionColorIndicatorElement.style.background =
      '#' +
      new THREE.Color(this.provider.selectionStyle.fill.color).getHexString();

    if (!this.provider.selectedID) {
      this.selectedCityObjectElement.innerHTML = '';
      this.clearSelectionButtonElement.disabled = true;
      this.focusObjectButtonElement.disabled = true;
    } else {
      let html = /* html*/ `
      <p class="city-object-title">Attributes</p>
      <p class="city-object-value">
        Tile ID : ${this.provider.selectedID.tileID}<br>
        Batch ID : ${this.provider.selectedID.batchID}<br>
        Layer : ${
          this.provider.itownsView.getLayerById(
            this.provider.selectedID.layerID
          ).name
        }
    `;

      // this looks very ugly but need some refacto in itowns to get things done better
      const tileObject3D = this.provider.itownsView
        .getLayerById(this.provider.selectedID.layerID)
        .root.getObjectByProperty('tileId', this.provider.selectedID.tileID);

      // such a pain to find this batchtable should be more easy
      let batchTable = null;
      tileObject3D.traverse((child) => {
        batchTable = child.batchTable || batchTable;
      });

      const info = batchTable.getInfoById(this.provider.selectedID.batchID);

      for (const prop in info) {
        if (prop[0] != 'group' && prop[0] != 'properties') {
          html += `
        <br>${prop[0]} : ${prop[1]}
      `;
        }
      }
      html += '</p>';
      this.selectedCityObjectElement.innerHTML = html;
    }
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
