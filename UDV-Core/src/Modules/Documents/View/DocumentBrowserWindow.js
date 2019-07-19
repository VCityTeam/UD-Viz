import { DocumentProvider } from "../ViewModel/DocumentProvider";
import { Document } from "../Model/Document";
import { AbstractDocumentWindow } from "./AbstractDocumentWindow";

/**
 * The window responsible for displaying the currently displayed document, as
 * defined in the document provider. It also serves as a container to add
 * extension buttons.
 */
export class DocumentBrowserWindow extends AbstractDocumentWindow {
  /**
   * Constructs a documents browser window.
   */
  constructor() {
    super('Browser');

    /**
     * @type {Array<{
     *   label: string,
     *   callback: (doc: Document) => any
     * }>}
     */
    this.extensionCommands = [];
  }

  get innerContentHtml() {
    return /*html*/`
      <div class="box-section">
        <h3 id="${this.docTitleId}" class="section-title"></h3>
        <div>
          <img class="browser-doc-img" src="" alt="Document image"
            id="${this.docImageId}" title="CTRL + Click to open the image">
          <p id="${this.docSubjectId}"></p>
          <p id="${this.docDescriptionId}"></p>
          <p>Reffering date : <span id="${this.docRefDateId}"></span></p>
          <p>Published on <span id="${this.docPubDateId}"></span></p>
        </div>
      </div>
      <div class="box-section">
        <div id="${this.commandPanelId}">

        </div>
        <hr>
        <div class="browser-arrows-panel">
          <div class="left-arrow">
            <span class="clickable-text" id="${this.leftArrowId}">
              &#9666 <span id="${this.leftArrowTextId}"></span>
            </span>
          </div>
          <div class="right-arrow">
            <span class="clickable-text" id="${this.rightArrowId}">
              <span id="${this.rightArrowTextId}"></span> &#9656
            </span>
          </div>
        </div>
      </div>
    `;
  }

  windowCreated() {
    this.window.style.left = 'unset';
    this.window.style.right = '10px';
    this.window.style.top = '10px';
    this.window.style.width = '390px';

    // Add extension commands
    for (let command of this.extensionCommands) {
      this._createCommandButton(command.label, command.callback);
    }

    this.docImageElement.onclick = (event) => {
      if (event.ctrlKey) {
        window.open(this.docImageElement.src);
      }
    };
  }

  documentWindowReady() {
    this.provider.addEventListener(DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED,
      (doc) => this.onDisplayedDocumentChange(doc));
  }

  ///////////////////////
  ///// DOCUMENT HANDLING

  /**
   * Triggered when the displayed document change. Updates the HTML fields.
   * 
   * @param {Document} newDocument The new displayed document.
   */
  async onDisplayedDocumentChange(newDocument) {
    if (!newDocument) {
      this._setDefaultFieldValues();
      this._updateNavigationArrows(undefined);
      return;
    }

    this._fillFieldsFromDocument(newDocument);
    this._updateNavigationArrows(newDocument);
  }

  /**
   * Sets the default values for the HTML fields.
   */
  _setDefaultFieldValues() {
    this.docTitleElement.innerText = 'No document found';
    this.docDescriptionElement.innerText = '';
    this.docSubjectElement.innerText = '';
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
    this.docSubjectElement.innerText = newDocument.subject;
    this.docPubDateElement.innerText =
      (new Date(newDocument.publicationDate)).toLocaleDateString();
    this.docRefDateElement.innerText =
      (new Date(newDocument.refDate)).toLocaleDateString();
    this.docImageElement.src = await this.provider.getDisplayedDocumentImage();
  }

  /**
   * Updates the navigation arrows so that they point to the next / previous
   * documents. If there isn't a displayed document, of if this is the only
   * document, the arrows are disabled.
   * 
   * @param {Document} currentDocument The current document.
   */
  _updateNavigationArrows(currentDocument) {
    let docs = this.provider.getFilteredDocuments();

    if (!currentDocument || docs.length <= 1) {
      this.leftArrowTextElement.innerText = '';
      this.rightArrowTextElement.innerText = '';
      this.leftArrowElement.onclick = undefined;
      this.rightArrowElement.onclick = undefined;
      return;
    }

    let currentDocId = docs.findIndex((doc) => doc.id === currentDocument.id);
    let nextDocId = (docs.length + (currentDocId + 1)) % docs.length;
    let prevDocId = (docs.length + (currentDocId - 1)) % docs.length;

    this.leftArrowTextElement.innerText = docs[prevDocId].title;
    this.rightArrowTextElement.innerText = docs[nextDocId].title;

    this.leftArrowElement.onclick = () =>
      this.provider.shiftDisplayedDocumentIndex(-1);
    this.rightArrowElement.onclick = () =>
      this.provider.shiftDisplayedDocumentIndex(1);
  }

  ////////////////////////
  ///// DOCUMENT EXTENSION

  /**
   * Adds a command (button) in the browser window. The callback will be called
   * when the user presses the button. The current document will be passed as
   * parameter.
   * 
   * @param {string} label The button label.
   * @param {(doc: Document) => any} callback The callback to call when the
   * button is pressed. The current displayed document is passed as parameter.
   */
  addDocumentCommand(label, callback) {
    this.extensionCommands.push({
      label, callback
    });
    if (this.isCreated) {
      this._createCommandButton(label, callback);
    }
  }

  removeDocumentCommand(label) {
    let index = this.extensionCommands.findIndex((command) =>
      command.label === label);
    if (index < 0) {
      throw 'Cannot remove command: label does not exist (' + label + ')';
    }

    this.extensionCommands.splice(index, 1);
    if (this.isCreated) {
      let buttonId = label.replace(/ +/, '_').toLowerCase();
      let button = this.commandPanelElement.querySelector(`#${buttonId}`);
      this.commandPanelElement.removeChild(button);
    }
  }

  /**
   * Creates the command button.
   * 
   * @private
   * 
   * @param {string} label The button label.
   * @param {(doc: Document) => any} callback The callback to call when the
   * button is pressed.
   */
  _createCommandButton(label, callback) {
    let button = document.createElement('button');
    button.id = label.replace(/ +/, '_').toLowerCase();
    button.innerText = label;
    button.onclick = () => {
      callback(this.provider.getDisplayedDocument());
    };
    this.commandPanelElement.appendChild(button);
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

  get commandPanelId() {
    return `${this.windowId}_commands`
  }

  get commandPanelElement() {
    return document.getElementById(this.commandPanelId);
  }

  get leftArrowId() {
    return `${this.windowId}_left_arrow`;
  }

  get leftArrowElement() {
    return document.getElementById(this.leftArrowId);
  }

  get leftArrowTextId() {
    return `${this.windowId}_left_arrow_text`;
  }

  get leftArrowTextElement() {
    return document.getElementById(this.leftArrowTextId);
  }

  get rightArrowId() {
    return `${this.windowId}_right_arrow`;
  }

  get rightArrowElement() {
    return document.getElementById(this.rightArrowId);
  }

  get rightArrowTextId() {
    return `${this.windowId}_right_arrow_text`;
  }

  get rightArrowTextElement() {
    return document.getElementById(this.rightArrowTextId);
  }
}