import { EventSender } from "../../../Utils/Events/EventSender";

export class CityObjectFilterSelector extends EventSender {
  constructor() {
    /**
     * The label of the corresponding filter.
     * 
     * @type {string}
     */
    this.filterLabel;

    /**
     * The displayed name of the filter.
     * 
     * @type {string}
     */
    this.displayName;

    /**
     * The parameter fields for the filter.
     * 
     * @type {Array<{label: string, name: string, type: string}>}
     */
    this.fields = [];

    this.registerEvent(CityObjectFilterSelector.EVENT_FIELDS_UPDATED);
  }

  /**
   * 
   * @param {HTMLElement} parentElement The parent element to add the fields.
   */
  appendFieldsTo(parentElement) {
    if (this.fields.length === 0) {
      return;
    }

    let form = document.createElement('form');
    form.onsubmit = () => {
      this._notifyFieldUpdate();
      return false;
    };
    form.id = this.formId;

    for (let i = 0; i < this.fields.length; ++i) {
      let field = this.fields[i];

      let label = document.createElement('label');
      label.for = field.name;
      label.innerText = field.label;

      let input = document.createElement('input');
      input.type = field.type;
      input.name = field.name;
      input.onchange = () => this._notifyFieldUpdate();

      form.append(label);
      form.append(input);
    }

    parentElement.append(form);
  }

  _notifyFieldUpdate() {
    let data = new FormData(this.formElement);
    this.sendEvent(CityObjectFilterSelector.EVENT_FIELDS_UPDATED, data);
  }

  /////////////
  ///// GETTERS

  get formId() {
    return 'city-object-filter-selector-form';
  }

  get formElement() {
    return document.getElementById(this.formId);
  }

  ////////////
  ///// EVENTS

  static get EVENT_FIELDS_UPDATED() {
    return 'EVENT_FIELDS_UPDATED';
  }
}