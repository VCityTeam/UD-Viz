import { DocumentProvider } from '../ViewModel/DocumentProvider';
import { Document } from '../Model/Document';

import { createDisplayable } from '../../../../../HTMLUtil';

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

    /** @type {HTMLElement} */
    this.rootHtml = null;

    /** @type {HTMLElement} */
    this.docTitleElement = null;

    /** @type {HTMLElement} */
    this.docImageElement = null;

    /** @type {HTMLElement} */
    this.docDescriptionElement = null;

    /** @type {HTMLElement} */
    this.docRefDateElement = null;

    /** @type {HTMLElement} */
    this.docPubDateElement = null;

    /** @type {HTMLElement} */
    this.docSourceElement = null;

    /** @type {HTMLElement} */
    this.docRightsHolderElement = null;

    this.initHtml();

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

  initHtml() {
    this.rootHtml = document.createElement('div');
    this.rootHtml.classList.add('root-document-inspector');

    {
      // title
      this.docTitleElement = document.createElement('div');
      this.rootHtml.appendChild(this.docTitleElement);

      // image
      this.docImageElement = document.createElement('img');
      this.docImageElement.title = 'CTRL + Click to open the image';
      this.rootHtml.appendChild(this.docImageElement);

      // displayable details
      const displayableDetails = createDisplayable('Details');
      this.rootHtml.appendChild(displayableDetails.parent);
      {
        const addDetailsField = (label) => {
          // title
          const title = document.createElement('p');
          title.innerText = label;
          displayableDetails.container.appendChild(title);

          // content
          const content = document.createElement('p');
          displayableDetails.container.appendChild(content);

          return content;
        };

        this.docDescriptionElement = addDetailsField('Description');
        this.docRefDateElement = addDetailsField('Refering Date');
        this.docPubDateElement = addDetailsField('Publication Date');
        this.docSourceElement = addDetailsField('Source');
        this.docRightsHolderElement = addDetailsField('Rights holder');
      }
    }
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
}
