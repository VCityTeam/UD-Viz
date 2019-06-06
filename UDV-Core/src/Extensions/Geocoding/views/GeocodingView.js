import { GeocodingService } from "../services/GeocodingService";
import { ModuleView } from "../../../Utils/ModuleView/ModuleView";
import * as THREE from 'three';
import * as itowns from 'itowns';
import proj4 from 'proj4';

import './GeocodingStyle.css';
import Coordinates from "itowns/lib/Core/Geographic/Coordinates";

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
    this.meshes = [];
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
   * Appends the view div to the DOM.
   * 
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

  /**
   * Destroys the view.
   */
  dispose() {
    if (this.isCreated) {
      let div = this.viewElement;
      let input = this.searchInputElement;
      input.style.transition = 'width 0.3s ease-out, opacity 0.4s ease-out'
      input.style.width = '0';
      input.style.opacity = '0';
      input.ontransitionend = (event) => {
        if (event.propertyName === "opacity") {
          div.parentElement.removeChild(div);
          this.removePins();
        }
      }
    }
  }

  /**
   * Removes places pins, then makes a new search geocoding query. If at least
   * one result is found, places pins at appropriate places and focuses the
   * camera on the first result.
   */
  async doGeocoding() {
    this.removePins();
    let searchString = this.searchInputElement.value;

    try {
      let coords = await this.geocodingService.getCoordinates(searchString);
      coords.forEach((c, i) => {
        let {lat, lng} = c;
        //step 1 : convert the lat/lng to coordinates used by itowns
        let targetPos = this.getWorldCoordinates(lat, lng);
        if (!!targetPos.z) {
          //if we could convert the coords (ie. they are on the map)
          //step 2 : add a mesh representing a pin
          this.addPin(targetPos);
          //step 3 : if the first result, focus on it (move the camera)
          if (i === 0) {
            this.focusCameraOn(targetPos);
          }
        }
      })
    } catch (e) {
      console.log('No result found');
    }
  }

  /**
   * Make the camera look at the given position. Computes an appropriate
   * position for the camera to see the target.
   * 
   * @param {THREE.Vector3} targetPos Target posiition.
   */
  focusCameraOn(targetPos) {
    let cameraPos = this.planarView.camera.camera3D.position.clone();
    const deltaZ = 800;
    const horizontalDistance = 1.3*deltaZ;
    const dist = cameraPos.distanceTo(targetPos);
    const direction = (new THREE.Vector3()).subVectors(targetPos, cameraPos);
    cameraPos.addScaledVector(direction, (1-horizontalDistance/dist));
    cameraPos.z = targetPos.z + deltaZ;
    this.cameraControls.initiateTravel(cameraPos, 'auto', targetPos, true);
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
    const coords = new Coordinates('EPSG:3946', targetX, targetY, 0);
    const targetZ = itowns.DEMUtils.getElevationValueAt(this.planarView.tileLayer, coords).z;
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
    const cylMat = new THREE.MeshToonMaterial({color: 0xff0000});
    const cylMesh = new THREE.Mesh(cylGeom, cylMat);
    position.z += pinHeight / 2;
    this.addMeshToScene(cylMesh, position);
    const sphereGeom = new THREE.SphereGeometry(10, 16, 16);
    const sphereMat = new THREE.MeshToonMaterial({color: 0xff00000});
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