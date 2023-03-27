import * as THREE from 'three';
import { DocumentProvider } from '../../Core/ViewModel/DocumentProvider';
import { findChildByID } from '../../../../../HTMLUtil';

import './DocumentVisualizer.css';

/**
 * Represents the document visualizer, under the form of an oriented image. It
 * is a window without its default style, centered in the view with an opacity
 * control.
 */
export class DocumentVisualizerWindow {
  /**
   * Creates a new document image orienter.
   *
   * @param {*} itownsView The iTowns view.
   * @param {*} provider document provider
   */
  constructor(itownsView, provider) {
    this.rootHtml = document.createElement('div');
    this.rootHtml.innerHTML = this.innerContentHtml;
    this.rootHtml.classList.add('orienter-box');

    /**
     * The iTowns view.
     *
     * @type {any}
     */
    this.itownsView = itownsView;

    /**
     * The visualization camera position.
     *
     * @type {THREE.Vector3}
     */
    this.position = undefined;

    /**
     * The visualization camera orientation.
     *
     * @type {THREE.Quaternion}
     */
    this.quaternion = undefined;

    // document provider
    this.provider = provider;

    // callbacks
    this.closeButtonElement.onclick = () => {
      this.dispose();
    };

    this.opacitySliderElement.oninput = () => {
      this._onOpacityChange();
    };

    // Dispose the window when the displayed document change
    this.provider.addEventListener(
      DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED,
      () => this.dispose()
    );
  }

  html() {
    return this.rootHtml;
  }

  dispose() {
    this.rootHtml.remove();
  }

  get innerContentHtml() {
    return /* html*/ `
      <img id="${this.imageId}"/>
      <div class="controls-panel">
        <button id="${this.closeButtonId}">Close</button>
        <div class="slider-container">
          <div class="slider-label">
            <label for="${this.opacitySliderId}">Opacity : </label>
            <output for="${this.opacitySliderId}" id="${this.opacityId}">1</output>
          </div>
          <input type="range" min="0" max="1" value="1" step="0.01" id="${this.opacitySliderId}">
        </div>
      </div>
    `;
  }

  // ////////////////////
  // /// TRAVEL & OPACITY

  /**
   * Triggered when the opacity of the slider changes. This method apply the
   * change on the image and the output element.
   *
   * @private
   */
  _onOpacityChange() {
    const opacity = this.opacitySliderElement.value;
    this.opacityElement.value = opacity;
    this.imageElement.style.opacity = opacity;
  }

  /**
   * Sets the orientation for the camera. `startTravel` should be called after
   * this method to apply the new position.
   *
   * @param {THREE.Vector3} position The visualization camera position.
   */
  setTargetPosition(position) {
    this.position = position;
  }

  /**
   * Sets the orientation for the camera. `startTravel` should be called after
   * this method to apply the new orientation.
   *
   * @param {THREE.Quaternion} quaternion The visualization camera orientation.
   */
  setTargetQuaternion(quaternion) {
    this.quaternion = quaternion;
  }

  /**
   * Sets the image source.
   *
   * @param {string} newSrc The image source.
   */
  setImageSrc(newSrc) {
    this.imageElement.src = newSrc;
  }

  /**
   * Retrieve the displayed document and start a travel to its visualization
   * location.
   *
   * @async
   */
  async startTravelToDisplayedDocument() {
    const currentDoc = this.provider.getDisplayedDocument();

    if (!currentDoc) {
      return;
    }

    const imageSrc = await this.provider.getDisplayedDocumentImage();

    if (
      isNaN(currentDoc.visualization.positionX) ||
      isNaN(currentDoc.visualization.quaternionX)
    ) {
      return;
    }

    const docViewPos = new THREE.Vector3();
    docViewPos.x = parseFloat(currentDoc.visualization.positionX);
    docViewPos.y = parseFloat(currentDoc.visualization.positionY);
    docViewPos.z = parseFloat(currentDoc.visualization.positionZ);
    this.setTargetPosition(docViewPos);

    const docViewQuat = new THREE.Quaternion();
    docViewQuat.x = parseFloat(currentDoc.visualization.quaternionX);
    docViewQuat.y = parseFloat(currentDoc.visualization.quaternionY);
    docViewQuat.z = parseFloat(currentDoc.visualization.quaternionZ);
    docViewQuat.w = parseFloat(currentDoc.visualization.quaternionW);
    this.setTargetQuaternion(docViewQuat);

    this.setImageSrc(imageSrc);

    await this.startTravel();
  }

  /**
   * Starts the document orientation. The processes first assign the correct src
   * to the image, then sets the opacity to 0. After the travel is finished,
   * the opacity is gradually restored.
   * To call this function, the `position`, `quaternion` and `imageSrc`
   * attributes must all have been set beforehand.
   *
   * @async
   */
  startTravel() {
    if (!this.itownsView.controls) return; // when PR https://github.com/iTowns/itowns/pull/2046 enabled this would be useless

    this.imageElement.style.opacity = 0;
    this.opacitySliderElement.value = 0;
    this.opacityElement.value = 0;

    this.itownsView.controls.initiateTravel(
      this.position,
      2,
      this.quaternion,
      true
    );
    this.itownsView.notifyChange();

    return new Promise((resolve, reject) => {
      try {
        setTimeout(() => {
          const increaseOpacity = () => {
            let nextValue = Number(this.opacitySliderElement.value) + 0.01;
            this.opacitySliderElement.value = nextValue;
            this._onOpacityChange();
            if (nextValue >= 1) {
              nextValue = 1;
              clearInterval(intervalHandle);
            }
          };
          const intervalHandle = setInterval(increaseOpacity, 15);
          resolve();
        }, 2000);
      } catch (e) {
        reject(e);
      }
    });
  }

  // ///////////
  // /// GETTERS

  get closeButtonId() {
    return `document_visualizer_close_button`;
  }

  get closeButtonElement() {
    return findChildByID(this.rootHtml, this.closeButtonId);
  }

  get opacitySliderId() {
    return `document_visualizer_opacity_slider`;
  }

  get opacitySliderElement() {
    return findChildByID(this.rootHtml, this.opacitySliderId);
  }

  get opacityId() {
    return `document_visualizer_opacity`;
  }

  get opacityElement() {
    return findChildByID(this.rootHtml, this.opacityId);
  }

  get imageId() {
    return `document_visualizer_image`;
  }

  get imageElement() {
    return findChildByID(this.rootHtml, this.imageId);
  }
}
