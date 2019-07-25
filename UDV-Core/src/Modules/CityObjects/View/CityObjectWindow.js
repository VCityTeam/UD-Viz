import { Window } from "../../../Utils/GUI/js/Window";
import { CityObjectProvider } from "../ViewModel/CityObjectProvider";
import { CityObjectStyle } from "../../../Utils/3DTiles/Model/CityObjectStyle";
import { CityObjectFilterSelector } from "./CityObjectFilterSelector";
import { CityObjectFilterWindow } from "./CityObjectFilterWindow";
import { CityObjectFieldsFilterSelector } from "./CityObjectFieldsFilterSelector";

import './CityObjectWindow.css';

export class CityObjectWindow extends Window {
  /**
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

    this.filterWindow = new CityObjectFilterWindow();

    this.filterWindow.addEventListener(CityObjectFilterWindow.EVENT_FILTER_SELECTED, (filterLabel) => {
      if (filterLabel) {
        this.provider.setLayer(filterLabel, {materialProps: {color: 0xff2222}});
      } else {
        this.provider.removeLayer();
      }
    });

    this.filterWindow.addFilterSelector(new CityObjectFieldsFilterSelector(this.provider));

    this.provider.addEventListener(CityObjectProvider.EVENT_LAYER_CHANGED, () => {
      let layer = this.provider.getLayer();
      if (!!layer) {
        this.selectedFilterElement.innerText = layer.filter.toString();
        this.selectedStyleElement.innerText = JSON.stringify(layer.style);
      } else {
        this.selectedFilterElement.innerText = '';
        this.selectedStyleElement.innerText = '';
      }
    });

    this.isSelectingCityObject = false;

    this.mouseClickListener = (event) => {
      this.provider.selectCityObject(event);
      this.provider.applyStyles();
    };

    this.provider.addEventListener(CityObjectProvider.EVENT_CITY_OBJECT_SELECTED, (cityObject) => {
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
    });
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

    this.selectFilterButtonElement.onclick = () => {
      this.filterWindow.enable();
    };

    this.applyButtonElement.onclick = () => {
      this.provider.applyStyles();
    };

    this.selectButtonElement.onclick = () => {
      this._toggleCityObjectSelection();
    };

    this.clearSelectionButtonElement.onclick = () => {
      this.selectedCityObjectElement.innerHTML = '';
      this.clearSelectionButtonElement.disabled = true;
      this.provider.unselectCityObject();
      this.provider.applyStyles();
    };

    this.clearSelectionButtonElement.disabled = true;
  }

  /////////////////////
  ///// FILTER SELECTOR

  addFilterSelector(filterSelector) {
    this.filterWindow.addFilterSelector(filterSelector);
  }

  ////////////////////////
  ///// BUILDING SELECTION

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
}