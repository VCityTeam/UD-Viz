import * as THREE from 'three';
import * as itowns from 'itowns';
import proj4 from 'proj4';
import { findChildByID } from '../../../../HTMLUtil';
import { focusCameraOn } from '../../../../Itowns/Component/Component';
import { GeocodingService } from '../services/GeocodingService';

import './GeocodingStyle.css';

export class GeocodingView {
  /**
   * Instantiates the view.
   *
   * @param {GeocodingService} geocodingService The geocoding service.
   * @param {import('itowns').PlanarView} planarView The iTowns view.
   */
  constructor(geocodingService, planarView) {
    this.rootHtml = document.createElement('div');
    this.rootHtml.setAttribute('id', this.viewId);
    this.rootHtml.innerHTML = this.innerHtmlContent;

    this.geocodingService = geocodingService;
    this.planarView = planarView;
    this.meshes = [];

    this.creditElement.innerHTML = this.geocodingService.credit;

    this.formElement.onsubmit = () => {
      this.doGeocoding();
      return false;
    };

    // https://github.com/VCityTeam/UD-Viz/issues/559
    // if crs EPSG:3946 has not be defined define it here

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

  get innerHtmlContent() {
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

  html() {
    return this.rootHtml;
  }

  /**
   * Dispose the view.
   */
  dispose() {
    this.rootHtml.remove();
    this.removePins();
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
      coords.forEach((c, i) => {
        const { lat, lng } = c;

        // Step 1 : convert the lat/lng to coordinates used by itowns
        const targetPos = this.getWorldCoordinates(lat, lng);
        // If we could convert the coords (ie. they are on the map)
        // step 2 : add a mesh representing a pin
        this.addPin(targetPos);
        // Step 3 : if the first result, focus on it (move the camera)
        if (i === 0) {
          focusCameraOn(this.planarView, this.planarView.controls, targetPos);
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
    const targetZ = elevation ? elevation : 0;
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
    cylMesh.rotation.x = -Math.PI * 0.5;
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
   * @param {THREE.Mesh} mesh The THREE.js mesh to add
   * @param {THREE.Vector3} position The position of the mesh
   */
  async addMeshToScene(mesh, position) {
    mesh.position.copy(position);
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
    this.planarView.notifyChange();
  }

  /**
   * Displays an error info box under the search bar.
   *
   * @param {string} errorMsg The error message.
   * @param {number} timeout The timeout of the message in ms.
   */
  async displayError(errorMsg, timeout = 1000) {
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
  }

  // ////////// Helpful getters
  // //////////////////////////

  get viewId() {
    return '_geocoding_view';
  }

  get viewElement() {
    return findChildByID(this.rootHtml, this.viewId);
  }

  get formId() {
    return `${this.viewId}_form`;
  }

  get formElement() {
    return findChildByID(this.rootHtml, this.formId);
  }

  get searchInputId() {
    return `${this.formId}_searchstring`;
  }

  get searchInputElement() {
    return findChildByID(this.rootHtml, this.searchInputId);
  }

  get centeredDivId() {
    return `${this.viewId}_centered`;
  }

  get centeredDivElement() {
    return findChildByID(this.rootHtml, this.centeredDivId);
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
    return findChildByID(this.rootHtml, this.creditId);
  }
}
