import * as itowns from 'itowns';
import * as THREE from 'three';

/**
 * @typedef {object} Step
 * @property {number} previous - Index of the previous step. If this is the first step, it should be the index of the step
 * @property {number} next - Index of the next step. If this is the last step, it should be the index of the step
 * @property {Array<string>} layers - IDs of the layers to display
 * @property {Array<string>} media - IDs of the media to display
 * @property {object} position - Camera position (vec3 with x,y,z coordinates)
 * @property {object} rotation - Camera rotation (quaternion with x,y,z,w coordinates)
 */

/**
 * @typedef {object} Media
 * @property {string} id - ID of the media
 * @property {string} type - The type of the media (text, image, video or audio)
 * @property {string} value - Value of the media. It can be either an URL or raw text
 */

/**
 * @example
 * Config Example
 * {
  "steps": [
    {
      "previous": 0,
      "next": 1,
      "layers": ["layer_1", "layer_2"],
      "media": [],
      "position": {"x": 10, "y": 20, "z": 30},
      "rotation": {"x": 0.5, "y": 0, "z": 0.24, "w": 0}
    },
    {
      "previous": 0,
      "next": 1,
      "layers": ["layer_3"],
      "media": ["media_1", "media_2"]
    }
  ],
 "name": "Example",
 "description": "This is an example of GuidedTour config",
 "startIndex": 0,
 "endIndex": 1
}
 * @classdesc GuidedTour Widget class
 */
export class GuidedTour {
  /**
   * It initializes the widget.
   *
   *
   * @param {itowns.PlanarView} itownsView - The itowns view.
   * @param {object} tourConfig - The configuration of the widget
   * @param {string} tourConfig.name - Name of the GuidedTour
   * @param {string} tourConfig.description - Description of the GuidedTour
   * @param {number} tourConfig.startIndex - Index of the first step of the tour
   * @param {number} tourConfig.endIndex - Index of the last step of the tour
   * @param {Array<Step>} tourConfig.steps - Array of steps
   * @param {Array<Media>} mediaConfig - All media of the tour
   */
  constructor(itownsView, tourConfig, mediaConfig) {
    /** @type {import('itowns').PlanarView} */
    this.itownsView = itownsView;

    /**
     * Name of the GuidedTour
     * 
      @type {string}*/
    this.name = tourConfig.name || 'GuidedTour';

    /**
     * Description of the GuidedTour
     * 
      @type {string}*/
    this.description = tourConfig.description || '';

    /**
     * Index of the first step of the GuidedTour
     * 
      @type {number}*/
    this.startIndex = tourConfig.startIndex;

    /**
     * Index of the last step of the GuidedTour
     * 
      @type {number}*/
    this.endIndex = tourConfig.endIndex;

    /**
     * Array of steps
     * 
      @type {Array<object>}*/
    this.steps = tourConfig.steps;

    /**
     * Index of the current step
     * 
      @type {number}*/
    this.currentIndex = this.startIndex;

    /**
     * Config of all media of the tour
     *
     @type {Array<object>}*/
    this.mediaConfig = mediaConfig;

    /**
     * Root html of GuidedTour view 
     *
      @type {HTMLElement} */
    this.domElement = null;

    /**
     * Html div containing media of the step 
     *
      @type {HTMLElement} */
    this.mediaContainer = null;

    /**
     * Button to go to previous step 
     *
      @type {HTMLElement} */
    this.previousButton = null;

    /**
     * Button to go to next step 
     *
      @type {HTMLElement} */
    this.nextButton = null;

    this.initHtml();
  }

  /**
   * Creates the HTML of the GuidedTour
   */
  initHtml() {
    this.domElement = document.createElement('div');
    this.mediaContainer = document.createElement('div');
    this.domElement.appendChild(this.mediaContainer);

    this.previousButton = document.createElement('button');
    this.previousButton.addEventListener(
      'click',
      function () {
        const previousIndex = this.getCurrentStep().previous;
        this.goToStep(previousIndex);
      }.bind(this)
    );
    this.domElement.appendChild(this.previousButton);

    this.nextButton = document.createElement('button');
    this.nextButton.addEventListener(
      'click',
      function () {
        const nextIndex = this.getCurrentStep().next;
        this.goToStep(nextIndex);
      }.bind(this)
    );
    this.domElement.appendChild(this.nextButton);
  }

  /**
   * Go to the step corresponding to the index
   *
   * @param {number} index Index of the step
   */
  goToStep(index) {
    this.currentIndex = index;
    const step = this.getCurrentStep();
    if (step.position && step.rotation)
      this.travelToPosition(step.position, step.rotation);
    if (step.layers && step.layers.length > 0) this.filterLayers(step.layers);
    this.addMedia(step.media);
  }

  /**
   * Travel to the targeted position and rotation
   *
   * @param {object} position Target postion
   * @param {object} rotation Target rotation
   */
  travelToPosition(position, rotation) {
    const pos = new THREE.Vector3(...Object.values(position));
    const quat = new THREE.Quaternion(...Object.values(rotation));
    this.itownsView.controls.initiateTravel(pos, 'auto', quat, true);
  }

  /**
   * Filters layers, displaying only those whose ID appears in the list
   *
   * @param {Array<string>} layerIds Array of layer IDs
   */
  filterLayers(layerIds) {
    for (const layer of this.itownsView.getLayers())
      layer.visible = layerIds.includes(layer.id);
    this.itownsView.notifyChange();
  }

  /**
   * Add media in the media container
   *
   * @param {Array<string>} mediaIds The list of media IDs
   */
  addMedia(mediaIds) {
    const mediaDivs = [];
    for (const mediaId of mediaIds) {
      const media = this.getMediaById(mediaId);
      mediaDivs.push(this.createMediaDiv(media));
    }
    this.mediaContainer.replaceChildren(...mediaDivs);
  }

  /**
   * Creates a HTML element from a media config
   *
   * @param {Media} media The media config
   * @returns {HTMLElement} The media as a HTML element
   */
  createMediaDiv(media) {
    let mediaDiv = null;
    switch (media.type) {
      case 'text':
        mediaDiv = document.createElement('p');
        mediaDiv.innerText = media.value;
        break;
      case 'video':
        mediaDiv = document.createElement('video');
        mediaDiv.src = media.value;
        mediaDiv.controls = true;
        mediaDiv.muted = false;
        break;
      case 'image':
        mediaDiv = document.createElement('img');
        mediaDiv.src = media.value;
        break;
      case 'audio':
        mediaDiv = document.createElement('audio');
        mediaDiv.src = media.value;
        mediaDiv.controls = true;
        mediaDiv.muted = false;
        break;
      default:
        console.log('Unkown media type');
    }
    return mediaDiv;
  }

  /**
   * Dispose the DOM element
   */
  dispose() {
    this.domElement.remove();
    for (const layer of this.itownsView.getLayers()) layer.visible = true;
    this.itownsView.notifyChange();
  }

  /**
   * Returns the current step of the tour
   *
   * @returns {Step} The current step of the tour
   */
  getCurrentStep() {
    return this.steps[this.currentIndex];
  }

  /**
   * Returns the media config with the matching ID
   *
   * @param {string} mediaId The ID of the media
   * @returns {Media|null} The media config
   */
  getMediaById(mediaId) {
    for (const media of this.mediaConfig) {
      if (media.id == mediaId) return media;
    }
    return null;
  }
}
