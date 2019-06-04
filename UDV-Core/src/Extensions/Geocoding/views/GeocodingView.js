import { GeocodingService } from "../services/GeocodingService";
import { ModuleView } from "../../../Utils/ModuleView/ModuleView";

import './GeocodingStyle.css';

/**
 * @member {String} test test
 */
export class GeocodingView extends ModuleView {
  /**
   * Instantiates the view.
   * @param {GeocodingService} geocodingService The geocoding service.
   */
  constructor(geocodingService) {
    super();
    this.geocodingService = geocodingService;
  }

  get html() {
    return /*html*/`
      <form id="${this.formId}">
        <input id="${this.searchInputId}" type="text"
        name="geocoding_searchstring" placeholder="Search address, location...">
      </form>
    `;
  }

  /**
   * Appends the view div to the DOM;
   * @param {HTMLElement} htmlElement An HTML element
   */
  appendToElement(htmlElement) {
    if (!this.isCreated) {
      let div = document.createElement('div');
      div.innerHTML = this.html;
      div.id = this.viewId;
      htmlElement.append(div);

      this.formElement.onsubmit = () => {
        this.doGeocoding();
        return false;
      }
    }
  }

  dispose() {
    if (this.isCreated) {
      let div = this.viewElement;
      div.parentElement.removeChild(div);
    }
  }

  doGeocoding() {
    let searchString = this.searchInputElement.value;

    //might change; but we need at the end a lat/long
    let coords = this.geocodingService.getCoordinates(searchString);
    let {lat, long} = coords;
    
    //focus the camera !
  }

  //////////// Helpful getters
  ////////////////////////////

  get isCreated() {
    return !!this.viewElement;
  }

  get viewId() {
    return '_geocoding_view';
  }

  get viewElement() {
    return document.getElementById(this.viewId);
  }

  get formId() {
    return `${this.viewId}_form`;
  }

  get formElement() {
    return document.getElementById(this.formId);
  }

  get searchInputId() {
    return `${this.formId}_searchstring`;
  }

  get searchInputElement() {
    return document.getElementById(this.searchInputId);
  }

  //////////// MODULE VIEW METHODS
  ////////////////////////////////

  enableView() {
    this.appendToElement(this.parentElement);
  }

  disableView() {
    this.dispose();
  }
}