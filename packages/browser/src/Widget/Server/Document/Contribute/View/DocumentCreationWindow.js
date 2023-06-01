import * as THREE from 'three';
import { DocumentVisualizerWindow } from '../../Visualizer/View/DocumentVisualizerWindow';
import { CameraPositioner } from '../../../../CameraPositioner/CameraPositioner';
import { ContributeService } from '../Service/ContributeService';
import { findChildByID } from '../../../../../HTMLUtil';

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
    this.domElement = document.createElement('div');
    this.domElement.innerHTML = this.innerContentHtml;

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
      (data) => this._registerPositionAndQuaternion(data)
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
    this.formElement.onsubmit = () => {
      this._submitCreation();
      return false;
    };

    this.formElement.oninput = () => this._updateFormButtons();

    this.buttonPositionElement.onclick = () => this._startPositioningDocument();

    this._initForm();
  }

  dispose() {
    this.positioner.dispose();
    this.domElement.remove();
    this._exitEditMode();
    this.documentVisualizer.dispose();
  }

  get innerContentHtml() {
    return /* html*/ `
      <div class="box-section">
        <h3 class="section-title">Document data</h3>
        <form id="${this.formId}" class="doc-update-creation-form">
          <label for="${this.docImageId}">File</label>
          <input name="file" type="file" id="${this.docImageId}">
          <label for="${this.docTitleId}">Title</label>
          <input name="title" type="text" id="${this.docTitleId}">
          <label for="${this.descriptionId}">Description</label>
          <textarea name="description" id="${this.descriptionId}"></textarea>
          <label for="${this.pubDateId}">Publication date</label>
          <input name="publicationDate" type="date" id="${this.pubDateId}">
          <label for="${this.refDateId}">Refering date</label>
          <input name="refDate" type="date" id="${this.refDateId}">
          <label for="${this.sourceId}">Source</label>
          <input name="source" type="text" id="${this.sourceId}">
          <label for="${this.docRightsHolderId}">Rights holder</label>
          <input name="rightsHolder" type="text" id="${this.docRightsHolderId}">
          <hr>
          <button type="button" id="${this.buttonPositionId}">Set position</button>
          <input type="submit" disabled value="Create" id="${this.buttonCreateId}">
        </form>
      </div>
    `;
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
    fileReader.readAsDataURL(this.docImageElement.files[0]);
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
    this.docImageElement.value = '';
    this.docTitleElement.value = '';
    this.sourceElement.value = '';
    this.docRightsHolderElement.value = '';
    this.descriptionElement.value = '';
    this.pubDateElement.value = '';
    this.refDateElement.value = '';
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
    const data = new FormData(this.formElement);
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
    if (this.docImageElement.value) {
      this.buttonPositionElement.disabled = false;
    } else {
      this.buttonPositionElement.disabled = true;
    }

    if (this._formValidation()) {
      this.buttonCreateElement.disabled = false;
    } else {
      this.buttonCreateElement.disabled = true;
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

    const data = new FormData(this.formElement);
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

  // ///////////
  // /// GETTERS

  get buttonPositionId() {
    return `document_contribute_creation_button_position`;
  }

  get buttonPositionElement() {
    return findChildByID(this.domElement, this.buttonPositionId);
  }

  get buttonCreateId() {
    return `document_contribute_creation_button_creation`;
  }

  get buttonCreateElement() {
    return findChildByID(this.domElement, this.buttonCreateId);
  }

  get formId() {
    return `document_contribute_creation_form`;
  }

  get formElement() {
    return findChildByID(this.domElement, this.formId);
  }

  get docTitleId() {
    return `document_contribute_creation_title`;
  }

  get docTitleElement() {
    return findChildByID(this.domElement, this.docTitleId);
  }

  get docImageId() {
    return `document_contribute_creation_image`;
  }

  get docImageElement() {
    return findChildByID(this.domElement, this.docImageId);
  }

  get sourceId() {
    return `document_contribute_creation_source`;
  }

  get sourceElement() {
    return findChildByID(this.domElement, this.sourceId);
  }

  get docRightsHolderId() {
    return `document_contribute_creation_rights_holder`;
  }

  get docRightsHolderElement() {
    return findChildByID(this.domElement, this.docRightsHolderId);
  }

  get descriptionId() {
    return `document_contribute_creation_description`;
  }

  get descriptionElement() {
    return findChildByID(this.domElement, this.descriptionId);
  }

  get pubDateId() {
    return `document_contribute_creation_pub_date`;
  }

  get pubDateElement() {
    return findChildByID(this.domElement, this.pubDateId);
  }

  get refDateId() {
    return `document_contribute_creation_ref_date`;
  }

  get refDateElement() {
    return findChildByID(this.domElement, this.refDateId);
  }
}
