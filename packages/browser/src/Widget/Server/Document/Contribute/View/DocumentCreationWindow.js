import * as THREE from 'three';
import { DocumentVisualizerWindow } from '../../Visualizer/DocumentVisualizerWindow';
import { CameraPositioner } from '../../../../CameraPositioner/CameraPositioner';
import { ContributeService } from '../Service/ContributeService';
import { createLabelInput } from '../../../../../HTMLUtil';

/** @class */
export class DocumentCreationWindow {
  /**
   * Creates a new document creation window.
   *
   * @param {ContributeService} contributeService The contribute service to
   * perform requests.
   * @param {import('itowns').PlanarView} itownsView The iTowns view.
   * @param {import('itowns').PlanarControls} cameraControls The planar camera controls.
   * @param {DocumentVisualizerWindow} documentVisualizer The document image orienter module.
   * @param {HTMLElement} parentElementVisualizer - element to add visualizer to
   */
  constructor(
    contributeService,
    itownsView,
    cameraControls,
    documentVisualizer,
    parentElementVisualizer
  ) {
    // create dom ui
    this.domElement = document.createElement('div');

    this.form = document.createElement('form');

    this.docImage = createLabelInput('File', 'file');
    this.docImage.input.setAttribute('name', 'file');
    this.form.appendChild(this.docImage.parent);

    this.docTitle = createLabelInput('Title', 'text');
    this.docTitle.input.setAttribute('name', 'title');
    this.form.appendChild(this.docTitle.parent);

    this.docDescription = createLabelInput('Description', 'text');
    this.docDescription.input.setAttribute('name', 'description');
    this.form.appendChild(this.docDescription.parent);

    this.pubDate = createLabelInput('Publication date', 'date');
    this.pubDate.input.setAttribute('name', 'publicationDate');
    this.form.appendChild(this.pubDate.parent);

    this.refDate = createLabelInput('Refering date', 'date');
    this.refDate.input.setAttribute('name', 'refDate');
    this.form.appendChild(this.refDate.parent);

    this.source = createLabelInput('Source', 'text');
    this.source.input.setAttribute('name', 'source');
    this.form.appendChild(this.source.parent);

    this.rightsHolder = createLabelInput('Rights holder', 'text');
    this.rightsHolder.input.setAttribute('name', 'rightsHolder');
    this.form.appendChild(this.rightsHolder.parent);

    this.buttonPosition = document.createElement('button');
    this.buttonPosition.setAttribute('type', 'button');
    this.buttonPosition.innerText = 'Set Position';
    this.form.appendChild(this.buttonPosition);

    this.inputCreate = document.createElement('input');
    this.inputCreate.setAttribute('type', 'submit');
    this.inputCreate.value = 'Create';
    this.inputCreate.disabled = true;
    this.form.appendChild(this.inputCreate);

    // end dom

    this.parentElementVisualizer = parentElementVisualizer;

    /**
     * The contribute service to perform requests.
     *
     * @type {ContributeService}
     */
    this.contributeService = contributeService;

    /** @type {CameraPositioner} */
    this.positioner = new CameraPositioner(itownsView, cameraControls);
    this.positioner.addEventListener(
      CameraPositioner.EVENT_POSITION_SUBMITTED,
      (data) => {
        this._registerPositionAndQuaternion(data.message);
      }
    );

    /**
     * The camera controls
     *
     * @type {*}
     */
    this.controls = cameraControls;

    /**
     * The registered camera position for the document visualization.
     *
     * @type {THREE.Vector3}
     */
    this.cameraPosition = undefined;

    /**
     * The registered camera orientation for the document visualization.
     *
     * @type {THREE.Quaternion}
     */
    this.cameraQuaternion = undefined;

    /**
     * The document image orienter module.
     *
     * @type {DocumentVisualizerWindow}
     */
    this.documentVisualizer = documentVisualizer;

    /**
     * The settings for an accurate movement of the camera. These settings
     * should be used in the `PlanarControls` class.
     *
     * @type {{rotateSpeed: number, zoomInFactor: number, zoomOutFactor: number,
     * maxPanSpeed: number, minPanSpeed: number}}
     */
    this.accurateControlsSettings = {
      rotateSpeed: 1.5,
      zoomInFactor: 0.04,
      zoomOutFactor: 0.04,
      maxPanSpeed: 5.0,
      minPanSpeed: 0.01,
    };

    /**
     * The saved state of the planar controls settings. This is used to restore
     * the default settings when needed.
     *
     * @type {{rotateSpeed: number, zoomInFactor: number, zoomOutFactor: number,
     * maxPanSpeed: number, minPanSpeed: number}}
     */
    this.savedControlsSettings = {};
    for (const key of Object.keys(this.accurateControlsSettings)) {
      this.savedControlsSettings[key] = this.controls[key];
    }

    // callbacks
    this.form.onsubmit = () => {
      this._submitCreation();
      return false;
    };

    this.form.oninput = () => this._updateFormButtons();

    this.buttonPosition.onclick = () => this._startPositioningDocument();

    this._initForm();
  }

