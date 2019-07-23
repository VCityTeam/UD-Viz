import { AbstractDocumentWindow } from "../../../Modules/Documents/View/AbstractDocumentWindow";
import { ContributeService } from "../Service/ContributeService";

import "./Contribute.css";
import { DocumentProvider } from "../../../Modules/Documents/ViewModel/DocumentProvider";

/**
 * This window is used to update a document. It contains a form that allows to
 * manipulate 
 */
export class DocumentUpdateWindow extends AbstractDocumentWindow {
  /**
   * Creates a new document update window.
   * 
   * @param {ContributeService} contributeService The contribute service to
   * perform requests.
   */
  constructor(contributeService) {
    super('Update');

    /**
     * The contribute service to perform requests.
     * 
     * @type {ContributeService}
     */
    this.contributeService = contributeService;
  }

  get innerContentHtml() {
    return /*html*/`
      <div class="box-section">
        <h3 id="${this.docTitleId}" class="section-title"></h3>
        <div>
          <img class="browser-doc-img" src="" alt="Document image"
            id="${this.docImageId}">
          <form id="${this.formId}" class="doc-update-creation-form">
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
            <input type="submit" value="Update">
            <button id="${this.cancelButtonId}" type="button">Cancel</button>
          </form>
        </div>
      </div>
    `;
  }

  windowCreated() {
    this.hide();

    this.formElement.onsubmit = () => {
      this._submitUpdate();
      return false;
    };

    this.cancelButtonElement.onclick = () => {
      this.disable();
    }
  }

  documentWindowReady() {
    this.view.inspectorWindow.addDocumentExtension('Update', {
      type: 'button',
      html: 'Update',
      callback: () => this._initWindow()
    });

    this.provider.addEventListener(DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED,
      () => this.disable());
  }

  ///////////////////////
  ///// WINDOW APPEARANCE

  /**
   * This function is called when the user clicks on the 'Update' button in a
   * document. It requests the document view to display this window, and
   * change its position to match the document browser. It also updates the
   * field values.
   * 
   * @private
   */
  async _initWindow() {
    // Request the display
    this.view.requestWindowDisplay(this, true);

    // Sets the position according to the browser (reference)
    let reference = getComputedStyle(this.view.inspectorWindow.window);
    this.window.style.top = reference.top;
    this.window.style.left = reference.left;
    this.window.style.right = reference.right;
    this.window.style.width = reference.width;

    // Sets doc attributes in HTML
    let doc = this.provider.getDisplayedDocument();

    if (!doc) {
      this.disable();
      return;
    }

    this.docTitleElement.innerText = doc.title;
    this.docImageElement.src =
      await this.provider.getDisplayedDocumentImage();
    this.subjectElement.value = doc.subject;
    this.descriptionElement.value = doc.description;
    this.pubDateElement.value = (new Date(doc.publicationDate))
      .toISOString().substring(0, 10);
    this.refDateElement.value = (new Date(doc.refDate))
      .toISOString().substring(0, 10);
  }

  /////////////////
  ///// FORM SUBMIT

  /**
   * Called when the user submits the update form. Updates the document.
   * 
   * @private
   */
  async _submitUpdate() {
    let data = new FormData(this.formElement);
    try {
      await this.contributeService.updateDocument(data);
    } catch (e) {
      alert(e);
    }
  }

  /////////////
  ///// GETTERS

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
  
  get cancelButtonId() {
    return `${this.windowId}_cancel`;
  }

  get cancelButtonElement() {
    return document.getElementById(this.cancelButtonId);
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