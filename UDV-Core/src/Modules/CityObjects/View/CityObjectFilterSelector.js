import { EventSender } from "../../../Utils/Events/EventSender";

export class CityObjectFilterSelector {
  /**
   * 
   * @param {string} filterLabel The associated filter.
   * @param {string} displayName The displayed name in the `select` tag.
   */
  constructor(filterLabel, displayName) {    
    /**
     * The label of the corresponding filter.
     * 
     * @type {string}
     */
    this.filterLabel = filterLabel;

    /**
     * The displayed name of the filter.
     * 
     * @type {string}
     */
    this.displayName = displayName;
  }

  get html() {
    return `
    `;
  }

  onCreated() {

  }

  onSubmit(formData) {

  }

  /**
   * 
   * @param {HTMLElement} parentElement The parent element to add the fields.
   */
  appendFormFieldsTo(parentElement) {
    parentElement.innerHTML = this.html;
    this.onCreated();
  }
}