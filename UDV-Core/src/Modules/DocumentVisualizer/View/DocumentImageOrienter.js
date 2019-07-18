import { AbstractDocumentWindow } from "../../Documents/View/AbstractDocumentWindow";
import * as THREE from "three";

import './DocumentImageOrienter.css';
import { DocumentProvider } from "../../Documents/ViewModel/DocumentProvider";
import { DocumentModule } from "../../Documents/DocumentModule";

/**
 * Represents the document visualizer, under the form of an oriented image. It
 * is a window without its default style, centered in the view with an opacity
 * control.
 */
export class DocumentImageOrienter extends AbstractDocumentWindow {
  /**
   * Creates a new document image orienter.
   * 
   * @param {DocumentModule} documentModule The document module.
   * @param {*} itownsView The iTowns view.
   * @param {*} cameraControls The planar camera controls.
   */
  constructor(documentModule, itownsView, cameraControls) {
    super('Image Orienter');
    // Remove the default style of the window
    this.defaultStyle = false;
    this.windowDisplayWhenVisible = 'block';

    // Add the image orienter as a document window
    documentModule.addDocumentWindow(this);
    documentModule.addDisplayedDocumentCommand('Orient', () => {
      this.startTravel();
    });

    /**
     * The iTowns view.
     * 
     * @type {any}
     */
    this.itownsView = itownsView;

    /**
     * The camera controls.
     * 
     * @type {any}
     */
    this.cameraControls = cameraControls;
  }

  get html() {
    return /*html*/`
      <img id="${this.imageId}"/>
      <div class="controls-panel">
        <button id="${this.closeButtonId}">Close</button>
        <button id="${this.orientButtonId}">Orient Document</button>
        <div class="slider-container">
          <div class="slider-label">
            <label for="${this.opacitySliderId}">Opacity : </label>
            <output for="${this.opacitySliderId}" id="${this.opacityId}">0.5</output>
          </div>
          <input type="range" min="0" max="1" value="0.5" step="0.01" id="${this.opacitySliderId}">
        </div>
      </div>
    `;
  }

  windowCreated() {
    this.hide();
    this.window.classList.add("orienter-box");
    this.window.style.position = 'absolute';

    this.closeButtonElement.onclick = () => {
      this.disable();
    };

    this.orientButtonElement.onclick = () => {
      this.startTravel();
    };

    this.opacitySliderElement.oninput = () => {
      this._onOpacityChange();
    };
  }

  documentWindowReady() {
    // Dispose the window when the displayed document change
    this.provider.addEventListener(DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED,
      () => this.disable());
  }

  //////////////////////
  ///// TRAVEL & OPACITY

  /**
   * Triggered when the opacity of the slider changes. This method apply the
   * change on the image and the output element.
   * 
   * @private
   */
  _onOpacityChange() {
    let opacity = this.opacitySliderElement.value;
    this.opacityElement.value = opacity;
    this.imageElement.style.opacity = opacity;
  }

  /**
   * Starts the document orientation. The processes first assign the correct src
   * to the image, then sets the opacity to 0. After the travel is finished,
   * the opacity is gradually restored.
   */
  async startTravel() {
    let currentDoc = this.provider.getDisplayedDocument();

    if (!currentDoc) {
      return;
    }

    let imageSrc = await this.provider.getDisplayedDocumentImage();
    
    this.imageElement.style.opacity = 0;
    this.opacitySliderElement.value = 0;
    this.opacityElement.value = 0;
    this.imageElement.src = imageSrc;

    this.view.requestWindowDisplay(this);

    // if we have valid data, initiate the animated travel to orient the camera
    if (!isNaN(currentDoc.visualization.positionX) &&
      !isNaN(currentDoc.visualization.quaternionX)) {
      var docViewPos = new THREE.Vector3();
      docViewPos.x = parseFloat(currentDoc.visualization.positionX);
      docViewPos.y = parseFloat(currentDoc.visualization.positionY);
      docViewPos.z = parseFloat(currentDoc.visualization.positionZ);

      // camera orientation for the oriented view
      var docViewQuat = new THREE.Quaternion();
      docViewQuat.x = parseFloat(currentDoc.visualization.quaternionX);
      docViewQuat.y = parseFloat(currentDoc.visualization.quaternionY);
      docViewQuat.z = parseFloat(currentDoc.visualization.quaternionZ);
      docViewQuat.w = parseFloat(currentDoc.visualization.quaternionW);
      this.cameraControls.initiateTravel(docViewPos, 2,
          docViewQuat, true);
      this.itownsView.notifyChange();

      setTimeout(() => {
        let intervalHandle;
        let increaseOpacity = () => {
          let nextValue = Number(this.opacitySliderElement.value) + 0.01;
          if (nextValue >= 1) {
            nextValue = 1;
            clearInterval(intervalHandle)
          }
          this.opacitySliderElement.value = nextValue;
          this._onOpacityChange();
        };
        intervalHandle = setInterval(increaseOpacity, 15);
      }, 2000);
    }
  }

  /////////////
  ///// GETTERS

  get closeButtonId() {
    return `${this.windowId}_close_button`
  }

  get closeButtonElement() {
    return document.getElementById(this.closeButtonId);
  }
  
  get orientButtonId() {
    return `${this.windowId}_orient_button`
  }

  get orientButtonElement() {
    return document.getElementById(this.orientButtonId);
  }

  get opacitySliderId() {
    return `${this.windowId}_opacity_slider`
  }

  get opacitySliderElement() {
    return document.getElementById(this.opacitySliderId);
  }
  
  get opacityId() {
    return `${this.windowId}_opacity`
  }

  get opacityElement() {
    return document.getElementById(this.opacityId);
  }

  get imageId() {
    return `${this.windowId}_image`
  }

  get imageElement() {
    return document.getElementById(this.imageId);
  }
}