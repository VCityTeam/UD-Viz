import { MAIN_LOOP_EVENTS } from 'itowns';
import * as THREE from 'three';

export class CameraPositioner extends THREE.EventDispatcher {
  /**
   * Creates a CameraPositioner
   *
   * @param {import('itowns').PlanarView} itownsView - the itowns view object
   */
  constructor(itownsView) {
    super();

    // start dom creation

    this.domElement = document.createElement('div');

    this.sectionTitle = document.createElement('h3');
    this.sectionTitle.innerText = 'Coordinates';
    this.domElement.appendChild(this.sectionTitle);

    this.form = document.createElement('form');
    this.domElement.appendChild(this.form);

    const createInputAndAddToParent = (labelText, name, parent) => {
      const label = document.createElement('label');
      label.innerText = labelText;

      const uuid = THREE.MathUtils.generateUUID();

      label.setAttribute('for', uuid);

      const input = document.createElement('input');
      input.setAttribute('type', 'text');
      input.setAttribute('id', uuid);
      input.setAttribute('name', name);

      parent.appendChild(label);
      parent.appendChild(input);

      return input;
    };

    const fieldsetPosition = document.createElement('fieldset');
    this.form.appendChild(fieldsetPosition);

    const legendPosition = document.createElement('legend');
    legendPosition.innerText = 'Position';
    fieldsetPosition.appendChild(legendPosition);

    this.positionXElement = createInputAndAddToParent(
      'X',
      'positionX',
      fieldsetPosition
    );
    this.positionYElement = createInputAndAddToParent(
      'Y',
      'positionY',
      fieldsetPosition
    );
    this.positionZElement = createInputAndAddToParent(
      'Z',
      'positionZ',
      fieldsetPosition
    );

    const fieldsetQuaternion = document.createElement('fieldset');
    this.form.appendChild(fieldsetQuaternion);

    const legendQuaternion = document.createElement('legend');
    legendQuaternion.innerText = 'Quaternion';
    fieldsetQuaternion.appendChild(legendQuaternion);

    this.quaternionXElement = createInputAndAddToParent(
      'X',
      'quaternionX',
      fieldsetQuaternion
    );
    this.quaternionYElement = createInputAndAddToParent(
      'Y',
      'quaternionY',
      fieldsetQuaternion
    );
    this.quaternionZElement = createInputAndAddToParent(
      'Z',
      'quaternionZ',
      fieldsetQuaternion
    );
    this.quaternionWElement = createInputAndAddToParent(
      'W',
      'quaternionW',
      fieldsetQuaternion
    );

    this.buttonValidate = document.createElement('button');
    this.buttonValidate.setAttribute('type', 'button');
    this.buttonValidate.innerText = 'Validate';
    this.form.appendChild(this.buttonValidate);

    this.buttonTravel = document.createElement('input');
    this.buttonTravel.setAttribute('type', 'submit');
    this.buttonTravel.setAttribute('value', 'Travel');
    this.form.appendChild(this.buttonTravel);

    // end dom creation

    this.itownsView = itownsView;

    // Request update every active frame
    this.itownsView.addFrameRequester(
      MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE,
      () => this._updateFieldsFromCamera()
    );

    // callbacks
    this.form.onsubmit = () => {
      this._travel();
      return false;
    };

    this.buttonValidate.onclick = () => {
      this._validate();
    };
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
    const data = new FormData(this.form);
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
    this.dispatchEvent({
      type: CameraPositioner.EVENT_POSITION_SUBMITTED,
      message: camera,
    });
  }

  // //////////
  // /// EVENTS

  static get EVENT_POSITION_SUBMITTED() {
    return 'EVENT_POSITION_SUBMITTED';
  }
}
