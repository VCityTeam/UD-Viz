import { Window } from "../../../Utils/GUI/js/Window";
import { CityObjectProvider } from "../ViewModel/CityObjectProvider";
import { CityObjectStyle } from "../../../Utils/3DTiles/Model/CityObjectStyle";

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

    this.filterSelectors = [];

    this.provider.addEventListener(CityObjectProvider.EVENT_FILTERS_UPDATED,
      () => this._createFilterSelect());

    this.provider.addFilter('six', (cityObject) => cityObject.tile.tileId == 6);
  }

  get innerContentHtml() {
    return /*html*/`
      <div class="box-section">
        <h3 class="section-title">Layer</h3>
        <div>
          <label for="filter">Filter</label>
          <select name="filter" id="${this.filterSelectId}">
            <option value="default">No filter</option>
          </select>
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
    this._createFilterSelect();

    this.filterSelectElement.oninput = () => {
      let selected = this.filterSelectElement.options[this.filterSelectElement.selectedIndex].label;
      if (selected === 'no-filter') {
        this.provider.removeLayer();
        return;
      }
      this.provider.setLayer(selected, new CityObjectStyle({materialProps: {color: 0xfced7b}}));
    };

    this.applyButtonElement.onclick = () => {
      this.provider.applyStyles();
    };
  }

  _createFilterSelect() {
    if (!this.isCreated) {
      return;
    }

    let select = this.filterSelectElement;

    select.innerHTML = '';

    let defaultOption = document.createElement('option');
    defaultOption.label = 'no-filter';
    defaultOption.innerText = 'No filter';
    select.appendChild(defaultOption);
    for (let label of this.provider.getFilters()) {
      let option = document.createElement('option');
      option.value = label;
      option.innerText = label;
      select.appendChild(option);
    }
  }

  /////////////
  ///// GETTERS

  get filterSelectId() {
    return `${this.windowId}_filters_select`;
  }

  get filterSelectElement() {
    return document.getElementById(this.filterSelectId);
  }

  get applyButtonId() {
    return `${this.windowId}_apply_button`;
  }

  get applyButtonElement() {
    return document.getElementById(this.applyButtonId);
  }
}