import { DocumentModule } from "../../Documents/DocumentModule";
import { LinkService } from "../Model/LinkService";
import { DocumentProvider } from "../../Documents/ViewModel/DocumentProvider";
import { Document } from "../../Documents/Model/Document";
import { TilesManager } from "../../../Utils/3DTiles/TilesManager";
import { CityObject } from "../../../Utils/3DTiles/Model/CityObject";
import { focusCameraOn } from "../../../Utils/Camera/CameraUtils";
import { Window } from "../../../Utils/GUI/js/Window";

/**
 * Represents the links section in the browser window.
 */
export class DocumentLinkView {
  /**
   * Creates the document link view.
   * 
   * @param {DocumentModule} documentModule The document module.
   * @param {LinkService} linkService The link service.
   * @param {TilesManager} tilesManager The tiles manager.
   * @param {*} itownsView The iTowns view.
   * @param {*} cameraControls The planar camera controls.
   */
  constructor(documentModule, linkService, tilesManager, itownsView,
    cameraControls) {
    documentModule.addInspectorExtension('Links', {
      type: 'panel',
      html: this._getLinksHtml()
    });

    /**
     * The link service.
     * 
     * @type {LinkService}
     */
    this.linkService = linkService;

    /**
     * The tiles manager.
     * 
     * @type {TilesManager}
     */
    this.tilesManager = tilesManager;
    this.tilesManager.registerStyle('selection', {
      materialProps: {
        color: 0xffcc00
      }
    });
    this.tilesManager.registerStyle('highlight', {
      materialProps: {
        color: 0x00ccff
      }
    });

    /**
     * The iTowns view.
     */
    this.itownsView = itownsView;

    /**
     * The planar camera controls.
     */
    this.cameraControls = cameraControls;

    /**
     * Wether the user is currently selecting a city object.
     * 
     * @type {boolean}
     */
    this.isSelecting = false;

    /**
     * The currently selected city object.
     * 
     * @type {CityObject}
     */
    this.selectedCityObject = undefined;

    /**
     * The mouse click listener. This arrow function is needed so we can hold
     * a reference to the method.
     * 
     * @type {(event: MouseEvent) => void}
     */
    this.mouseClickLister = (event) => this._onMouseClick(event);

    /**
     * The document provider.
     * 
     * @type {DocumentProvider}
     */
    this.documentProvider = documentModule.provider;

    documentModule.provider.addEventListener(
      DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED,
      (doc) => this._updateLinkList(doc));

    documentModule.view.inspectorWindow.addEventListener(Window.EVENT_CREATED,
      () => this._initLinkCreation());
  }

  /**
   * Returns the HTML of the links section in the deocument browser.
   */
  _getLinksHtml() {
    return /*html*/`
      <input type="checkbox" class="spoiler-check" id="doc-link-spoiler">
      <label for="doc-link-spoiler" class="section-title">Document Links</label>
      <div class="spoiler-box">
        <div id="${this.linkTableDivId}">
        
        </div>
        <div>
          <h4 class="subsection-title">Create a new document link</h4>
          <button id="${this.selectBuildingButtonId}">Select city object</button>
          <button id="${this.createLinkButtonId}">Create link</button>
          <p id="${this.selectedBuildingParagraphId}"></p>
        </div>
      </div>`;
  }

  ///////////////////
  ///// LINK CREATION

  /**
   * Binds the link creation buttons to their events and update the selected
   * city object section.
   */
  _initLinkCreation() {
    this.selectBuildingButtonElement.onclick = () => {
      this._toggleBuildingSelection();
    };

    this.createLinkButtonElement.onclick = () => {
      this._createLink();
    };

    this._updateLinkCreationHtml();
  }

  /**
   * Toggles the building selection.  
   * When selecting a building, the mouse cursor position will be used to fetch
   * building IDs under it, and a mouse click will trigger the selection of a
   * building.
   */
  _toggleBuildingSelection() {
    this.isSelecting = !this.isSelecting;
    if (this.isSelecting) {
      this.linkTableDivElement.style.opacity = 0.5;
      this.linkTableDivElement.style.pointerEvents = 'none';
      this.selectBuildingButtonElement.innerText = 'Cancel';
      window.addEventListener('mousedown', this.mouseClickLister);
    } else {
      this.linkTableDivElement.style.opacity = 1;
      this.linkTableDivElement.style.pointerEvents = 'auto';
      this.selectBuildingButtonElement.innerText = 'Select building';
      this.selectedBuildingParagraphElement.innerText = '';
      this.selectedCityObject = undefined;
      window.removeEventListener('mousedown', this.mouseClickLister);
    }
    this._updateLinkCreationHtml();
    this.tilesManager.removeAllStyles();
    this.tilesManager.applyStyles();
  }

  /**
   * If the user is currently hovering a building, fetches the building info
   * and colors the building. If a building was already selected, it returns to
   * its original coloring.
   * 
   * @param {MouseEvent} event The mouse event.
   */
  _onMouseClick(event) {
    let cityObject = this.tilesManager.pickCityObject(event);
    if (!cityObject) {
      return;
    }
    this.selectedCityObject = cityObject;
    this._updateLinkCreationHtml();
    this.tilesManager.removeAllStyles();
    this.tilesManager.setStyle(cityObject.cityObjectId, 'selection');
    this.tilesManager.applyStyles();
  }

