import { Window } from "../../../Utils/GUI/js/Window";
import { LinkVisualizationService } from '../../LinkVisualization/services/LinkVisualizationService';
import { DocumentController } from "../../../Modules/ConsultDoc/DocumentController";
import { getTileInLayer, getTileInTileset, removeTileVerticesColor,
  updateITownsView, getFirstTileIntersection } from '../../../Utils/3DTiles/3DTilesUtils'
import { getTilesBuildingInfo, colorBuilding, getBuildingIdFromIntersection } from '../../../Utils/3DTiles/3DTilesBuildingUtils'

import './DocumentLink.css';

export class DocumentLinkWindow extends Window {
  /**
   * Creates a document link window to extend functionnalities of the consult
   * doc module. This window has two main functionnalities :
   * 
   * 1. Visualize all links where the source is the current document. For links
   * with city objects, highlight the target buildings with a different color.
   * 2. Create new links between the current document and city objects. The
   * selection is done with the mouse.
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
    this.highlightColor = [0, 0.9, 1];
    this.highlightedBuildingInfo = null;

    // Building selection
    this.isSelectingBuilding = false;
    this.hoveredBuildingId = null;
    this.selectionColor = [1, 0.6, 0];
    this.selectedBuildingId = null;
    this.selectedBuildingInfo = null;
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
    // highlighted, selected building. If we were in the selection process, exit
    // it.
    this.addEventListener(Window.EVENT_DISABLED, () => {
      this.clearHighlightedBuilding();
      this.clearSelectedBuilding();
      if (this.isSelectingBuilding) {
        this.toggleBuildingSelection();
      }
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
        <button id="${this.selectBuildingButtonId}">Select building</button>
        <button id="${this.createLinkButtonId}">Create link</button>
        <p id="${this.hoveredBuildingParagraphId}">No building</p>
        <p id="${this.selectedBuildingParagraphId}"></p>
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
    this.selectBuildingButtonElement.onclick = () => {
      this.toggleBuildingSelection();
    };
    this.createLinkButtonElement.onclick = () => {
      this.createLink();
    };
    this.createLinkButtonElement.style.display = 'none';
  }

  /**
   * Retrieves all link types, and for each type retrieves the links were the
   * source id is the same as the current document. The links are then displayed
   * in the window. Each link listen to momuse clicks and call the `selectLink`
   * method when clicked.
   */
  async fetchLinks() {
    let currentDocument = this.documentController.currentDoc;
    if (!!currentDocument) {
      let filters = new FormData();
      filters.append('source_id', currentDocument.id);

      this.linkTablesDivElement.innerHTML = '';

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
        this.clearHighlightedBuilding();
        try {
          colorBuilding(this.layer, buildingInfo, this.highlightColor);
          updateITownsView(this.itownsView);
          this.highlightedBuildingInfo = buildingInfo;
        } catch (_) {
          alert('Building is not currently in the view.');
        }
      }
    }
  }

  /**
   * Toggles the building selection.  
   * When selecting a building, the mouse cursor position will be used to fetch
   * building IDs under it, and a mouse click will trigger the selection of a
   * building.
   */
  toggleBuildingSelection() {
    this.isSelectingBuilding = !this.isSelectingBuilding;
    if (this.isSelectingBuilding) {
      if (this.isCreated) {
        this.linkTablesDivElement.style.opacity = 0.5;
        this.linkTablesDivElement.style.pointerEvents = 'none';
        this.selectBuildingButtonElement.innerText = 'Cancel';
        this.createLinkButtonElement.style.display = 'initial';
      }
      window.addEventListener('mousemove', this.mouseMoveListener);
      window.addEventListener('mousedown', this.mouseClickListener);
      this.clearHighlightedBuilding();
    } else {
      if (this.isCreated) {
        this.linkTablesDivElement.style.opacity = 1;
        this.linkTablesDivElement.style.pointerEvents = 'auto';
        this.selectBuildingButtonElement.innerText = 'Select building';
        this.createLinkButtonElement.style.display = 'none';
        this.hoveredBuildingParagraphElement.innerText = 'No building';
        this.selectedBuildingParagraphElement.innerText = '';
      }
      window.removeEventListener('mousemove', this.mouseMoveListener);
      window.removeEventListener('mousedown', this.mouseClickListener);
      this.clearSelectedBuilding();
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
        this.hoveredBuildingParagraphElement.innerText =
          `Building ID : ${buildingId}`;
      } else {
        this.hoveredBuildingId = null;
        this.hoveredBuildingParagraphElement.innerText = 'No building';
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
        this.tbi = getTilesBuildingInfo(this.layer, this.tbi);
        let buildingInfo = this.tbi.buildings[buildingId];
        if (!!buildingInfo) {
          this.selectedBuildingParagraphElement.innerHTML = /*html*/`
            Selected building ID : ${buildingId}<br>
            Tile ID : ${buildingInfo.tileId}
          `;
          this.clearSelectedBuilding();
          colorBuilding(this.layer, buildingInfo, this.selectionColor);
          updateITownsView(this.itownsView);
          this.selectedBuildingId = buildingId;
          this.selectedBuildingInfo = buildingInfo;
        }
      }
    }
  }

  /**
   * Creates a new link with a city object, using the currently selected
   * building ID.
   */
  async createLink() {
    if (!!this.selectedBuildingId) {
      let formData = new FormData();
      formData.append('source_id', this.documentController.currentDoc.id);
      formData.append('target_id', this.selectedBuildingId);
      try {
        await this.linkVisualizationService.createLink('city_object', formData);
        this.fetchLinks();
        this.toggleBuildingSelection();
      } catch (e) {
        alert(`Could not create the link : ${e}`);
      }
    } else {
      this.selectedBuildingParagraphElement.innerText =
        'Please select a building.';
    }
  }

  /**
   * Removes the coloring of the current highlighted building.
   */
  clearHighlightedBuilding() {
    if (!!this.highlightedBuildingInfo) {
      let tile = getTileInTileset(this.tbi.tileset,
        this.highlightedBuildingInfo.tileId);
      if (!!tile) {
        removeTileVerticesColor(tile);
        updateITownsView(this.itownsView);
      }
      this.highlightedBuildingInfo = null;
    }
  }

  /**
   * Removes the coloring of the current selected building.
   */
  clearSelectedBuilding() {
    if (!!this.selectedBuildingId) {
      let tile = getTileInTileset(this.tbi.tileset,
        this.selectedBuildingInfo.tileId);
      if (!!tile) {
        removeTileVerticesColor(tile);
        updateITownsView(this.itownsView);
      }
      this.selectedBuildingId = null;
      this.selectedBuildingInfo = null;
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

  get hoveredBuildingParagraphId() {
    return `${this.windowId}_hovered_building_p`;
  }

  get hoveredBuildingParagraphElement() {
    return document.getElementById(this.hoveredBuildingParagraphId);
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