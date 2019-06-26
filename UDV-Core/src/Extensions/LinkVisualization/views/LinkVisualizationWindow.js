import { Window } from "../../../Utils/GUI/js/Window";
import { LinkVisualizationService } from "../services/LinkVisualizationService";
import { } from '../../../Utils/3DTiles/3DTilesUtils'
import { getTilesBuildingInfo, colorBuilding } from '../../../Utils/3DTiles/3DTilesBuildingUtils'

import './LinksVisualizationStyle.css';

export class LinkVisualizationWindow extends Window {
  /**
   * Creates a new link visualization window.
   * 
   * @param {LinkVisualizationService} linkVisualizationService 
   * @param {View} itownsView The iTowns view.
   */
  constructor(linkVisualizationService, itownsView) {
    super('link_visu', 'Link Visualization', false);
    this.linkVisualizationService = linkVisualizationService;
    this.itownsView = itownsView;

    this.layer = itownsView.getLayerById('3d-tiles-layer');
    this.tbi = null;
    this.selectedColor = [1, 0, 0];
  }

  get innerContentHtml() {
    return `
      <div>
        <button id="${this.fetchLinksButtonId}">Fetch</button>
        <button id="${this.createLinkButtonId}">Create</button>
      </div>
      <div id="${this.linksDivId}">

      </div>
    `
  }

  windowCreated() {
    this.fetchLinksButtonElement.onclick = () => { this.fetchLinks() };
    this.createLinkButtonElement.onclick = () => { this.createLink() };
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
    this.tbi = getTilesBuildingInfo(this.layer);
    console.log(this.tbi);
    let buildingId = link.target_id;
    console.log(buildingId);
    let buildingInfo = this.tbi.buildings[buildingId];
    console.log(buildingInfo);
    console.log(this.layer);
    if (!!buildingInfo) {
      colorBuilding(this.layer, buildingInfo, [0, 1, 0]);
      this.itownsView.notifyChange();
    }
  }

  async createLink() {
    console.log('Create link !!');
  }

  get fetchLinksButtonId() {
    return `${this.windowId}_button_fetch`;
  }

  get fetchLinksButtonElement() {
    return document.getElementById(this.fetchLinksButtonId);
  }

  get createLinkButtonId() {
    return `${this.windowId}_button_create`;
  }

  get createLinkButtonElement() {
    return document.getElementById(this.createLinkButtonId);
  }

  get linksDivId() {
    return `${this.windowId}_links_div`;
  }

  get linksDivElement() {
    return document.getElementById(this.linksDivId);
  }
}