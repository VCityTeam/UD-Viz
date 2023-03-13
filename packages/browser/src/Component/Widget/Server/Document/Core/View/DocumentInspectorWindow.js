import { DocumentProvider } from '../ViewModel/DocumentProvider';
import { Document } from '../Model/Document';

import { findChildByID } from '../../../../../HTMLUtil';

/**
 * @typedef {object} DocumentInspectorExtension
 * @property {string} type 'panel | 'button'
 * @property {string} [container] The container for extension buttons
 * @property {string} id ID
 * @property {import('../DocumentModule').cbInspectorOptionsExtension} callback Callback on extension options
 */
/**
 * @class The window responsible for displaying the currently displayed document, as
 * defined in the document provider. It also serves as a container to add
 * extension buttons.
 */
export class DocumentInspectorWindow {
  /**
   * Constructs a documents inspector window.
   *
   * @param {object} provider - document provider
   */
  constructor(provider) {
    this.provider = provider;

    this.rootHtml = document.createElement('div');
    this.rootHtml.innerHTML = this.innerContentHtml;

    /**
     * Represents a list of extensions. An extension can either be a button or
     * a panel.
     *
     * @type {Object<string, DocumentInspectorExtension>}
     */
    this.extensions = {};

    // Add extensions
    for (const extension of Object.values(this.extensions)) {
      this._createExtensionElement(extension);
    }

    this.docImageElement.onclick = (event) => {
      if (event.ctrlKey) {
        window.open(this.docImageElement.src);
      }
    };

    this.provider.addEventListener(
      DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED,
      (doc) => this.onDisplayedDocumentChange(doc)
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
        <h3 class="section-title"><span id="${this.docTitleId}"></span></h3>
        <div>
          <img class="inspector-doc-img" src="" alt="Document image"
            id="${this.docImageId}" title="CTRL + Click to open the image">
          <input type="checkbox" class="spoiler-check" id="doc-details-spoiler" checked>
          <label for="doc-details-spoiler" class="subsection-title">Details</label>
          <div class="inspector-details spoiler-box" style="max-height: 250px; overflow-y: auto;">
            <p class="inspector-field-title">Description</p>
            <p class="inspector-field" id="${this.docDescriptionId}"></p>
            <p class="inspector-field-title">Refering date</p>
            <p class="inspector-field" id="${this.docRefDateId}"></p>
            <p class="inspector-field-title">Publication date</p>
            <p class="inspector-field" id="${this.docPubDateId}"></p>
            <p class="inspector-field-title">Source</p>
            <p class="inspector-field" id="${this.docSourceId}"></p>
            <p class="inspector-field-title">Rights holder</p>
            <p class="inspector-field" id="${this.docRightsHolderId}"></p>
          </div>
          <div class="inspector-left-right-grid">
            <div data-ext-container="left" class="text-left">
            </div>
            <div data-ext-container="right" class="text-right">
            </div>
          </div>
        </div>
      </div>
      <div data-ext-container="panel"
        data-ext-container-default="div"
        data-ext-class="box-section">

      </div>
    `;
  }

  // /////////////////////
  // /// DOCUMENT HANDLING

  /**
   * Triggered when the displayed document change. Updates the HTML fields.
   *
   * @param {Document} newDocument The new displayed document.
   */
  async onDisplayedDocumentChange(newDocument) {
    if (!newDocument) {
      this._setDefaultFieldValues();
      return;
    }

    this._fillFieldsFromDocument(newDocument);
  }

  /**
   * Sets the default values for the HTML fields.
   */
  _setDefaultFieldValues() {
    this.docTitleElement.innerText = 'No document found';
    this.docDescriptionElement.innerText = '';
    this.docSourceElement.innerText = '';
    this.docRightsHolderElement.innerText = '';
    this.docPubDateElement.innerText = '';
    this.docRefDateElement.innerText = '';
    this.docImageElement.src = '';
  }

  /**
   * Updates the HTML fields so that they describe the new displayed document.
   *
   * @param {Document} newDocument The new displayed document.
   */
  async _fillFieldsFromDocument(newDocument) {
    this.docTitleElement.innerText = newDocument.title;
    this.docDescriptionElement.innerText = newDocument.description;
    this.docSourceElement.innerText = newDocument.source;
    this.docRightsHolderElement.innerText = newDocument.rightsHolder;
    this.docPubDateElement.innerText = new Date(
      newDocument.publicationDate
    ).toLocaleDateString();
    this.docRefDateElement.innerText = new Date(
      newDocument.refDate
    ).toLocaleDateString();
    this.docImageElement.src = await this.provider.getDisplayedDocumentImage();
  }

  // ///////////
  // /// GETTERS

  get docTitleId() {
    return `document_inspector_title`;
  }

  get docTitleElement() {
    return findChildByID(this.rootHtml, this.docTitleId);
  }

  get docDescriptionId() {
    return `document_inspector_desc`;
  }

  get docDescriptionElement() {
    return findChildByID(this.rootHtml, this.docDescriptionId);
  }

  get docSourceId() {
    return `document_inspector_source`;
  }

  get docSourceElement() {
    return findChildByID(this.rootHtml, this.docSourceId);
  }

  get docRightsHolderId() {
    return `document_inspector_rights_holder`;
  }

  get docRightsHolderElement() {
    return findChildByID(this.rootHtml, this.docRightsHolderId);
  }

  get docPubDateId() {
    return `document_inspector_pub_date`;
  }

  get docPubDateElement() {
    return findChildByID(this.rootHtml, this.docPubDateId);
  }

  get docRefDateId() {
    return `document_inspector_ref_date`;
  }

  get docRefDateElement() {
    return findChildByID(this.rootHtml, this.docRefDateId);
  }

  get docImageId() {
    return `document_inspector_image`;
  }

  get docImageElement() {
    return findChildByID(this.rootHtml, this.docImageId);
  }
}
