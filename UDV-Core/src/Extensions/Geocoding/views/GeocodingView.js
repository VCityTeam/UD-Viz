import { GeocodingService } from "../services/GeocodingService";
import { ModuleView } from "../../../Utils/ModuleView/ModuleView";
import * as THREE from 'three';
import proj4 from 'proj4';

import './GeocodingStyle.css';

/**
 * @member {String} test test
 */
export class GeocodingView extends ModuleView {
  /**
   * Instantiates the view.
   * @param {GeocodingService} geocodingService The geocoding service.
   * @param {udvcore.itowns.PlanarControls} cameraControls The camera controls.
   * @param {udvcore.itowns.PlanarView} planarView The iTowns view.
   */
  constructor(geocodingService, cameraControls, planarView) {
    super();
    this.geocodingService = geocodingService;
    this.cameraControls = cameraControls;
    this.planarView = planarView;
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
      let input = this.searchInputElement;
      input.style.transition = 'width 0.5s ease-out, opacity 0.6s ease-out'
      input.style.width = '0';
      input.style.opacity = '0';
      input.ontransitionend = (event) => {
        if (event.propertyName === "opacity") {
          div.parentElement.removeChild(div);
        }
      }
    }
  }

  async doGeocoding() {
    let searchString = this.searchInputElement.value;

    try {
      //might change; but we need at the end a lat/long
      let coords = await this.geocodingService.getCoordinates(searchString);
      let {lat, lng} = coords;
      
      console.log(`Focus on (${lat}, ${lng})`)
      //first step : convert the lat/long to coordinates used by itowns
      let [targetX, targetY] = proj4('EPSG:3946').forward([lng, lat]);
      //second step : find the Z value
      let elevationLayer = this.planarView.getLayers()
        .filter((layer) => layer.type === "elevation")[0];
      //console.log(elevationLayer);
      let targetZ = 200; // todo : trouver comment faire ^^

      //third step : make the camera look at these coordinates
      console.log(`Looking at (${targetX}, ${targetY}, ${targetZ})`);
      let targetPos = new THREE.Vector3(targetX, targetY, targetZ);
      let cameraPos = this.planarView.camera.camera3D.position.clone();
      const deltaZ = 800;
      const horizontalDistance = 1.3*deltaZ;
      const dist = cameraPos.distanceTo(targetPos);
      const direction = (new THREE.Vector3()).subVectors(targetPos, cameraPos);
      cameraPos.addScaledVector(direction, (1-horizontalDistance/dist));
      cameraPos.z = targetPos.z + deltaZ;
      console.log(cameraPos);
      this.cameraControls.initiateTravel(cameraPos, 'auto', targetPos, true);
    } catch (e) {
      console.log('No result found');
    }
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