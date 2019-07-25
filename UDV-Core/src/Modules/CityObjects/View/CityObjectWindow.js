import { Window } from "../../../Utils/GUI/js/Window";
import { CityObjectProvider } from "../ViewModel/CityObjectProvider";
import { CityObjectStyle } from "../../../Utils/3DTiles/Model/CityObjectStyle";
import { CityObjectFilterSelector } from "./CityObjectFilterSelector";
import { CityObjectFilterWindow } from "./CityObjectFilterWindow";
import { CityObjectFieldsFilterSelector } from "./CityObjectFieldsFilterSelector";

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

    this.provider.addEventListener(CityObjectProvider.EVENT_LAYER_CHANGED, (filterLabel) => {
      if (!!filterLabel) {
        let selector = this.filterWindow.getFilterSelector(filterLabel);
        this.selectedFilterElement.innerText = selector.toString();
      } else {
        this.selectedFilterElement.innerText = '';
      }
    });
  }

  get innerContentHtml() {
    return /*html*/`
      <div class="box-section">
        <h3 class="section-title">Layer</h3>
        <div>
          <p>Filter <button id="${this.selectFilterButtonId}">Select</button></p>
          <p id="${this.selectedFilterId}"></p>
          <p>Style</p>
          <p></p>
          <button id="${this.applyButtonId}">Apply styles</button>
        </div>
      </div>
      <div class="box-section">
        <h3 class="section-title">Selection</h3>
        <div>

        </div>
      </div>
    `;
  }

  windowCreated() {
    this.filterWindow.appendTo(this.parentElement);
    this.filterWindow.disable();

    this.selectFilterButtonElement.onclick = () => {
      this.filterWindow.enable();
    };

    this.applyButtonElement.onclick = () => {
      this.provider.applyStyles();
    };
  }

  /////////////////////
  ///// FILTER SELECTOR

  addFilterSelector(filterSelector) {
    this.filterWindow.addFilterSelector(filterSelector);
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
}