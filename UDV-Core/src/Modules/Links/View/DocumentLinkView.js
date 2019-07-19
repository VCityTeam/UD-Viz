import { DocumentModule } from "../../Documents/DocumentModule";
import { LinkService } from "../Service/LinkService";
import { DocumentProvider } from "../../Documents/ViewModel/DocumentProvider";
import { Document } from "../../Documents/Model/Document";
import { TilesManager } from "../../../Utils/3DTiles/TilesManager";
import { CityObjectID } from "../../../Utils/3DTiles/Model/CityObject";
import { focusCameraOn } from "../../../Utils/Camera/CameraUtils";

export class DocumentLinkView {
  /**
   * 
   * @param {DocumentModule} documentModule The document module.
   * @param {LinkService} linkService The link service.
   * @param {TilesManager} tilesManager The tiles manager.
   * @param {*} itownsView The iTowns view.
   * @param {*} cameraControls The planar camera controls.
   */
  constructor(documentModule, linkService, tilesManager, itownsView,
    cameraControls) {
    documentModule.addBrowserExtension('Links', {
      type: 'panel',
      html: this._getLinksHtml()
    });

    this.linkService = linkService;

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

    this.itownsView = itownsView;
    this.cameraControls = cameraControls;

    documentModule.provider.addEventListener(
      DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED,
      (doc) => this._fetchLinks(doc));
  }

  _getLinksHtml() {
    return /*html*/`
      <div id="${this.linkTableDivId}">
      
      </div>
      <hr>
      <div>
        <h3>Create a new link</h3>
        <button id="${this.selectBuildingButtonId}">Select building</button>
        <button id="${this.createLinkButtonId}">Create link</button>
        <p id="${this.hoveredBuildingParagraphId}">No building</p>
        <p id="${this.selectedBuildingParagraphId}"></p>
      </div>`;
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
  async _fetchLinks(doc) {
    let currentDocument = doc;
    if (!!currentDocument) {
      let filters = {
        source_id: currentDocument.id
      };

      this.linkTableDivElement.innerHTML = '';

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
        this.linkTableDivElement.appendChild(newDiv);
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

  ////// LINK OPERATION

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
      this.tilesManager.removeAllStyles();
      let cityObjectId = undefined;
      for (let tile of Object.values(this.tilesManager.tiles)) {
        for (let cityObject of Object.values(tile.cityObjects)) {
          if (cityObject.props['cityobject:database_id'] === link.target_id) {
            cityObjectId = cityObject.cityObjectId;
            break;
          }
        }
      }

      if (!cityObjectId) {
        throw 'No city object found';
      }

      this.tilesManager.setStyle(cityObjectId, 'highlight');
      this.tilesManager.applyStyles();
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
  async deleteLink(type, link) {
    if (confirm('Are you sure you want to delete this link ?')) {
      try {
        await this.linkService.deleteLink(type, link.id);
        await this.fetchLinks();
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