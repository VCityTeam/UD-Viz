import { CityObjectFilterSelector } from './CityObjectFilterSelector';
import { EventSender } from '@ud-viz/shared';
import { findChildByID } from '../../../HTMLUtil';

/**
 * The filter selection window. This window allows the user to pick a filter
 * through the list of `FilterSelector`s. A filter selector is associated with
 * a filter and can offer some parameters through a form.
 */
export class CityObjectFilterWindow extends EventSender {
  /**
   * Creates a city object filter window.
   */
  constructor() {
    super();

    /** @type {HTMLElement} */
    this.rootHtml = document.createElement('div');
    this.rootHtml.innerHTML = this.innerContentHtml;

    /**
     * The list of filter selectors.
     *
     * @type {Array<CityObjectFilterSelector>}
     */
    this.filterSelectors = [];

    // Event registration
    this.registerEvent(CityObjectFilterWindow.EVENT_FILTER_SELECTED);

    // callbacks
    this._createFilterSelect();

    this.filterSelectElement.oninput = () => this._onFilterSelection();

    this.filterFormElement.onsubmit = () => {
      this._onSubmit();
      return false;
    };
  }

  html() {
    return this.rootHtml;
  }

  dispose() {
    this.rootHtml.remove();
  }

  get innerContentHtml() {
    return /* html*/ `
      <div class="box-section">
        <h3 class="section-title">Layer filter selection</h3>
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

  /**
   * Adds a filter selector in the filter selectos list.
   *
   * @param {CityObjectFilterSelector} filterSelector The filter selector to
   * add.
   */
  addFilterSelector(filterSelector) {
    if (this.getFilterSelector(filterSelector.filterLabel)) {
      throw (
        'A filter selector with the same filter label already exist: ' +
        filterSelector.filterLabel
      );
    }
    this.filterSelectors.push(filterSelector);
    this._createFilterSelect();
  }

  /**
   * Returns the filter selector corresponding to the given filter label.
   *
   * @param {string} filterLabel The label of the filter.
   * @returns {CityObjectFilterSelector} The filter selector with the correspondig label
   */
  getFilterSelector(filterLabel) {
    return this.filterSelectors.find((fs) => fs.filterLabel === filterLabel);
  }

  /**
   * Fills the HTML select element with an option for each filter selector.
   * Also adds a 'No filter' option.
   */
  _createFilterSelect() {
    const select = this.filterSelectElement;

    select.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.label = 'no-filter';
    defaultOption.innerText = 'No filter';
    select.appendChild(defaultOption);

    for (const filterSelector of this.filterSelectors) {
      const option = document.createElement('option');
      option.label = filterSelector.filterLabel;
      option.innerText = filterSelector.displayName;
      select.appendChild(option);
    }
  }

  /**
   * Triggered when the users selects a filter in the dropdown list. It
   * displays the corresponding form fields (if any) after the select input.
   */
  _onFilterSelection() {
    this.filterSectionElement.innerHTML = '';
    const selector = this._getCurrentSelector();
    if (selector) {
      selector.appendFormFieldsTo(this.filterSectionElement);
    }
  }

  /**
   * Returns the current filter selector, or `undefined` if the user has
   * selected the 'No filter' option.
   *
   * @returns {CityObjectFilterSelector} The current filter selector
   */
  _getCurrentSelector() {
    const selected =
      this.filterSelectElement.options[this.filterSelectElement.selectedIndex]
        .label;

    if (selected === 'no-filter') {
      return undefined;
    }

    const selector = this.getFilterSelector(selected);

    if (selector === undefined) {
      throw 'Cannot find selector with label ' + selected;
    }

    return selector;
  }

  /**
   * Triggers when the form is submitted. The `EVENT_FILTER_SELECTED` event is
   * sent and the window closes.
   */
  _onSubmit() {
    const selector = this._getCurrentSelector();
    if (selector === undefined) {
      this.sendEvent(CityObjectFilterWindow.EVENT_FILTER_SELECTED, undefined);

      return;
    }

    const formData = new FormData(this.filterFormElement);
    selector.onSubmit(formData);
    this.sendEvent(
      CityObjectFilterWindow.EVENT_FILTER_SELECTED,
      selector.filterLabel
    );
  }

  // ///////////
  // /// GETTERS

  get filterSelectId() {
    return `city_object_filter_filters_select`;
  }

  get filterSelectElement() {
    return findChildByID(this.rootHtml, this.filterSelectId);
  }

  get filterFormId() {
    return `city_object_filter_filter_form`;
  }

  get filterFormElement() {
    return findChildByID(this.rootHtml, this.filterFormId);
  }

  get filterSectionId() {
    return `city_object_filter_filter_section`;
  }

  get filterSectionElement() {
    return findChildByID(this.rootHtml, this.filterSectionId);
  }

  // //////////
  // /// EVENTS

  static get EVENT_FILTER_SELECTED() {
    return 'EVENT_FILTER_SELECTED';
  }
}
