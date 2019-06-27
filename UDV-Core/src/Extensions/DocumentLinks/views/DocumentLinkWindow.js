import { Window } from "../../../Utils/GUI/js/Window";
import { LinkVisualizationService } from '../../LinkVisualization/services/LinkVisualizationService';
import { DocumentController } from "../../../Modules/ConsultDoc/DocumentController";

import './DocumentLink.css';

export class DocumentLinkWindow extends Window {
  /**
   * Creates a document link window to extend functionnalities of the consult
   * doc module.
   * 
   * @param {LinkVisualizationService} linkVisualizationService The link
   * visualization service.
   * @param { DocumentController } documentController The document controller.
   */
  constructor(linkVisualizationService, documentController) {
    super('document-links', 'Document - Links', false);

    this.linkVisualizationService = linkVisualizationService;
    this.documentController = documentController;

    // Adds the window to the view and hide it
    this.appendTo(this.documentController.parentElement);
    this.disable();

    // Add a button in the document browser to enable this window
    this.documentController.documentBrowser.addEventListener(
      Window.EVENT_CREATED, () => {
      let linkButton = document.createElement('button');
      linkButton.id = this.documentBrowserLinkButtonId;
      linkButton.innerText = "Links";
      document.getElementById(this.documentController.documentBrowser.browserTabID)
        .appendChild(linkButton);
      document.getElementById(this.documentBrowserLinkButtonId).onclick = () => {
        this.enable();
        this.documentController.documentBrowser.hide();
        this.documentController.documentResearch.hide();
      };
    });

    // When this window is closed, open the document browser
    this.addEventListener(Window.EVENT_DISABLED, () => {
      this.documentController.documentBrowser.show();
      this.documentController.documentResearch.show();
    });

    // When the window is created, fetch and display the links
    this.addEventListener(Window.EVENT_CREATED, () => {
      this.fetchLinks();
    });
  }

  get innerContentHtml() {
    return /*html*/`
      <div id="${this.linkTablesDivId}">
      </div>
      <hr>
      <div>
        <h3>Create a new link</h3>
        <button>Select building</button>
        <p>No building selected</p>
        <button>Create link</button>
      </div>
    `;
  }

  windowCreated() {
    if (this.documentController.documentBrowser.isCreated) {
      let reference = this.documentController.documentBrowser.window.style;
      this.window.style.left = reference.left;
      this.window.style.right = reference.right;
      this.window.style.top = reference.top;
      this.window.style.width = reference.width;
    }
  }

  async fetchLinks() {
    let currentDocument = this.documentController.currentDoc;
    console.log(currentDocument);
    if (!!currentDocument) {
      let filters = new FormData();
      filters.append('source_id', currentDocument.id);

      let linkTypes = await this.linkVisualizationService.getSupportedLinkTypes();
      for (let type of linkTypes) {
        let newDiv = document.createElement('div');
        let newDivHtml = `<h3>${type}</h3><table><tr><th>Source</th><th>Target</th></tr>`;
        let links = await this.linkVisualizationService.getLinks(type, filters);
        for (let link of links) {
          let linkSelectorId = this.linkSelectorId(type, link);
          newDivHtml += `<tr id="${linkSelectorId}" class="link-selector"><td>${link.source_id}</td><td>${link.target_id}</td></tr>`;
        }
        newDivHtml += '</table>';
        newDiv.innerHTML = newDivHtml;
        this.linkTablesDivElement.appendChild(newDiv);
        for (let link of links) {
          let linkSelectorId = this.linkSelectorId(type, link);
          document.getElementById(linkSelectorId).onclick = () => {
            this.selectLink(type, link);
          };
        }
      }
    }
  }

  async selectLink(type, link) {
    console.log('Select link :');
    console.log(link);
  }

  ////// GETTERS

  get documentBrowserLinkButtonId() {
    return 'document-browser-link-button';
  }

  get linkTablesDivId() {
    return `${this.windowId}_link_tables`;
  }

  get linkTablesDivElement() {
    return document.getElementById(this.linkTablesDivId);
  }

  linkSelectorId(type, link) {
    return `${this.linkTablesDivId}_${type}_${link.id}`;
  }
}