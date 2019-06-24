import { Window } from "../../../Utils/GUI/js/Window";
import { LinkVisualizationService } from "../services/LinkVisualizationService";

import './LinksVisualizationStyle.css';

export class LinkVisualizationWindow extends Window {
  /**
   * Creates a new link visualization window.
   * 
   * @param {LinkVisualizationService} linkVisualizationService 
   */
  constructor(linkVisualizationService) {
    super('link_visu', 'Link Visualization', false);
    this.linkVisualizationService = linkVisualizationService;
  }

  get innerContentHtml() {
    return `
      <div>
        <button id="${this.fetchLinksButtonId}">Fetch</button>
      </div>
      <div id="${this.linksDivId}">

      </div>
    `
  }

  windowCreated() {
    this.fetchLinksButtonElement.onclick = () => { this.fetchLinks() };
  }

  async fetchLinks() {
    if (this.isCreated) {
      this.linksDivElement.innerHTML = '';
      let types = await this.linkVisualizationService.getSupportedLinkTypes();
      for (let type of types) {
        let links = await this.linkVisualizationService.getLinks(type);
        let newDiv = document.createElement('div');
        newDiv.className = 'links-lister';
        let newDivHtml = `<h3>${type}</h3><table><tr><th>Source</th><th>Target</th></tr>`;
        for (let link of links) {
          let linkSelectorId = `link-selector-${link.id}`;
          newDivHtml += `<tr id="${linkSelectorId}" class="link-selector"><td>${link.source_id}</td><td>${link.target_id}</td></tr>`;
        }
        newDivHtml += '</table>';
        newDiv.innerHTML = newDivHtml;
        this.linksDivElement.appendChild(newDiv);
        for (let link of links) {
          let linkSelectorId = `link-selector-${link.id}`;
          document.getElementById(linkSelectorId).onclick = () => {
            this.selectLink(link);
          }
        }
      }
    }
  }

  async selectLink(link) {
    console.log('Selected link : ');
    console.log(link);
  }

  get fetchLinksButtonId() {
    return `${this.windowId}_button_fetch`;
  }

  get fetchLinksButtonElement() {
    return document.getElementById(this.fetchLinksButtonId);
  }

  get linksDivId() {
    return `${this.windowId}_links_div`;
  }

  get linksDivElement() {
    return document.getElementById(this.linksDivId);
  }
}