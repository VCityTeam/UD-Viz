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
            id="${this.docImageId}">
          <p id="${this.docSubjectId}"></p>
          <p id="${this.docDescriptionId}"></p>
          <p>Reffering date : <span id="${this.docRefDateId}"></span></p>
          <p>Published on <span id="${this.docPubDateId}"></span></p>
        </div>
      </div>
      <div id="${this.commandPanelId}" class="box-section">

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
}