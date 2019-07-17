import { Window } from "../../../Utils/GUI/js/Window";
import { DocumentProvider } from "../ViewModel/DocumentProvider";
import { Document } from "../Model/Document";

export class DocumentBrowserWindow extends Window {
  /**
   * Constructs a documents browser window.
   * 
   * @param {DocumentProvider} provider The document provider.
   */
  constructor(provider) {
    super('document2-browser', 'Document - Browser', true);

    /**
     * The document provider.
     * 
     * @type {DocumentProvider}
     */
    this.provider = provider;

    this.provider.addEventListener(DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED,
      (doc) => this.onDisplayedDocumentChange(doc));
  }

  get innerContentHtml() {
    return /*html*/`
      <div>
        <h3 id="${this.docTitleId}"></h3>
        <div>
          <img src="" alt="Document image" id="${this.docImageId}">
          <p id="${this.docSubjectId}"></p>
          <p id="${this.docDescriptionId}"></p>
          <p>Reffering date : <span id="${this.docRefDateId}"></span></p>
          <p>Published on <span id="${this.docPubDateId}"></span></p>
        </div>
      </div>
      <div>

      </div>
    `;
  }

  windowCreated() {
    //TODO : move in a CSS file
    this.docImageElement.style.width = '100%';
  }

  ///////////////////////
  ///// DOCUMENT HANDLING

  /**
   * Triggered when the displayed document change.
   * 
   * @param {Document} newDocument The new displayed document.
   */
  async onDisplayedDocumentChange(newDocument) {
    if (newDocument === undefined) {
      return;
    }

    this.docTitleElement.innerHTML = newDocument.title;
    this.docDescriptionElement.innerHTML = newDocument.description;
    this.docSubjectElement.innerHTML = newDocument.subject;
    this.docPubDateElement.innerHTML =
      (new Date(newDocument.publicationDate)).toLocaleDateString();
    this.docRefDateElement.innerHTML =
      (new Date(newDocument.refDate)).toLocaleDateString();
    this.docImageElement.src = await this.provider.getDisplayedDocumentImage();
  }

  /////////////
  ///// GETTERS

  get docTitleId() {
    return `${this.windowId}_title`
  }

  get docTitleElement() {
    return document.getElementById(this.docTitleId);
  }

  get docDescriptionId() {
    return `${this.windowId}_desc`
  }

  get docDescriptionElement() {
    return document.getElementById(this.docDescriptionId);
  }

  get docSubjectId() {
    return `${this.windowId}_subject`
  }

  get docSubjectElement() {
    return document.getElementById(this.docSubjectId);
  }

  get docPubDateId() {
    return `${this.windowId}_pub_date`
  }

  get docPubDateElement() {
    return document.getElementById(this.docPubDateId);
  }

  get docRefDateId() {
    return `${this.windowId}_ref_date`
  }

  get docRefDateElement() {
    return document.getElementById(this.docRefDateId);
  }

  get docImageId() {
    return `${this.windowId}_image`;
  }

  get docImageElement() {
    return document.getElementById(this.docImageId);
  }
}