import { DocumentProvider } from "../ViewModel/DocumentProvider";
import { Document } from "../Model/Document";
import { AbstractDocumentWindow } from "./AbstractDocumentWindow";

/**
 * The window responsible for displaying the currently displayed document, as
 * defined in the document provider. It also serves as a container to add
 * extension buttons.
 */
export class DocumentInspectorWindow extends AbstractDocumentWindow {
  /**
   * Constructs a documents inspector window.
   */
  constructor() {
    super('Inspector');

    /**
     * Represents a list of extensions. An extension can either be a button or
     * a panel.
     * 
     * @type {Object.<string, {
     *  type: 'button' | 'panel',
     *  container?: string,
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
        <h3 class="section-title">Title: <span id="${this.docTitleId}"></span></h3>
        <div>
          <img class="inspector-doc-img" src="" alt="Document image"
            id="${this.docImageId}" title="CTRL + Click to open the image">
          <input type="checkbox" class="spoiler-check" id="doc-details-spoiler" checked>
          <label for="doc-details-spoiler" class="subsection-title">Details</label>
          <div class="inspector-details spoiler-box">
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
            <div data-extension-container="left" class="text-left">
            </div>
            <div data-extension-container="right" class="text-right">
            </div>
          </div>
        </div>
      </div>
      <div data-extension-container="panel"
        data-extension-panel-class="box-section">

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
    this.docPubDateElement.innerText =
      (new Date(newDocument.publicationDate)).toLocaleDateString();
    this.docRefDateElement.innerText =
      (new Date(newDocument.refDate)).toLocaleDateString();
    this.docImageElement.src = await this.provider.getDisplayedDocumentImage();
  }

  /////////////////////////
  ///// DOCUMENT EXTENSIONS

  /**
   * Creates a new extension for the document inspector. An extension can be
   * either a command button or a panel. An extension should be identified by
   * a unique label.
   * 
   * @param {string} label The extension label.
   * @param {object} options The extension options
   * @param {string} options.type The type of the option. Can be either `button`
   * or `panel`.
   * @param {string} [options.container] The parent element to place the
   * extension in the window. For buttons, the position can be either `left`
   * or `right`.
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
   * @param {string} [extension.container] The parent element to place the
   * extension in the window. For buttons, the position can be either `left`
   * or `right`.
   * @param {string} extension.id The id of the element.
   * @param {string} extension.label The label of the extension.
   * @param {string} extension.html The inside HTML of the
   * extension. For a button, this will be the displayed text. For a panel, it
   * will be the inside HTML.
   * @param {(doc: Document) => any} [extension.callback] The callback to call
   * for a button.
   */
  _createExtensionElement(extension) {
    let containerName = extension.container || extension.type;
    let container = this.innerContent
      .querySelector(`[data-extension-container="${containerName}"]`);
    if (!container) {
      throw 'Container does not exist in inspector : ' + containerName;
    }
    if (extension.type === 'button') {
      let button = document.createElement('button');
      button.id = extension.id;
      button.innerHTML = extension.html;
      button.onclick = () =>
        extension.callback(this.provider.getDisplayedDocument());
      container.appendChild(button);
    } else if (extension.type === 'panel') {
      let panel = document.createElement('div');
      panel.id = extension.id;
      panel.innerHTML = extension.html;
      panel.className = container.dataset.extensionPanelClass;
      container.appendChild(panel);
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

  get docSourceId() {
    return `${this.windowId}_source`
  }

  get docSourceElement() {
    return document.getElementById(this.docSourceId);
  }

  get docRightsHolderId() {
    return `${this.windowId}_rights_holder`
  }

  get docRightsHolderElement() {
    return document.getElementById(this.docRightsHolderId);
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