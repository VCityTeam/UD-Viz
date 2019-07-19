import { AbstractDocumentWindow } from "../../../Modules/Documents/View/AbstractDocumentWindow";
import { ContributeService } from "../Service/ContributeService";
import { PositionerWindow } from "../../../Utils/Camera/PositionerWindow";
import { DocumentImageOrienter } from "../../../Modules/DocumentVisualizer/View/DocumentImageOrienter";
import * as THREE from 'three';
import { Window } from "../../../Utils/GUI/js/Window";

export class DocumentCreationWindow extends AbstractDocumentWindow {
  /**
   * Creates a new document creation window.
   * 
   * @param {ContributeService} contributeService The contribute service to
   * perform requests.
   * @param {*} itownsView The iTowns view.
   * @param {*} cameraControls The planar camera controls.
   * @param {DocumentImageOrienter} documentImageOrienter The document image orienter module.
   */
  constructor(contributeService, itownsView, cameraControls, documentImageOrienter) {
    super('Creation');


    /**
     * The contribute service to perform requests.
     * 
     * @type {ContributeService}
     */
    this.contributeService = contributeService;

    /**
     * The camera positioner utility tool.
     * 
     * @type {PositionerWindow}
     */
    this.positioner = new PositionerWindow(itownsView, cameraControls);
    this.positioner.addEventListener(PositionerWindow.EVENT_POSITION_SUBMITTED,
      (data) => this._registerPositionAndQuaternion(data));
    this.addEventListener(Window.EVENT_DISABLED,
      () => this.positioner.disable());

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
     * @type {DocumentImageOrienter}
     */
    this.documentImageOrienter = documentImageOrienter;
    // Listeners to close both the positioner and the image orienter at the
    // same time.
    this.documentImageOrienter.addEventListener(Window.EVENT_DISABLED, () => {
      if (this.positioner.isVisible) {
        this.positioner.disable()
      }});
    this.positioner.addEventListener(Window.EVENT_DISABLED, () => {
      if (this.documentImageOrienter.isVisible) {
        this.documentImageOrienter.disable()
      }});
  }

  get innerContentHtml() {
    return /*html*/`
      <div class="box-section">
        <h3>Document data</h3>
        <form id="${this.formId}" class="doc-update-creation-form">
          <label for="${this.docImageId}">File</label>
          <input name="file" type="file" id="${this.docImageId}">
          <label for="${this.docTitleId}">Title</label>
          <input name="title" type="text" id="${this.docTitleId}">
          <label for="${this.subjectId}">Subject</label>
          <select name="subject" id="${this.subjectId}">
            <option value="">All subjects</option>
            <option value="Architecture">Architecture</option>
            <option value="Tourism">Tourism</option>
            <option value="Urbanism">Urbanism</option>
          </select>
          <label for="${this.descriptionId}">Description</label>
          <textarea name="description" id="${this.descriptionId}"></textarea>
          <label for="${this.pubDateId}">Publication date</label>
          <input name="publicationDate" type="date" id="${this.pubDateId}">
          <label for="${this.refDateId}">Refering date</label>
          <input name="refDate" type="date" id="${this.refDateId}">
          <hr>
          <button type="button" id="${this.buttonPositionId}">Set position</button>
          <input type="submit" disabled value="Create" id="${this.buttonCreateId}">
        </form>
      </div>
    `;
  }

  windowCreated() {
    this.hide();

    let reference = this.view.browserWindow.window.style;
    this.window.style.top = reference.top;
    this.window.style.right = reference.right;
    this.window.style.left = reference.left;
    this.window.style.width = reference.width;

    this.formElement.onsubmit = () => {
      this._submitCreation();
      return false;
    };

    this.formElement.oninput = () => this._updateFormButtons();

    this.buttonPositionElement.onclick = () => this._startPositioningDocument();

    this._initForm();
  }

  documentWindowReady() {
    this.view.searchWindow.addDocumentsExtension('Create', {
      type: 'button',
      html: () => 'Create',
      callback: () => this.view.requestWindowDisplay(this, true)
    });
  }

  /////////////////////////
  ///// DOCUMENT POSITIONER

  /**
   * Displays the document positioning interfaces : the window positioner and
   * the document image orienter.
   * 
   * @private
   */
  _startPositioningDocument() {
    this.positioner.appendTo(this.parentElement);
    this.positioner.window.style.left = '10px';
    this.positioner.window.style.top = '10px';

    let fileReader = new FileReader();
    fileReader.onload = () => {
      this.documentImageOrienter.setImageSrc(fileReader.result);
      this.view.requestWindowDisplay(this.documentImageOrienter, false);
    };
    fileReader.readAsDataURL(this.docImageElement.files[0]);
  }

  //////////
  ///// FORM

  /**
   * Sets the initial values for the form.
   * 
   * @private
   */
  _initForm() {
    this.docImageElement.value = '';
    this.docTitleElement.value = '';
    this.subjectElement.value = '';
    this.descriptionElement.value = '';
    this.pubDateElement.value = '';
    this.refDateElement.value = '';
    this._updateFormButtons();
  }

  /**
   * Checks if the form is ready to be validated. Every entry must have a
   * non-empty value, and the camera position / orientation must have been set.
   * 
   * @private
   */
  _formValidation() {
    let data = new FormData(this.formElement);
    for (let entry of data.entries()) {
      if (!entry[1] || entry[1] === "") {
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
    if (!!this.docImageElement.value) {
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

    let data = new FormData(this.formElement);
    data.append('positionX', this.cameraPosition.x);
    data.append('positionY', this.cameraPosition.y);
    data.append('positionZ', this.cameraPosition.z);
    data.append('quaternionX', this.cameraQuaternion.x);
    data.append('quaternionY', this.cameraQuaternion.y);
    data.append('quaternionZ', this.cameraQuaternion.z);
    data.append('quaternionW', this.cameraQuaternion.w);
    
    try {
      await this.contributeService.createDocument(data);
      this.disable();
    } catch (e) {
      alert(e);
    }
  }

  /////////////
  ///// GETTERS

  get buttonPositionId() {
    return `${this.windowId}_button_position`;
  }

  get buttonPositionElement() {
    return document.getElementById(this.buttonPositionId);
  }

  get buttonCreateId() {
    return `${this.windowId}_button_creation`;
  }

  get buttonCreateElement() {
    return document.getElementById(this.buttonCreateId);
  }

  get formId() {
    return `${this.windowId}_form`;
  }

  get formElement() {
    return document.getElementById(this.formId);
  }

  get docTitleId() {
    return `${this.windowId}_title`;
  }

  get docTitleElement() {
    return document.getElementById(this.docTitleId);
  }
  
  get docImageId() {
    return `${this.windowId}_image`;
  }
  
  get docImageElement() {
    return document.getElementById(this.docImageId);
  }

  get subjectId() {
    return `${this.windowId}_subject`;
  }

  get subjectElement() {
    return document.getElementById(this.subjectId);
  }

  get descriptionId() {
    return `${this.windowId}_description`;
  }

  get descriptionElement() {
    return document.getElementById(this.descriptionId);
  }

  get pubDateId() {
    return `${this.windowId}_pub_date`;
  }

  get pubDateElement() {
    return document.getElementById(this.pubDateId);
  }

  get refDateId() {
    return `${this.windowId}_ref_date`;
  }

  get refDateElement() {
    return document.getElementById(this.refDateId);
  }
}