import { GeocodingService } from '../services/GeocodingService';

import * as THREE from 'three';
import * as itowns from 'itowns';
import proj4 from 'proj4';
import { focusCameraOn } from '@ud-viz/utils_browser';

export class GeocodingView {
  /**
   * Instantiates the view.
   *
   * @param {GeocodingService} geocodingService The geocoding service.
   * @param {import('itowns').PlanarView} planarView The iTowns view.
   * @param {string} crs CRS of the view
   */
  constructor(geocodingService, planarView, crs) {
    this.geocodingService = geocodingService;

    // create ui
    this.domElement = document.createElement('div');

    this.form = document.createElement('form');
    this.domElement.appendChild(this.form);

    this.searchInput = document.createElement('input');
    this.searchInput.setAttribute('type', 'text');
    this.searchInput.setAttribute('placeholder', 'Search address, location...');
    this.form.appendChild(this.searchInput);

    const credits = document.createElement('p');
    credits.innerHTML = this.geocodingService.credit;
    this.form.appendChild(credits);

    this.planarView = planarView;
    this.crs = crs;
    this.meshes = [];

    this.form.onsubmit = () => {
      this.doGeocoding();
      return false;
    };
  }

  /**
   * Removes places pins, then makes a new search geocoding query. If at least
   * one result is found, places pins at appropriate places and focuses the
   * camera on the first result.
   */
  async doGeocoding() {
    this.removePins();
    const searchString = this.searchInput.value;

    try {
      const coords = await this.geocodingService.getCoordinates(searchString);
      console.debug(coords);
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
    const [targetX, targetY] = proj4(this.crs).forward([lng, lat]);
    const coords = new itowns.Coordinates(this.crs, targetX, targetY, 0);
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
    box.innerText = errorMsg;
    this.domElement.appendChild(box);
    box.addEventListener('transitionend', (evt) => {
      if (evt.propertyName === 'opacity') {
        this.domElement.removeChild(box);
      }
    });
    setTimeout(() => {
      box.style.transition = 'opacity 0.4s ease-out';
      box.style.opacity = '0';
    }, timeout);
  }
}
