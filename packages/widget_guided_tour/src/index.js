import * as itowns from 'itowns';

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
   * @param {Array<object>} configGuidedTour.steps - Array of steps
   * @param {number} configGuidedTour.steps[].previous - Index of the previous step. If this is the first step, it should be the index of the step
   * @param {number} configGuidedTour.steps[].next - Index of the next step. If this is the last step, it should be the index of the step
   * @param {Array<string>} configGuidedTour.steps[].layers - IDs of the layers to display
   * @param {Array<string>} configGuidedTour.steps[].media - IDs of the media to display
   * @param {object} configGuidedTour.steps[].position - Camera position (vec3 with x,y,z coordinates)
   * @param {object} configGuidedTour.steps[].rotation - Camera rotation (quaternion with x,y,z,w coordinates)
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
  }

  addListeners() {}

  removeListeners() {}

  dispose() {
    this.domElement.remove();

    this.itownsView.notifyChange();

    this.removeListeners();
  }
}
