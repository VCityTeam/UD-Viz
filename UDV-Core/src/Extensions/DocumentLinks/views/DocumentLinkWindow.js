import { Window } from "../../../Utils/GUI/js/Window";
import { LinkVisualizationService } from '../../LinkVisualization/services/LinkVisualizationService';
import { DocumentController } from "../../../Modules/ConsultDoc/DocumentController";
import { getTileInLayer, removeTileVerticesColor, updateITownsView } from '../../../Utils/3DTiles/3DTilesUtils'
import { getTilesBuildingInfo, colorBuilding } from '../../../Utils/3DTiles/3DTilesBuildingUtils'

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
  constructor(linkVisualizationService, documentController, itownsView) {
    super('document-links', 'Document - Links', false);

    this.linkVisualizationService = linkVisualizationService;
    this.documentController = documentController;

    // Adds the window to the view and hide it
    this.appendTo(this.documentController.parentElement);
    this.disable();

    // Elements to manipulate iTowns and 3DTiles
    this.itownsView = itownsView;
    this.layer = itownsView.getLayerById('3d-tiles-layer');
    this.tbi = null;
    this.selectedColor = [0, 0.8, 1];
    this.selectedBuildingInfo = null;

    // Building selection
    this.isSelectingBuilding = false;
    this.hoveredBuildingId = null;
    this.mouseMoveListener = (event) => { this.onMouseMove(event) };
    this.mouseClickListener = (event) => { this.onMouseClick(event) };

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

    // When this window is closed, open the document browser and clear the
    // selected building
    this.addEventListener(Window.EVENT_DISABLED, () => {
      this.documentController.documentBrowser.show();
      this.documentController.documentResearch.show();
      if (!!this.selectedBuildingInfo) {
        let tile = getTileInLayer(this.layer, this.selectedBuildingInfo.tileId);
        if (!!tile) {
          removeTileVerticesColor(tile);
          updateITownsView(this.itownsView);
        }
        this.selectedBuildingInfo = null;
      }
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
        <button id="${this.selectBuildingButtonId}">Select building</button>
        <p id="${this.selectedBuildingParagraphId}">No building selected</p>
        <button id="${this.createLinkButtonId}">Create link</button>
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
    this.createLinkButtonElement.onclick = () => {
      this.toggleBuildingSelection();
    };
  }

  /**
   * Retrieves all link types, and for each type retrieves the links were the
   * source id is the same as the current document. The links are then displayed
   * in the window. Each link listen to momuse clicks and call the `selectLink`
   * method when clicked.
   */
  async fetchLinks() {
    let currentDocument = this.documentController.currentDoc;
    console.log(currentDocument);
    if (!!currentDocument) {
      let filters = new FormData();
      filters.append('source_id', currentDocument.id);

      let linkTypes = await this.linkVisualizationService.getSupportedLinkTypes();
      for (let type of linkTypes) {
        let newDiv = document.createElement('div');
        let newDivHtml = `<h3>Type : ${type}</h3>
                          <ul>`;
        let links = await this.linkVisualizationService.getLinks(type, filters);
        for (let link of links) {
          let linkSelectorId = this.linkSelectorId(type, link);
          newDivHtml += `<li id="${linkSelectorId}" class="link-selector">
                           ID : ${link.target_id}
                         </li>`;
        }
        newDivHtml += '</ul>';
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

  /**
   * If the target of the link is a city object, highlights it by changing its
   * color. If a building was previously selected, its color is removed first.
   * 
   * @param {string} type The link target type.
   * @param {any} link The actual link, with `id`, `source_id` and `target_id`
   * properties.
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

  toggleBuildingSelection() {
    this.isSelectingBuilding = !this.isSelectingBuilding;
    if (this.isSelectingBuilding) {
      this.linkTablesDivElement.style.opacity = 0.5;
      this.linkTablesDivElement.style.pointerEvents = 'none';
      this.createLinkButtonElement.innerText = 'Cancel';
      window.addEventListener('mousemove', this.mouseMoveListener);
      window.addEventListener('mousedown', this.mouseClickListener);
    } else {
      this.linkTablesDivElement.style.opacity = 1;
      this.linkTablesDivElement.style.pointerEvents = 'auto';
      this.createLinkButtonElement.innerText = 'Select building';
      window.removeEventListener('mousemove', this.mouseMoveListener);
      window.removeEventListener('mousedown', this.mouseClickListener);
    }
  }

  /**
   * If the user is currently hovering a building, fetches the building ID and
   * displays it in the window.
   * 
   * @param {MouseEvent} event The mouse event.
   */
  onMouseMove(event) {
    if (event.target.nodeName.toUpperCase() === 'CANVAS') {
      let intersections = this.itownsView.pickObjectsAt(event, 5);
      let firstInter = getFirstTileIntersection(intersections);
      if (!!firstInter) {
        let buildingId = getBuildingIdFromIntersection(firstInter);
        this.hoveredBuildingId = buildingId;
        this.selectedBuildingParagraphElement.innerText =
          `Building ID : ${buildingId}`;
      } else {
        this.hoveredBuildingId = null;
        this.selectedBuildingParagraphElement.innerText = 'No building';
      }
    }
  }

  /**
   * If the user is currently hovering a building, fetches the building info
   * and colors the building. If a building was already selected, it returns to
   * its original coloring.
   * 
   * @param {MouseEvent} event The mouse event.
   */
  onMouseClick(event) {
    if (event.target.nodeName.toUpperCase() === 'CANVAS') {
      let buildingId = this.hoveredBuildingId;
      if (!!buildingId) {
        let buildingInfo = this.tbi.buildings[buildingId];
        if (!!buildingInfo) {
          console.log(buildingInfo);
          this.clickDivElement.innerHTML = /*html*/`
            Building ID : ${buildingId}<br>
            ${buildingInfo.arrayIndexes.length} array indexes<br>
            Tile ID : ${buildingInfo.tileId}
          `;
          if (!!this.selectedBuildingInfo) {
            let tile = getTileInTileset(this.tbi.tileset,
                                        this.selectedBuildingInfo.tileId);
            removeTileVerticesColor(tile);
          }
          colorBuilding(this.layer, buildingInfo, this.selectedColor);
          updateITownsView(this.itownsView);
          this.selectedBuildingInfo = buildingInfo;
        } else {
          this.clickDivElement.innerText = 'No building info (maybe update TBI ?)';
        }
      }
    }
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

  get selectBuildingButtonId() {
    return `${this.windowId}_button_select_building`;
  }

  get selectBuildingButtonElement() {
    return document.getElementById(this.selectBuildingButtonId);
  }

  get selectedBuildingParagraphId() {
    return `${this.windowId}_selected_building_p`;
  }

  get selectedBuildingParagraphElement() {
    return document.getElementById(this.selectedBuildingParagraphId);
  }

  get createLinkButtonId() {
    return `${this.windowId}_button_create_link`;
  }

  get createLinkButtonElement() {
    return document.getElementById(this.createLinkButtonId);
  }
}