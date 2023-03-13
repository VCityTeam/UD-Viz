import { DocumentProvider } from '../../Core/ViewModel/DocumentProvider';
import { ContributeService } from '../Service/ContributeService';
import { findChildByID } from '../../../../../HTMLUtil';

import './Contribute.css';

/**
 * This window is used to update a document. It contains a form that allows to
 * manipulate
 */
export class DocumentUpdateWindow {
  /**
   * Creates a new document update window.
   *
   * @param {ContributeService} contributeService The contribute service to
   * perform requests.
   * @param {object} provider - document provider
   */
  constructor(contributeService, provider) {
    this.rootHtml = document.createElement('div');
    this.rootHtml.innerHTML = this.innerContentHtml;

    /**
     * The contribute service to perform requests.
     *
     * @type {ContributeService}
     */
    this.contributeService = contributeService;

    this.formElement.onsubmit = () => {
      this._submitUpdate();
      return false;
    };

    this.cancelButtonElement.onclick = () => {
      this.dispose();
    };

    this.provider = provider;
    this.provider.addEventListener(
      DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED,
      () => this.dispose()
    );
  }

  html() {
    return this.rootHtml;
  }

  dispose() {
    this.rootHtml.remove();
  }

  get innerContentHtml() {
    return /* html*/ `
      <div class="box-section">
        <h3 id="${this.docTitleId}" class="section-title"></h3>
        <div>
          <img class="inspector-doc-img" src="" alt="Document image"
            id="${this.docImageId}">
          <form id="${this.formId}" class="doc-update-creation-form">
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
            <input type="submit" value="Update">
            <button id="${this.cancelButtonId}" type="button">Cancel</button>
          </form>
        </div>
      </div>
    `;
  }

  // /////////////////////
  // /// WINDOW APPEARANCE

  /**
   * This function is called when the user clicks on the 'Update' button in a
   * document. It requests the document view to display this window, and
   * change its position to match the document browser. It also updates the
   * field values.
   *
   * @private
   */
  async updateFromDisplayedDocument() {
    // Sets doc attributes in HTML
    const doc = this.provider.getDisplayedDocument();

    if (!doc) {
      this.dispose();
      return;
    }

    this.docTitleElement.innerText = doc.title;
    this.docImageElement.src = await this.provider.getDisplayedDocumentImage();
    this.sourceElement.value = doc.source;
    this.docRightsHolderElement.value = doc.rightsHolder;
    this.descriptionElement.value = doc.description;
    this.pubDateElement.value = new Date(doc.publicationDate)
      .toISOString()
      .substring(0, 10);
    this.refDateElement.value = new Date(doc.refDate)
      .toISOString()
      .substring(0, 10);
  }

  // ///////////////
  // /// FORM SUBMIT

  /**
   * Called when the user submits the update form. Updates the document.
   *
   * @private
   */
  async _submitUpdate() {
    const data = new FormData(this.formElement);
    try {
      await this.contributeService.updateDocument(data);
    } catch (e) {
      alert(e);
    }
  }

  // ///////////
  // /// GETTERS

  get formId() {
    return `contribute_update_form`;
  }

  get formElement() {
    return findChildByID(this.rootHtml, this.formId);
  }

  get docTitleId() {
    return `contribute_update_title`;
  }

  get docTitleElement() {
    return findChildByID(this.rootHtml, this.docTitleId);
  }

  get cancelButtonId() {
    return `contribute_update_cancel`;
  }

  get cancelButtonElement() {
    return findChildByID(this.rootHtml, this.cancelButtonId);
  }

  get docImageId() {
    return `contribute_update_image`;
  }

  get docImageElement() {
    return findChildByID(this.rootHtml, this.docImageId);
  }

  get sourceId() {
    return `contribute_update_source`;
  }

  get sourceElement() {
    return findChildByID(this.rootHtml, this.sourceId);
  }

  get docRightsHolderId() {
    return `contribute_update_rights_holder`;
  }

  get docRightsHolderElement() {
    return findChildByID(this.rootHtml, this.docRightsHolderId);
  }

  get descriptionId() {
    return `contribute_update_description`;
  }

  get descriptionElement() {
    return findChildByID(this.rootHtml, this.descriptionId);
  }

  get pubDateId() {
    return `contribute_update_pub_date`;
  }

  get pubDateElement() {
    return findChildByID(this.rootHtml, this.pubDateId);
  }

  get refDateId() {
    return `contribute_update_ref_date`;
  }

  get refDateElement() {
    return findChildByID(this.rootHtml, this.refDateId);
  }
}
