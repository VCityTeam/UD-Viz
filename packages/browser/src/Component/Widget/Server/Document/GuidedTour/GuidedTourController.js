import { RequestService } from '../../../../RequestService';
import { GuidedTour } from './GuidedTour.js';
import { DocumentModule } from '../Core/DocumentModule';

import { findChildByID } from '../../../../HTMLUtil';

import './GuidedTour.css';

/**
 * Class: GuidedTourController
 * Description :
 * The GuidedTourController is an object handling the view, interracting with the
 * server to get information and data (guided tours)
 * It handles the display of guided tours in the guided tour window, and all the
 * functionalities related to the guided tour (start, exit, next, previous...)
 * GuidedTours are made of steps with properties : index, document, text1 and text2.
 */
export class GuidedTourController {
  /**
   * Constructor for GuidedTourController
   * The controller reads data from a database to build one or more guided tours
   * Each guided tour is a succession of "steps"
   * Each step has a document + tour text + doc text (steps are instances of
   * the TourStep class)
   * Multiple guided tours are supported (only one tour is finished for the demo)
   * For the demo : options.preventUserFromChangingTour allows to hide the buttons for changing tour
   *
   * @param { DocumentModule } documentModule The document module.
   * @param { RequestService } requestService The request service
   * @param { object } configServer The server configuration.
   * @param { string } configServer.url The base URL of the server.
   * @param { string } configServer.guidedTour The route for guided tours.
   */
  constructor(documentModule, requestService, configServer) {
    this.guidedTourContainerId = 'guidedTourContainer';

    this.documentModule = documentModule; // Instance of DocumentModule

    this.url = configServer.url + configServer.guidedTour;

    this.browser = this.documentModule.view.inspectorWindow;

    this.guidedTours = [];

    this.currentTourIndex = 0;

    this.steps = [];

    this.requestService = requestService;

    // The current step index of the current tour
    this.currentStepIndex = 0;

    this.guidedTour = new GuidedTour(this);

    this.preventUserFromChangingTour = false; // Put to true to prevent user from
    // changing guided tour
  }

  /**
   * Get all guided tour from a database
   */
  async getGuidedTours() {
    const req = await this.requestService.request('GET', this.url, {
      authenticate: false,
    });
    this.guidedTours = JSON.parse(req.responseText);
    if (!this.guidedTours.length) console.warn('NO GUIDED TOUR ON SERVER');
  }

  /**
   * Returns the current guided tour if there are any
   *
   * @returns {GuidedTour} Current guided tour
   */
  getCurrentTour() {
    if (this.guidedTours.length != 0) {
      return this.guidedTours[this.currentTourIndex];
    }
    return null;
  }

  /**
   * Sets the current guided tour to the next guided tour and returns it.
   *
   * @returns {GuidedTour} Next guided tour
   */
  getNextTour() {
    if (this.currentTourIndex < this.guidedTours.length) {
      this.currentTourIndex++;
    }
    return this.getCurrentTour();
  }

  /**
   * Sets the current guided tour to the previous guided tour and returns it.
   *
   * @returns {GuidedTour} Previous guided tour
   */
  getPreviousTour() {
    if (this.currentTourIndex > 0) {
      this.currentTourIndex--;
    }
    return this.getCurrentTour();
  }

  /**
   * Returns the current tour step
   *
   * @returns {*} Current step
   */
  getCurrentStep() {
    if (this.getCurrentTour().length != 0) {
      const steps = this.getCurrentTour().extendedDocs;
      return steps[this.currentStepIndex];
    }
    return null;
  }

  /**
   * Sets the current step to the previous step and returns it.
   *
   * @returns {*} Previous step
   */
  getPreviousStep() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
    }
    return this.getCurrentStep();
  }

  /**
   * Sets the current step to the next step and returns it.
   *
   * @returns {*} Next step
   */
  getNextStep() {
    if (this.currentStepIndex < this.getCurrentTour().extendedDocs.length) {
      this.currentStepIndex++;
    }
    return this.getCurrentStep();
  }

  /**
   * Reset browser at the begining of the guided tours
   */
  // =============================================================================
  reset() {
    this.currentStepIndex = 0;
    this.currentTourIndex = 0;
    this.currentGuidedTour = this.guidedTours[this.currentTourIndex];
    this.guidedTour.currentStep = this.getCurrentStep();
    this.guidedTour.previewTour();
  }

  // Hide or show previous / next buttons in browser window
  // =============================================================================
  toggleGuidedTourButtons(active) {
    findChildByID(
      this.guidedTour.html(),
      'guidedTourPreviousTourButton'
    ).style.display = active ? 'block' : 'none';
    findChildByID(
      this.guidedTour.html(),
      'guidedTourNextTourButton'
    ).style.display = active ? 'block' : 'none';
    findChildByID(
      this.guidedTour.html(),
      'guidedTourPreviousStepButton'
    ).style.display = active ? 'none' : 'block';
    findChildByID(
      this.guidedTour.html(),
      'guidedTourNextStepButton'
    ).style.display = active ? 'none' : 'block';
    findChildByID(
      this.guidedTour.html(),
      'guidedTourStartButton'
    ).style.display = active ? 'block' : 'none';
    findChildByID(
      this.guidedTour.html(),
      'guidedTourExitButton'
    ).style.display = active ? 'none' : 'block';
  }
}
