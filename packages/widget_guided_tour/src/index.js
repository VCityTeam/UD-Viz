import * as itowns from 'itowns';

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
   * @param {object} [configGuidedTour] - The configuration of the widget
   * @param {string} configGuidedTour.name - Name of the GuidedTour
   * @param {string} configGuidedTour.description - Description of the GuidedTour
   * @param {number} configGuidedTour.startIndex - Index of the first step of the tour
   * @param {number} configGuidedTour.endIndex - Index of the last step of the tour
   * @param {Array<Step>} configGuidedTour.steps - Array of steps
   */
  constructor(itownsView, configGuidedTour) {
    /** @type {import('itowns').PlanarView} */
    this.itownsView = itownsView;

    /**
     * Name of the GuidedTour
     * 
      @type {string}*/
    this.name = configGuidedTour.name || 'GuidedTour';

    /**
     * Description of the GuidedTour
     * 
      @type {string}*/
    this.description = configGuidedTour.description || '';

    /**
     * Index of the first step of the GuidedTour
     * 
      @type {number}*/
    this.startIndex = configGuidedTour.startIndex;

    /**
     * Index of the last step of the GuidedTour
     * 
      @type {number}*/
    this.endIndex = configGuidedTour.endIndex;

    /**
     * Array of steps
     * 
      @type {Array<object>}*/
    this.steps = configGuidedTour.steps;

    /**
     * Index of the current step
     * 
      @type {number}*/
    this.currentIndex = this.startIndex;

    /**
     * Root html of GuidedTour view 
     *
      @type {HTMLElement} */
    this.domElement = null;
    this.initHtml();
  }

  /**
   * Creates the HTML of the GuidedTour
   */
  initHtml() {
    this.domElement = document.createElement('div');
    const mediaContainer = document.createElement('div');
    this.domElement.appendChild(mediaContainer);

    const previousButton = document.createElement('button');
    previousButton.addEventListener(
      'click',
      function () {
        const previousIndex = this.getCurrentStep().previous;
        this.goToStep(previousIndex);
      }.bind(this)
    );
    this.domElement.appendChild(previousButton);

    const nextButton = document.createElement('button');
    nextButton.addEventListener(
      'click',
      function () {
        const nextIndex = this.getCurrentStep().next;
        this.goToStep(nextIndex);
      }.bind(this)
    );
    this.domElement.appendChild(nextButton);
  }

  /**
   * Go to the step corresponding to the index
   *
   * @param {number} index Index of the step
   */
  goToStep(index) {
    this.currentIndex = index;
    console.log(this.currentIndex);
  }

  /**
   * Dispose the DOM element
   */
  dispose() {
    this.domElement.remove();
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
}
