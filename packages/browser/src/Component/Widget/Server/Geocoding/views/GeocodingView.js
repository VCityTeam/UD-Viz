import * as THREE from 'three';
import * as itowns from 'itowns';
import proj4 from 'proj4';

import { WidgetView } from '../../../Component/WidgetView/WidgetView';
import { focusCameraOn } from '../../../../Itowns/Component/Component';
import { GeocodingService } from '../services/GeocodingService';
import './GeocodingStyle.css';

export class GeocodingView extends WidgetView {
  /**
   * Instantiates the view.
   *
   * @param {GeocodingService} geocodingService The geocoding service.
   * @param {udvcore.itowns.PlanarView} planarView The iTowns view.
   */
  constructor(geocodingService, planarView) {
    super();
    this.geocodingService = geocodingService;
    this.planarView = planarView;
    this.meshes = [];

    // Define EPSG:3946 projection which is the projection used in the 3D view
    // (planarView of iTowns). It is indeed needed in getWorldCoordinates()
    // to convert the coordinates received from the geocoding service (WGS84)
    // to this coordinate system.
    proj4.defs(
      'EPSG:3946',
      '+proj=lcc +lat_1=45.25 +lat_2=46.75' +
        ' +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
    );
  }

  get html() {
    return /* html*/ `
      <form id="${this.formId}">
        <div id="${this.centeredDivId}">
          <input id="${this.searchInputId}" type="text"
          name="geocoding_searchstring" placeholder="Search address, location...">
          <p id="${this.creditId}"></p>
        </div>
      </form>
    `;
  }

  /**
   * Appends the view div to the DOM.
   *
   * @param {HTMLElement} htmlElement An HTML element
   */
  appendToElement(htmlElement) {
    if (!this.isCreated) {
      const div = document.createElement('div');
      div.innerHTML = this.html;
      div.id = this.viewId;
      htmlElement.append(div);

      this.creditElement.innerHTML = this.geocodingService.credit;

      this.formElement.onsubmit = () => {
        this.doGeocoding();
        return false;
      };
    }
  }

  /**
   * Destroys the view.
   */
  dispose() {
    return new Promise((resolve) => {
      if (this.isCreated) {
        const div = this.viewElement;
        const input = this.searchInputElement;
        input.style.transition = 'width 0.3s ease-out, opacity 0.4s ease-out';
        input.style.width = '0';
        input.style.opacity = '0';
        input.ontransitionend = (event) => {
          if (event.propertyName === 'opacity') {
            div.parentElement.removeChild(div);
            this.removePins();
            resolve();
          }
        };
      } else {
        resolve();
      }
    });
  }

  /**
   * Removes places pins, then makes a new search geocoding query. If at least
   * one result is found, places pins at appropriate places and focuses the
   * camera on the first result.
   */
  async doGeocoding() {
    this.removePins();
    const searchString = this.searchInputElement.value;

    try {
      const coords = await this.geocodingService.getCoordinates(searchString);
      coords.forEach((c) => {
        const { lat, lng } = c;
        let i = 0;
        // Step 1 : convert the lat/lng to coordinates used by itowns
        const targetPos = this.getWorldCoordinates(lat, lng);
        if (targetPos.z) {
          // If we could convert the coords (ie. they are on the map)
          // step 2 : add a mesh representing a pin
          this.addPin(targetPos);
          // Step 3 : if the first result, focus on it (move the camera)
          if (i === 0) {
            focusCameraOn(this.planarView, this.planarView.controls, targetPos);
          }
          i += 1;
        }
      });
    } catch (e) {
      console.error(e);
      this.displayError(e);
    }
  }

  /**
   * Converts a lat/long position into world coordinates, usable in the scene.
   *
   * @param {number} lat Latitude.
   * @param {number} lng Longitude.
   * @returns {THREE.Vector3} World coordinates.
   */
  getWorldCoordinates(lat, lng) {
    const [targetX, targetY] = proj4('EPSG:3946').forward([lng, lat]);
    const coords = new itowns.Coordinates('EPSG:3946', targetX, targetY, 0);
    const elevation = itowns.DEMUtils.getElevationValueAt(
      this.planarView.tileLayer,
      coords
    );
    const targetZ = elevation ? elevation : undefined;
    return new THREE.Vector3(targetX, targetY, targetZ);
  }

  /**
   * Adds a pin to the scene. A pin is made of two meshes : a sphere and a
   * cylinder.
   *
   * @param {THREE.Vector3} position Position of the pin.
   */
  async addPin(position) {
    const pinHeight = 50;
    const cylGeom = new THREE.CylinderGeometry(1, 8, pinHeight, 8);
    const cylMat = new THREE.MeshToonMaterial({ color: 0xff0000 });
    const cylMesh = new THREE.Mesh(cylGeom, cylMat);
    position.z += pinHeight / 2;
    this.addMeshToScene(cylMesh, position);
    const sphereGeom = new THREE.SphereGeometry(10, 16, 16);
    const sphereMat = new THREE.MeshToonMaterial({ color: 0xff00000 });
    const sphereMesh = new THREE.Mesh(sphereGeom, sphereMat);
    position.z += pinHeight / 2;
    this.addMeshToScene(sphereMesh, position);
  }

  /**
   * Places the given mesh into the scene, orienting it towards the bottom.
   *
   * @param {THREE.Mesh} mesh
   * @param {THREE.Vector3} position
   */
  async addMeshToScene(mesh, position) {
    mesh.position.copy(position);
    mesh.lookAt(new THREE.Vector3(0, 0, 0));
    mesh.rotateX(Math.PI);
    mesh.updateMatrixWorld();
    this.planarView.scene.add(mesh);
    this.meshes.push(mesh);
  }

  /**
   * Remove all pins from the scene.
   */
  async removePins() {
    this.meshes.forEach((pin) => {
      this.planarView.scene.remove(pin);
    });
    this.meshes = [];
  }

  /**
   * Displays an error info box under the search bar.
   *
   * @param {string} errorMsg The error message.
   * @param {number} timeout The timeout of the message in ms.
   */
  async displayError(errorMsg, timeout = 1000) {
    if (this.isCreated) {
      const box = document.createElement('p');
      box.id = this.errorMessageBoxId;
      box.innerHTML = errorMsg;
      this.centeredDivElement.appendChild(box);
      box.addEventListener('transitionend', (evt) => {
        if (evt.propertyName === 'opacity') {
          this.centeredDivElement.removeChild(box);
        }
      });
      setTimeout(() => {
        box.style.transition = 'opacity 0.4s ease-out';
        box.style.opacity = '0';
      }, timeout);
    } else {
      throw 'Cannot display error messages when the window is not created';
    }
  }

  // ////////// Helpful getters
  // //////////////////////////

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

  get centeredDivId() {
    return `${this.viewId}_centered`;
  }

  get centeredDivElement() {
    return document.getElementById(this.centeredDivId);
  }

  get errorMessageBoxId() {
    return `${this.centeredDivId}_error`;
  }

  get errorMessageBoxElement() {
    return `${this.centeredDivId}_error`;
  }

  get creditId() {
    return `${this.centeredDivId}_credit`;
  }

  get creditElement() {
    return document.getElementById(this.creditId);
  }

  // ////////// MODULE VIEW METHODS
  // //////////////////////////////

  /**
   * @override
   */
  async enableView() {
    this.appendToElement(this.parentElement);
  }

  /**
   * @override
   */
  async disableView() {
    await this.dispose();
  }
}
