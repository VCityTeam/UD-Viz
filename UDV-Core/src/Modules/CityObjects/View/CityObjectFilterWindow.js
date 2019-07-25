import { Window } from "../../../Utils/GUI/js/Window";
import { CityObjectFilterSelector } from "./CityObjectFilterSelector";

export class CityObjectFilterWindow extends Window {
  constructor() {
    super('cityObjectsFilters', 'City Objects - Filters', true);

    /**
     * 
     * @type {Array<CityObjectFilterSelector>}
     */
    this.filterSelectors = [];

    this.registerEvent(CityObjectFilterWindow.EVENT_FILTER_SELECTED);
  }

  get innerContentHtml() {
    return /*html*/`
      <div class="box-section">
        <h3 class="section-title">Filter selection</h3>
        <form id="${this.filterFormId}">
          <select name="filterLabel" id="${this.filterSelectId}">
          </select>
          <div id="${this.filterSectionId}" class="city-object-filter-section">
          </div>
          <input type="submit" value="Set filter">
        </form>
      </div>
    `;
  }

  windowCreated() {
    this.window.style.left = '290px';
    this.window.style.top = 'unset';
    this.window.style.bottom = '10px';
    this.window.style.width = '270px';
    this.window.style.minHeight = 'unset';

    this._createFilterSelect();

    this.filterSelectElement.oninput = () => this._onFilterSelection();

    this.filterFormElement.onsubmit = () => {
      this._onSubmit();
      return false;
    }
  }

  /**
   * 
   * @param {CityObjectFilterSelector} filterSelector The filter selector to
   * add.
   */
  addFilterSelector(filterSelector) {
    this.filterSelectors.push(filterSelector);
    this._createFilterSelect();
  }

  getFilterSelector(filterLabel) {
    return this.filterSelectors.find((fs) => fs.filterLabel === filterLabel);
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

    for (let filterSelector of this.filterSelectors) {
      let option = document.createElement('option');
      option.label = filterSelector.filterLabel;
      option.innerText = filterSelector.displayName;
      select.appendChild(option);
    }
  }

  _onFilterSelection() {
    this.filterSectionElement.innerHTML = '';
    let selector = this._getCurrentSelector();
    if (!!selector) {
      selector.appendFormFieldsTo(this.filterSectionElement);
    }
  }

  _getCurrentSelector() {
    let selected = this.filterSelectElement.options[this.filterSelectElement.selectedIndex].label;

    if (selected === 'no-filter') {
      return undefined;
    }
    
    let selector = this.getFilterSelector(selected);

    if (selector === undefined) {
      throw 'Cannot find selector with label ' + selected;
    }

    return selector;
  }

  _onSubmit() {
    let selector = this._getCurrentSelector();
    if (selector === undefined) {
      this.sendEvent(CityObjectFilterWindow.EVENT_FILTER_SELECTED, undefined);
      this.disable();
      return;
    }

    let formData = new FormData(this.filterFormElement);
    selector.onSubmit(formData);
    this.sendEvent(CityObjectFilterWindow.EVENT_FILTER_SELECTED, selector.filterLabel);
    this.disable();
  }

  /////////////
  ///// GETTERS

  get filterSelectId() {
    return `${this.windowId}_filters_select`;
  }

  get filterSelectElement() {
    return document.getElementById(this.filterSelectId);
  }

  get filterFormId() {
    return `${this.windowId}_filter_form`;
  }

  get filterFormElement() {
    return document.getElementById(this.filterFormId);
  }

  get filterSectionId() {
    return `${this.windowId}_filter_section`;
  }

  get filterSectionElement() {
    return document.getElementById(this.filterSectionId);
  }

  ////////////
  ///// EVENTS

  static get EVENT_FILTER_SELECTED() {
    return 'EVENT_FILTER_SELECTED';
  }
}