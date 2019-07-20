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
     * Represents a list of extensions. An extension can either be a button or
     * a panel.
     * 
     * @type {Object.<string, {
     *  type: 'button' | 'panel',
     *  label: string,
     *  id: string,
     *  callback?: (doc: Document) => any,
     *  html: string
     * }>}
     */
    this.extensions = {};
  }

  get innerContentHtml() {
    return /*html*/`
      <div class="box-section">
        <h3 id="${this.docTitleId}" class="section-title"></h3>
        <div>
          <img class="browser-doc-img" src="" alt="Document image"
            id="${this.docImageId}" title="CTRL + Click to open the image">
          <input type="checkbox" class="spoiler-check" id="doc-details-spoiler" checked>
          <label for="doc-details-spoiler" class="subsection-title">Details</label>
          <div class="search-form spoiler-box">
            <p id="${this.docSubjectId}"></p>
            <p id="${this.docDescriptionId}"></p>
            <p>Reffering date : <span id="${this.docRefDateId}"></span></p>
            <p>Published on <span id="${this.docPubDateId}"></span></p>
          </div>
        </div>
      </div>
      <div id="${this.extensionContainerId}">

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

    // Add extensions
    for (let extension of Object.values(this.extensions)) {
      this._createExtensionElement(extension);
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

  /////////////////////////////////
  ///// NAVIGATION SECTION (ARROWS)

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

  /////////////////////////
  ///// DOCUMENT EXTENSIONS

  /**
   * Creates a new extension for the document browser. An extension can be
   * either a command button or a panel. An extension should be identified by
   * a unique label.
   * 
   * @param {string} label The extension label.
   * @param {object} options The extension options
   * @param {string} options.type The type of the option. Can be either `button`
   * or `panel`.
   * @param {string} options.html The inside HTML of the
   * extension. For a button, this will be the displayed text. For a panel, it
   * will be the inside HTML.
   * @param {(doc: Document) => any} [options.callback] The callback to call
   * for a button.
   */
  addDocumentExtension(label, options) {
    if (!!this.extensions[label]) {
      throw 'Extension already exists : ' + label;
    }
    options.label = label;
    options.id = label.replace(/ +/, ' ').toLowerCase();
    this.extensions[label] = options;

    if (this.isCreated) {
      this._createExtensionElement(options);
    }
  }

  /**
   * Removes an existing extension.
   * 
   * @param {string} label The extension label.
   */
  removeDocumentExtension(label) {
    let extension = this.extensions[label];
    if (!extension) {
      throw 'Extension does not exist : ' + label;
    }

    let element = document.getElementById(extension.id);
    if (element) {
      element.parentElement.removeChild(element);
    }
    delete this.extensions[label];
  }

  /**
   * Proceeds to create an extension. If this is a button, it will be added to
   * the commands panel. If this is a panel, it will be pushed under the
   * document description.
   * 
   * @private
   * 
   * @param {object} extension 
   * @param {string} extension.type The type of the option. Can be either `button`
   * or `panel`.
   * @param {string} extension.id The id of the element.
   * @param {string} extension.label The label of the extension.
   * @param {string} extension.html The inside HTML of the
   * extension. For a button, this will be the displayed text. For a panel, it
   * will be the inside HTML.
   * @param {(doc: Document) => any} [extension.callback] The callback to call
   * for a button.
   */
  _createExtensionElement(extension) {
    if (extension.type === 'button') {
      let button = document.createElement('button');
      button.id = extension.id;
      button.innerHTML = extension.html;
      button.onclick = () =>
        extension.callback(this.provider.getDisplayedDocument());
      this.commandPanelElement.appendChild(button);
    } else if (extension.type === 'panel') {
      let panel = document.createElement('div');
      panel.id = extension.id;
      panel.innerHTML = extension.html;
      panel.className = 'box-section';
      this.extensionContainerElement.appendChild(panel);
    } else {
      throw 'Invalid extension type : ' + extension.type;
    }
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

  get extensionContainerId() {
    return `${this.windowId}_extensions`;
  }

  get extensionContainerElement() {
    return document.getElementById(this.extensionContainerId);
  }
}