  /**
   * Update the inside HTML of the "Link Creation" section according to the
   * currently selected city object.
   */
  _updateLinkCreationHtml() {
    if (!this.selectedCityObject) {
      this.selectedBuildingParagraphElement.innerHTML = '';
      this.createLinkButtonElement.disabled = true;
    } else {
      this.selectedBuildingParagraphElement.innerHTML = /*html*/`
        Selected building ID : ${this.selectedCityObject.props['cityobject.database_id']}<br>
        Tile ID : ${this.selectedCityObject.tileId}<br>
        Batch ID : ${this.selectedCityObject.batchId}
      `;
      this.createLinkButtonElement.disabled = false;
    }
  }

  /**
   * Creates a new link with a city object, using the currently selected
   * building ID.
   */
  async _createLink() {
    if (!this.selectedCityObject) {
      throw 'No selected city object.';
    }
    
    let formData = new FormData();
    formData.append('source_id', this.documentProvider.getDisplayedDocument().id);
    formData.append('target_id', this.selectedCityObject.props['cityobject.database_id']);
    let centroid = this.selectedCityObject.centroid;
    formData.append('centroid_x', centroid.x);
    formData.append('centroid_y', centroid.y);
    formData.append('centroid_z', centroid.z);
    try {
      await this.linkService.createLink('city_object', formData);
      await this.documentProvider.refreshDocumentList();
      this._toggleBuildingSelection();
    } catch (e) {
      alert(`Could not create the link : ${e}`);
    }
  }

  /**
   * Retrieves all link types, and for each type retrieves the links were the
   * source id is the same as the current document. The links are then displayed
   * in the window. Two buttons are created for each link, called "highlight"
   * and "travel". Clicking on the "highlight" button triggers the
   * `highlightLink` method, while the "travel" button calls the `travelToLink`
   * method.
   * 
   * @param {Document} doc The current document.
   */
  async _updateLinkList(doc) {
    this.linkTableDivElement.innerHTML = '';

    if (!doc) {
      this.selectBuildingButtonElement.disabled = true;
      return;
    }

    this.selectBuildingButtonElement.disabled = false;
    let filters = {
      source_id: doc.id
    };

    let linkTypes = await this.linkService.getSupportedLinkTypes();
    for (let type of linkTypes) {
      let newDiv = document.createElement('div');
      let newDivHtml = `<h4 class="subsection-title">Type : ${type}</h4>
                        <ul>`;
      let links = await this.linkService.getLinks(type, filters);
      for (let link of links) {
        newDivHtml += `<li>
                          ID : ${link.target_id}
                          <span id="${this.linkHighlighterId(type, link)}" class="clickable-text">
                          highlight
                          </span>
                          <span id="${this.linkTravelerId(type, link)}" class="clickable-text">
                          travel
                          </span>
                          <span id="${this.linkDeleterId(type, link)}" class="clickable-text">
                          delete
                          </span>
                        </li>`;
      }
      newDivHtml += '</ul>';
      newDiv.innerHTML = newDivHtml;
      this.linkTableDivElement.appendChild(newDiv);
      for (let link of links) {
        document.getElementById(this.linkHighlighterId(type, link)).onclick = () => {
          this._highlightLink(type, link);
        };
        document.getElementById(this.linkTravelerId(type, link)).onclick = () => {
          this._travelToLink(type, link);
        };
        document.getElementById(this.linkDeleterId(type, link)).onclick = () => {
          this._deleteLink(type, link);
        };
      }
    }
  }

  ////////////////////
  ///// LINK OPERATION

  /**
   * If the target of the link is a city object, highlights it by changing its
   * color. If a building was previously selected, its color is removed first.
   * 
   * @param {string} type The link target type.
   * @param {any} link The actual link, with `id`, `source_id` and `target_id`
   * properties.
   */
  async _highlightLink(type, link) {
    if (type === 'city_object') {
      this.tilesManager.update();
      let targetId = Number(link.target_id);
      let cityObject = this.tilesManager.findCityObject(
        (co) => co.props["cityobject.database_id"] === targetId);

      if (!cityObject) {
        throw 'No city object found';
      }

      this.tilesManager.removeAllStyles();
      this.tilesManager.setStyle(cityObject.cityObjectId, 'highlight');
      this.tilesManager.applyStyles();
    }
  }

  /**
   * If the target is a city object, moves the camera to focus on its centroid.
   * 
   * @param {string} type The link target type.
   * @param {any} link The actual link, with `id`, `source_id` and `target_id`
   */
  async _travelToLink(type, link) {
    if (type === 'city_object') {
      let centroid = new THREE.Vector3(link.centroid_x, link.centroid_y,
        link.centroid_z);
      await focusCameraOn(this.itownsView, this.cameraControls, centroid,
        {duration: 1});
    }
  }

  /**
   * Deletes the link.
   * 
   * @param {string} type The link target type.
   * @param {any} link The actual link, with `id`, `source_id` and `target_id`.
   */
  async _deleteLink(type, link) {
    if (confirm('Are you sure you want to delete this link ?')) {
      try {
        await this.linkService.deleteLink(type, link.id);
        await this.documentProvider.refreshDocumentList();
      } catch (e) {
        alert(`Failed to detete link : ${e}`);
      }
    }
  }

  //////////////
  ////// GETTERS

  get linkTableDivId() {
    return `${this.windowId}_link_tables`;
  }

  get linkTableDivElement() {
    return document.getElementById(this.linkTableDivId);
  }

  linkHighlighterId(type, link) {
    return `${this.linkTableDivId}_${type}_${link.id}_highlight`;
  }

  linkTravelerId(type, link) {
    return `${this.linkTableDivId}_${type}_${link.id}_travel`;
  }

  linkDeleterId(type, link) {
    return `${this.linkTableDivId}_${type}_${link.id}_delete`;
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