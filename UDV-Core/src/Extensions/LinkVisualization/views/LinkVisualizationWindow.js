import { Window } from "../../../Utils/GUI/js/Window";
import { LinkVisualizationService } from "../services/LinkVisualizationService";
import { getTileInLayer, removeTileVerticesColor, updateITownsView } from '../../../Utils/3DTiles/3DTilesUtils'
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
    this.selectedBuildingInfo = null;

    this.layer = itownsView.getLayerById('3d-tiles-layer');
    this.tbi = null;
    this.selectedColor = [0, 1, 0];

    this.addEventListener(Window.EVENT_DISABLED, () => {
      if (!!this.selectedBuildingInfo) {
        let tile = getTileInLayer(this.layer, this.selectedBuildingInfo.tileId);
        if (!!tile) {
          removeTileVerticesColor(tile);
          updateITownsView(this.itownsView);
        }
        this.selectedBuildingInfo = null;
      }
    });
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

  /**
   * Retrieve all link categories, and all links in each category. For each
   * link type, a table is created to display the source and target IDs of the
   * links. Each row of the created table listen to mouse clicks and call the
   * method `selectLink` when clicked.
   */
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
          let linkSelectorId = `link-selector-${type}-${link.id}`;
          newDivHtml += `<tr id="${linkSelectorId}" class="link-selector"><td>${link.source_id}</td><td>${link.target_id}</td></tr>`;
        }
        newDivHtml += '</table>';
        newDiv.innerHTML = newDivHtml;
        this.linksDivElement.appendChild(newDiv);
        for (let link of links) {
          let linkSelectorId = `link-selector-${type}-${link.id}`;
          document.getElementById(linkSelectorId).onclick = () => {
            this.selectLink(type, link);
          }
        }
      }
    }
  }

  /**
   * If the link is of type 'city_object', colors the corresponding building in
   * the scene.
   * 
   * @param {string} type The link type.
   * @param {*} link The link itself (with `id`, `source_id` and `target_id`
   * properties).
   */
  async selectLink(type, link) {
    if (type === 'city_object') {
      this.tbi = getTilesBuildingInfo(this.layer, this.tbi);
      let buildingId = link.target_id;
      let buildingInfo = this.tbi.buildings[buildingId];
      if (!!buildingInfo) {
        if (!!this.selectedBuildingInfo) {
          let tile = getTileInLayer(this.layer, this.selectedBuildingInfo.tileId);
          if (!!tile) {
            removeTileVerticesColor(tile);
          }
        }

        try {
          colorBuilding(this.layer, buildingInfo, this.selectedColor);
          updateITownsView(this.itownsView);
          this.selectedBuildingInfo = buildingInfo;
        } catch (_) {
          alert('Building is not currently in the view.');
        }
      }
    }
  }

  async createLink() {
    
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