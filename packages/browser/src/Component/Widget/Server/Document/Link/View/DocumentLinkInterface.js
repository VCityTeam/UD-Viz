import * as THREE from 'three';
import { focusCameraOn } from '../../../../../Itowns/Component/Component';
import { DocumentProvider } from '../../Core/ViewModel/DocumentProvider';
import { Link } from '../Model/Link';
import { LinkProvider } from '../ViewModel/LinkProvider';

import {
  createDisplayable,
  createLabelInput,
  findChildByID,
} from '../../../../../HTMLUtil';

/**
 * The interface extensions for the document windows.
 */
export class DocumentLinkInterface {
  /**
   * Constructs the document link interface.
   *
   * @param {LinkProvider} linkProvider The link provider.
   * @param {import('itowns').PlanarView} itownsView The iTowns view.
   * @param {import('itowns').PlanarControls} cameraControls The camera controls.
   */
  constructor(linkProvider, itownsView, cameraControls) {
    /** @type {HTMLElement} */
    this.inspectorRootHtml = null;

    /** @type {HTMLElement} */
    this.linkListElement = null;

    /** @type {HTMLElement} */
    this.highlightDocButtonElement = null;

    /** @type {HTMLElement} */
    this.createLinkButtonElement = null;

    /** @type {HTMLElement} */
    this.navigatorRootHtml = null;

    /** @type {HTMLElement} */
    this.linkFilterElement = null;

    this.initHtml();

    /**
     * The link provider.
     *
     * @type {LinkProvider}
     */
    this.provider = linkProvider;

    /**
     * The list of links for the currently displayed document.
     *
     * @type {Array<Link>}
     */
    this.documentLinks = [];

    /**
     * The itowns view.
     */
    this.itownsView = itownsView;

    /**
     * The planar camera controls.
     */
    this.cameraControls = cameraControls;

    linkProvider.addEventListener(
      DocumentProvider.EVENT_FILTERED_DOCS_UPDATED,
      () => this._updateLinkFilter()
    );

    linkProvider.addEventListener(
      DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED,
      () => this._updateLinkList()
    );

    this._init();
    this.linkFilterElement.onchange = () => {
      this.provider.toggleLinkedDocumentsFilter();
    };
  }

  initHtml() {
    // inspector html
    this.inspectorRootHtml = document.createElement('div');
    {
      const displayableDocLink = createDisplayable('Document Links');
      this.inspectorRootHtml.appendChild(displayableDocLink.parent);
      {
        // list
        this.linkListElement = document.createElement('div');
        displayableDocLink.container.appendChild(this.linkListElement);

        // highlight button
        this.highlightDocButtonElement = document.createElement('button');
        this.highlightDocButtonElement.innerText = 'Highlight city objects';
        displayableDocLink.container.appendChild(
          this.highlightDocButtonElement
        );

        // select button
        this.createLinkButtonElement = document.createElement('button');
        this.createLinkButtonElement.innerText = 'Select & link a city object';
        displayableDocLink.container.appendChild(this.createLinkButtonElement);
      }
    }

    this.navigatorRootHtml = document.createElement('div');
    {
      // label input
      const labelInputLinkFilter = createLabelInput(
        'Linked to the selected city object',
        'checkbox'
      );
      this.linkFilterElement = labelInputLinkFilter.input;
      this.navigatorRootHtml.appendChild(labelInputLinkFilter.parent);
    }
  }

  inspectorHtml() {
    return this.inspectorRootHtml;
  }

  navigatorHtml() {
    return this.navigatorRootHtml;
  }

  dispose() {
    this.inspectorRootHtml.remove();
    this.navigatorRootHtml.remove();
  }

  /**
   * Inits the extension of the inspector window. Adds the listeners for the
   * buttons.
   */
  _init() {
    this.highlightDocButtonElement.onclick = () => {
      this.provider.highlightDisplayedDocumentLinks();
    };

    this.createLinkButtonElement.onclick = async () => {
      if (this.provider.selectedCityObject) {
        const newLink = new Link();
        newLink.source_id = this.provider.displayedDocument.id;
        newLink.target_id =
          this.provider.selectedCityObject.props['cityobject.database_id'];
        newLink.centroid_x = this.provider.selectedCityObject.centroid.x;
        newLink.centroid_y = this.provider.selectedCityObject.centroid.y;
        newLink.centroid_z = this.provider.selectedCityObject.centroid.z;
        if (
          confirm(
            'Are you sure you want to associate the document with this city object ?'
          )
        ) {
          try {
            await this.provider.createLink(newLink);
          } catch (e) {
            alert(e);
          }
        }
      } else {
        alert('Select a city object to link with the document.');
      }
    };
  }

  /**
   * Updates the filter display in the navigator.
   */
  _updateLinkFilter() {
    if (!this.linkFilterElement) {
      return;
    }
    this.linkFilterElement.checked = this.provider.shouldFilterLinkedDocuments;
  }

  // /////////////
  // /// LINK LIST

  /**
   * Retrieves all link types, and for each type retrieves the links were the
   * source id is the same as the current document. The links are then displayed
   * in the window. Two buttons are created for each link, called "highlight"
   * and "travel". Clicking on the "highlight" button triggers the
   * `highlightLink` method, while the "travel" button calls the `travelToLink`
   * method.
   */
  async _updateLinkList() {
    if (!this.linkListElement) {
      return;
    }
    const links = this.provider.getDisplayedDocumentLinks();
    const newDiv = document.createElement('div');
    let newDivHtml = `<h4 class="subsection-title">${links.length} city object(s)</h4>
                      <ul>`;
    this.documentLinks = links;
    for (const link of links) {
      newDivHtml += `<li>
                        ID : ${link.target_id}
                        <span id="${this.linkTravelerId(
                          link
                        )}" class="clickable-text">
                        travel
                        </span>
                        <span id="${this.linkDeleterId(
                          link
                        )}" class="clickable-text">
                        delete
                        </span>
                      </li>`;
    }
    newDivHtml += '</ul>';
    newDiv.innerHTML = newDivHtml;
    this.linkListElement.innerHTML = '';
    this.linkListElement.appendChild(newDiv);
    for (const link of links) {
      findChildByID(newDiv, this.linkTravelerId(link)).onclick = () => {
        this._travelToLink(link);
      };
      findChildByID(newDiv, this.linkDeleterId(link)).onclick = () => {
        this._deleteLink(link);
      };
    }
  }

  // //////////////////
  // /// LINK OPERATION

  /**
   * If the target is a city object, moves the camera to focus on its centroid.
   *
   * @param {Link} link The link to travel to.
   */
  async _travelToLink(link) {
    const centroid = new THREE.Vector3(
      link.centroid_x,
      link.centroid_y,
      link.centroid_z
    );
    await focusCameraOn(this.itownsView, this.cameraControls, centroid, {
      duration: 1,
    });
  }

  /**
   * Deletes the link.
   *
   * @param {Link} link The link to delete.
   */
  async _deleteLink(link) {
    if (confirm('Are you sure you want to delete this link ?')) {
      try {
        await this.provider.deleteLink(link);
      } catch (e) {
        alert(`Failed to detete link : ${e}`);
      }
    }
  }

  // ////////////
  // //// GETTERS

  linkTravelerId(link) {
    return `document_link_interface_link_list${link.id}_travel`;
  }

  linkDeleterId(link) {
    return `document_link_interface_link_list${link.id}_delete`;
  }
}