  dispose() {
    this.positioner.dispose();
    this.domElement.remove();
    this._exitEditMode();
    this.documentVisualizer.dispose();
  }

  // ///////////////////////
  // /// DOCUMENT POSITIONER

  /**
   * Displays the document positioning interfaces : the window positioner and
   * the document image orienter.
   *
   * @private
   */
  _startPositioningDocument() {
    this.domElement.appendChild(this.positioner.domElement);

    this._enterEditMode();

    const fileReader = new FileReader();
    fileReader.onload = () => {
      this.documentVisualizer.setImageSrc(fileReader.result);
      this.parentElementVisualizer.appendChild(
        this.documentVisualizer.domElement
      );
    };
    fileReader.readAsDataURL(this.docImage.input.files[0]);
  }

  /**
   * Change the controls settings to 'edit mode', ie. the camera moves, zooms
   * and rotates slower. This allows the user to place a document with more
   * accuracy.
   */
  _enterEditMode() {
    for (const [key, val] of Object.entries(this.accurateControlsSettings)) {
      this.controls[key] = val;
    }
  }

  /**
   * Resets the controls settings to their default value.
   */
  _exitEditMode() {
    for (const [key, val] of Object.entries(this.savedControlsSettings)) {
      this.controls[key] = val;
    }
  }

  // ////////
  // /// FORM

  /**
   * Sets the initial values for the form.
   *
   * @private
   */
  _initForm() {
    this.docImage.input.value = '';
    this.docTitle.input.value = '';
    this.source.input.value = '';
    this.rightsHolder.input.value = '';
    this.docDescription.input.value = '';
    this.pubDate.input.value = '';
    this.refDate.input.value = '';
    this._updateFormButtons();
  }

  /**
   * Checks if the form is ready to be validated. Every entry must have a
   * non-empty value, and the camera position / orientation must have been set.
   *
   * @returns {boolean} True if the validagion succeded
   * @private
   */
  _formValidation() {
    const data = new FormData(this.form);
    for (const entry of data.entries()) {
      if (!entry[1] || entry[1] === '') {
        return false;
      }
    }
    if (!this.cameraPosition || !this.cameraQuaternion) {
      return false;
    }
    return true;
  }

  /**
   * Update the form buttons depending on the current form state. If the
   * document have been chosen, we can position it. If the form is valid,
   * we can create the document.
   *
   * @private
   */
  _updateFormButtons() {
    if (this.docImage.input.value) {
      this.buttonPosition.disabled = false;
    } else {
      this.buttonPosition.disabled = true;
    }

    if (this._formValidation()) {
      this.inputCreate.disabled = false;
    } else {
      this.inputCreate.disabled = true;
    }
  }

  /**
   * Registers the camera position and orientation.
   *
   * @param {{
   *  position: THREE.Vector3,
   * quaternion: THREE.Quaternion
   * }} cameraState Position and orientation of the camera.
   */
  _registerPositionAndQuaternion(cameraState) {
    this.cameraPosition = cameraState.position;
    this.cameraQuaternion = cameraState.quaternion;
    this._updateFormButtons();
  }

  /**
   * Proceeds to create the document from the form data.
   *
   * @private
   */
  async _submitCreation() {
    if (!this._formValidation()) {
      return;
    }

    const data = new FormData(this.form);
    data.append('positionX', this.cameraPosition.x);
    data.append('positionY', this.cameraPosition.y);
    data.append('positionZ', this.cameraPosition.z);
    data.append('quaternionX', this.cameraQuaternion.x);
    data.append('quaternionY', this.cameraQuaternion.y);
    data.append('quaternionZ', this.cameraQuaternion.z);
    data.append('quaternionW', this.cameraQuaternion.w);

    try {
      await this.contributeService.createDocument(data);
      this.dispose();
    } catch (e) {
      alert(e);
    }
  }
}
