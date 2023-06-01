import { MAIN_LOOP_EVENTS } from 'itowns';
import * as THREE from 'three';
import { findChildByID } from '../../HTMLUtil';
import { EventSender } from '@ud-viz/shared';

export class CameraPositioner extends EventSender {
  /**
   * Creates a CameraPositioner
   *
   * @param {import('itowns').PlanarView} itownsView - the itowns view object
   */
  constructor(itownsView) {
    super();

    this.itownsView = itownsView;

    // Request update every active frame
    this.itownsView.addFrameRequester(
      MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE,
      () => this._updateFieldsFromCamera()
    );

    this.domElement = document.createElement('div');
    this.domElement.innerHTML = this.innerContentHtml;

    // callbacks
    this.formElement.onsubmit = () => {
      this._travel();
      return false;
    };

    this.buttonValidateElement.onclick = () => {
      this._validate();
    };

    // Event for position registering
    this.registerEvent(CameraPositioner.EVENT_POSITION_SUBMITTED);
  }

  get innerContentHtml() {
    return /* html*/ `
      <div class="box-section">
        <h3 class="section-title">Coordinates</h3>
        <form id="${this.formId}">
          <fieldset>
            <legend>Position</legend>
            <label for="${this.positionXId}">X</label>
            <input id="${this.positionXId}" name="positionX" type="text"><br>
            <label for="${this.positionYId}">Y</label>
            <input id="${this.positionYId}" name="positionY" type="text"><br>
            <label for="${this.positionZId}">Z</label>
            <input id="${this.positionZId}" name="positionZ" type="text"><br>
          </fieldset>
          <fieldset>
            <legend>Quaternion</legend>
            <label for="${this.quaternionXId}">X</label>
            <input id="${this.quaternionXId}" name="quaternionX" type="text"><br>
            <label for="${this.quaternionYId}">Y</label>
            <input id="${this.quaternionYId}" name="quaternionY" type="text"><br>
            <label for="${this.quaternionZId}">Z</label>
            <input id="${this.quaternionZId}" name="quaternionZ" type="text"><br>
            <label for="${this.quaternionWId}">W</label>
            <input id="${this.quaternionWId}" name="quaternionW" type="text"><br>
          </fieldset>
          <hr>
          <button id="${this.buttonValidateId}" type="button">Validate</button>
          <input id="${this.buttonTravelId}" type="submit" value="Travel">
        </form>
      </div>
    `;
  }

  // ///////////////////////
  // /// POSITION MANAGEMENT

  /**
   * Updates the form fields from the camera position.
   */
  _updateFieldsFromCamera() {
    if (this.domElement.parentElement) {
      // html is present in DOM update fields
      const camera = this.itownsView.camera.camera3D;
      const position = camera.position;
      const quaternion = camera.quaternion;
      this.positionXElement.value = position.x;
      this.positionYElement.value = position.y;
      this.positionZElement.value = position.z;
      this.quaternionXElement.value = quaternion.x;
      this.quaternionYElement.value = quaternion.y;
      this.quaternionZElement.value = quaternion.z;
      this.quaternionWElement.value = quaternion.w;
    }
  }

  /**
   * Retrieve the current camera position from the form fields.
   *
   * @returns {{position: THREE.Vector3, quaternion: THREE.Quaternion}} Returns a position and a rotation
   */
  _getCameraPosition() {
    const data = new FormData(this.formElement);
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();

    position.x = Number(data.get('positionX'));
    position.y = Number(data.get('positionY'));
    position.z = Number(data.get('positionZ'));

    quaternion.x = Number(data.get('quaternionX'));
    quaternion.y = Number(data.get('quaternionY'));
    quaternion.z = Number(data.get('quaternionZ'));
    quaternion.w = Number(data.get('quaternionW'));

    return {
      position: position,
      quaternion: quaternion,
    };
  }

  /**
   * Make the camera travel to the position and orientation in the form fields.
   */
  async _travel() {
    const camera = this._getCameraPosition();
    this.itownsView.controls.initiateTravel(
      camera.position,
      'auto',
      camera.quaternion,
      true
    );
  }

  /**
   * Sends the position submitted event with the current camera position and
   * orientation.
   */
  _validate() {
    const camera = this._getCameraPosition();
    this.sendEvent(CameraPositioner.EVENT_POSITION_SUBMITTED, camera);
  }

  // ///////////
  // /// GETTERS

  get buttonValidateId() {
    return `camera_positioner_button_validate`;
  }

  get buttonValidateElement() {
    return findChildByID(this.domElement, this.buttonValidateId);
  }

  get buttonTravelId() {
    return `camera_positioner_button_travel`;
  }

  get buttonTravelElement() {
    return findChildByID(this.domElement, this.buttonTravelId);
  }

  get formId() {
    return `camera_positioner_form`;
  }

  get formElement() {
    return findChildByID(this.domElement, this.formId);
  }

  get positionXId() {
    return `camera_positioner_position_x`;
  }

  get positionXElement() {
    return findChildByID(this.domElement, this.positionXId);
  }

  get positionYId() {
    return `camera_positioner_position_y`;
  }

  get positionYElement() {
    return findChildByID(this.domElement, this.positionYId);
  }

  get positionZId() {
    return `camera_positioner_position_z`;
  }

  get positionZElement() {
    return findChildByID(this.domElement, this.positionZId);
  }

  get quaternionXId() {
    return `camera_positioner_quaternion_x`;
  }

  get quaternionXElement() {
    return findChildByID(this.domElement, this.quaternionXId);
  }

  get quaternionYId() {
    return `camera_positioner_quaternion_y`;
  }

  get quaternionYElement() {
    return findChildByID(this.domElement, this.quaternionYId);
  }

  get quaternionZId() {
    return `camera_positioner_quaternion_z`;
  }

  get quaternionZElement() {
    return findChildByID(this.domElement, this.quaternionZId);
  }

  get quaternionWId() {
    return `camera_positioner_quaternion_w`;
  }

  get quaternionWElement() {
    return findChildByID(this.domElement, this.quaternionWId);
  }

  // //////////
  // /// EVENTS

  static get EVENT_POSITION_SUBMITTED() {
    return 'EVENT_POSITION_SUBMITTED';
  }
}
