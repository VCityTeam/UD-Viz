import { AbstractDocumentWindow } from "../../../Modules/Documents/View/AbstractDocumentWindow";
import { ContributeService } from "../Service/ContributeService";
import { PositionerWindow } from "../../../Utils/Camera/PositionerWindow";

export class DocumentCreationWindow extends AbstractDocumentWindow {
  /**
   * Creates a new document creation window.
   * 
   * @param {ContributeService} contributeService The contribute service to
   * perform requests.
   */
  constructor(contributeService, itownsView, cameraControls) {
    super('Creation');


    /**
     * The contribute service to perform requests.
     * 
     * @type {ContributeService}
     */
    this.contributeService = contributeService;

    this.itownsView = itownsView;
    this.cameraControls = cameraControls;
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

    this.formElement.onsubmit = () => {
      this._submitCreation();
      return false;
    };

    this.buttonCreateElement.onclick = () => {

    };

    this.buttonPositionElement.onclick = () => {
      let positioner = new PositionerWindow(this.itowns, this.cameraControls);
    };
  }

  documentWindowReady() {
    this.view.searchWindow.addDocumentsCommand('Create', () => {
      this.view.requestWindowDisplay(this, true);
    });
  }

  //////////
  ///// FORM

  _submitCreation() {
    let data = new FormData(this.formElement);
    console.log(data);
    for (let entry of data.entries()) {
      console.log(entry);
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