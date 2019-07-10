import { Window } from "../../../Utils/GUI/js/Window";
import { LinkService } from "../services/LinkService";
import { DocumentController } from "../../../Modules/ConsultDoc/DocumentController";
import { getTilesInfo, getTileInTileset, removeTileVerticesColor,
  updateITownsView, getFirstTileIntersection, getObject3DFromTile,
  getBatchIdFromIntersection } from '../../../Utils/3DTiles/3DTilesUtils'
import { colorBuilding, getBuildingIdFromIntersection, getBuildingInfoFromBuildingId } from '../../../Utils/3DTiles/3DTilesBuildingUtils'

import './DocumentLink.css';
import { Vector3 } from "three";
import { focusCameraOn } from "../../../Utils/Camera/CameraUtils";

export class DocumentLinkWindow extends Window {
  /**
   * Creates a document link window to extend functionnalities of the consult
   * doc module. This window has several functionnalities :
   * 
   * 1. Visualize all links where the source is the current document. For links
   * with city objects, highlight the target buildings with a different color.
   * 2. Create new links between the current document and city objects. The
   * selection is done with the mouse.
   * 3. Delete an existing link associated to the current document.
   * 
   * @param {LinkService} linkService The link service.
   * visualization service.
   * @param { DocumentController } documentController The document controller.
   * @param {*} itownsView The iTowns view.
   * @param {*} controls The iTowns planar controls.
   */
  constructor(linkService, documentController, itownsView, controls) {
    super('document-links', 'Document - Links', false);

    this.linkService = linkService;
    this.documentController = documentController;

    // Adds the window to the view and hide it
    this.appendTo(this.documentController.parentElement);
    this.disable();

    // Elements to manipulate iTowns and 3DTiles
    this.itownsView = itownsView;
    this.controls = controls;
    this.layer = itownsView.getLayerById('3d-tiles-layer');
    // See the file at `Utils/3DTiles/3DTilesUtils.md` for documentation
    // about TilesInformation
    this.tilesInfo = null;
    this.highlightColor = [0, 0.9, 1];
    this.highlightedTileId = null;
    this.highlightedBatchId = null;
    this.highlightedBuildingInfo = null;

    // Building selection
    this.isSelectingBuilding = false;
    this.hoveredTileId = null;
    this.hoveredBatchId = null;
    this.selectionColor = [1, 0.6, 0];
    this.selectedTileId = null;
    this.selectedBatchId = null;
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
   * in the window. Two buttons are created for each link, called "highlight"
   * and "travel". Clicking on the "highlight" button triggers the
   * `highlightLink` method, while the "travel" button calls the `travelToLink`
   * method.
   */
  async fetchLinks() {
    let currentDocument = this.documentController.getCurrentDoc();
    if (!!currentDocument) {
      let filters = {
        source_id: currentDocument.id
      };

      this.linkTablesDivElement.innerHTML = '';

      let linkTypes = await this.linkService.getSupportedLinkTypes();
      for (let type of linkTypes) {
        let newDiv = document.createElement('div');
        let newDivHtml = `<h3>Type : ${type}</h3>
                          <ul>`;
        let links = await this.linkService.getLinks(type, filters);
        for (let link of links) {
          newDivHtml += `<li>
                           ID : ${link.target_id}
                           <span id="${this.linkHighlighterId(type, link)}" class="link-selector">
                            highlight
                           </span>
                           <span id="${this.linkTravelerId(type, link)}" class="link-selector">
                            travel
                           </span>
                           <span id="${this.linkDeleterId(type, link)}" class="link-selector">
                            delete
                           </span>
                         </li>`;
        }
        newDivHtml += '</ul>';
        newDiv.innerHTML = newDivHtml;
        this.linkTablesDivElement.appendChild(newDiv);
        for (let link of links) {
          document.getElementById(this.linkHighlighterId(type, link)).onclick = () => {
            this.highlightLink(type, link);
          };
          document.getElementById(this.linkTravelerId(type, link)).onclick = () => {
            this.travelToLink(type, link);
          };
          document.getElementById(this.linkDeleterId(type, link)).onclick = () => {
            this.deleteLink(type, link);
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
  async highlightLink(type, link) {
    if (type === 'city_object') {
      this.tilesInfo = getTilesInfo(this.layer, this.tilesInfo);
      let buildingId = link.target_id;
      let buildingInfo = getBuildingInfoFromBuildingId(this.tilesInfo,
        Number.parseInt(buildingId));
      if (!!buildingInfo) {
        this.clearHighlightedBuilding();
        try {
          colorBuilding(this.layer, buildingInfo, this.highlightColor);
          updateITownsView(this.itownsView, this.layer);
          this.highlightedTileId = buildingInfo.tileId;
          this.highlightedBatchId = buildingInfo.batchId;
          this.highlightedBuildingInfo = buildingInfo;
        } catch (_) {
          alert('Building is not currently in the view. Travel to it first');
        }
      } else {
        alert('Building was not loaded by iTowns. Please navigate in the city' +
          ' to make sure the building has been loaded at least once.');
      }
    }
  }

  /**
   * If the target is a city object, moves the camera to focus on its centroid.
   * 
   * @param {string} type The link target type.
   * @param {any} link The actual link, with `id`, `source_id` and `target_id`
   */
  async travelToLink(type, link) {
    if (type === 'city_object') {
      this.tilesInfo = getTilesInfo(this.layer, this.tilesInfo);
      let centroid = new THREE.Vector3(link.centroid_x, link.centroid_y,
        link.centroid_z);
      await focusCameraOn(this.itownsView, this.controls, centroid,
        {duration: 1});
    }
  }

  /**
   * Deletes the link.
   * 
   * @param {string} type The link target type.
   * @param {any} link The actual link, with `id`, `source_id` and `target_id`.
   */
  async deleteLink(type, link) {
    if (confirm('Are you sure you want to delete this link ?')) {
      try {
        await this.linkService.deleteLink(type, link.id);
        if (this.highlightedTileId === link.target_id) {
          this.clearHighlightedBuilding();
        }
        await this.fetchLinks();
      } catch (e) {
        alert(`Failed to detete link : ${e}`);
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
    // Check if the mouse is in the canvas (ie. the iTowns view). This will
    // avoid unnecessary computations.
    if (event.target.nodeName.toUpperCase() === 'CANVAS') {
      let intersections = this.itownsView.pickObjectsAt(event, 5);
      let firstInter = getFirstTileIntersection(intersections);
      if (!!firstInter) {
        let tileId = getObject3DFromTile(firstInter.object).tileId;
        let batchId = getBatchIdFromIntersection(firstInter);
        let buildingId = getBuildingIdFromIntersection(firstInter);
        this.hoveredTileId = tileId;
        this.hoveredBatchId = batchId;
        this.hoveredBuildingParagraphElement.innerText =
          `Building ID : ${buildingId}`;
      } else {
        this.hoveredTileId = null;
        this.hoveredBatchId = null;
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
    // Check if the mouse is in the canvas (ie. the iTowns view). This will
    // avoid unnecessary computations.
    if (event.target.nodeName.toUpperCase() === 'CANVAS') {
      let tileId = this.hoveredTileId;
      let batchId = this.hoveredBatchId;
      if (!!tileId) {
        this.tilesInfo = getTilesInfo(this.layer, this.tilesInfo);
        let buildingInfo = this.tilesInfo.tiles[tileId][batchId];
        if (!!buildingInfo) {
          this.selectedBuildingParagraphElement.innerHTML = /*html*/`
            Selected building ID : ${buildingInfo.props['cityobject.database_id']}<br>
            Tile ID : ${buildingInfo.tileId}<br>
            Batch ID : ${buildingInfo.batchId}
          `;
          this.clearSelectedBuilding();
          colorBuilding(this.layer, buildingInfo, this.selectionColor);
          updateITownsView(this.itownsView, this.layer);
          this.selectedTileId = tileId;
          this.selectedBatchId = batchId;
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
    if (!!this.selectedTileId) {
      let formData = new FormData();
      formData.append('source_id', this.documentController.getCurrentDoc().id);
      formData.append('target_id', this.tilesInfo
        .tiles[this.selectedTileId][this.selectedBatchId]
        .props['cityobject.database_id']);
      let centroid = this.selectedBuildingInfo.centroid;
      formData.append('centroid_x', centroid.x);
      formData.append('centroid_y', centroid.y);
      formData.append('centroid_z', centroid.z);
      try {
        await this.linkService.createLink('city_object', formData);
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
      let tile = getTileInTileset(this.tilesInfo.tileset,
        this.highlightedBuildingInfo.tileId);
      if (!!tile) {
        removeTileVerticesColor(tile);
        updateITownsView(this.itownsView, this.layer);
      }
      this.highlightedTileId = null;
      this.highlightedBatchId = null;
      this.highlightedBuildingInfo = null;
    }
  }

  /**
   * Removes the coloring of the current selected building.
   */
  clearSelectedBuilding() {
    if (!!this.selectedTileId) {
      let tile = getTileInTileset(this.tilesInfo.tileset,
        this.selectedBuildingInfo.tileId);
      if (!!tile) {
        removeTileVerticesColor(tile);
        updateITownsView(this.itownsView, this.layer);
      }
      this.selectedTileId = null;
      this.selectedBatchId = null;
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

  linkHighlighterId(type, link) {
    return `${this.linkTablesDivId}_${type}_${link.id}_highlight`;
  }

  linkTravelerId(type, link) {
    return `${this.linkTablesDivId}_${type}_${link.id}_travel`;
  }

  linkDeleterId(type, link) {
    return `${this.linkTablesDivId}_${type}_${link.id}_delete`;
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