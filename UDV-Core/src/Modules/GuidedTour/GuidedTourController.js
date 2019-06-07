import './GuidedTour.css';
import { GuidedTour } from './GuidedTour.js';
import { ModuleView } from '../../Utils/ModuleView/ModuleView';

/**
* Class: GuidedTourController
* Description :
* The GuidedTourController is an object handling the view, interracting with the
* server to get information and data (guided tours)
* It handles the display of guided tours in the guided tour window, and all the
* functionalities related to the guided tour (start, exit, next, previous...)
* GuidedTours are made of steps with properties : index, document, text1 and text2.

/**
* Constructor for GuidedTourController
* The controller reads data from a database to build one or more guided tours
* Each guided tour is a succession of "steps"
* Each step has a document + tour text + doc text (steps are instances of the TourStep class)
* Multiple guided tours are supported (only one tour is finished for the demo)
* For the demo : options.preventUserFromChangingTour allows to hide the buttons for changing tour
/**
 * Constructor for GuidedTourControllerClass
* @param { documentController } documentController
 *
 ======================================================================
 */
export class GuidedTourController extends ModuleView {

  constructor(documentController) {
    super();

    this.guidedTourContainerId = "guidedTourContainer";

    this.documentController = documentController; //instance of DocumentController

    this.url = this.documentController.serverModel.url + this.documentController.serverModel.guidedTour;

    this.browser = this.documentController.documentBrowser;

    this.guidedTours = [];

    this.currentTourIndex = 0;

    this.steps = [];

    // the current step index of the current tour
    this.currentStepIndex = 0;

    this.guidedTour; //instance of GuidedTour

    this.preventUserFromChangingTour = false; //put to true to prevent user from
    // changing guided tour

    this.initialize();
  }

  /**
  * initialize the controller
  */
  //=============================================================================
  initialize() {
    this.guidedTour = new GuidedTour(this);
    this.guidedTour.addEventListener(GuidedTour.EVENT_DESTROYED, () => {
      this.disable();
    });
  }

  /**
  * Get all guided tour from a database */
  //=============================================================================
  getGuidedTours() {
    var req = new XMLHttpRequest();
    req.open("GET", this.url, false);
    req.send(req.responseText);
    this.guidedTours = JSON.parse(req.responseText);
    this.documentController.documentBrowser.numberDocs = this.guidedTours[0].extendedDocs.length;

  }

  /**
   * Returns the current guided tour if there are any
   */
  //=============================================================================
  getCurrentTour() {
    if (this.guidedTours.length != 0) {
      return this.guidedTours[this.currentTourIndex];
    }
    else {
      return null;
    }
  }

  /**
   * Sets the current guided tour to the next guided tour and returns it.
   */
  //=============================================================================
  getNextTour() {
    if (this.currentTourIndex < this.guidedTours.length) {
      this.currentTourIndex++;
    }
    return this.getCurrentTour();
  };

  /**
   * Sets the current guided tour to the previous guided tour and returns it.
   */
  //=============================================================================
  getPreviousTour() {
    if (this.currentTourIndex > 0) {
      this.currentTourIndex--;
    }
    return this.getCurrentTour();
  };

  /**
  * Returns the current tour step
  */
  //=============================================================================
  getCurrentStep() {
    if (this.getCurrentTour().length != 0) {
      var steps = this.getCurrentTour().extendedDocs;
      return steps[this.currentStepIndex];
    }
    else {
      return null;
    }
  }

  /**
  * Sets the current step to the previous step and returns it.
  */
  //=============================================================================
  getPreviousStep() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
    }
    return this.getCurrentStep();
  }

  /**
  * Sets the current step to the next step and returns it.
  */
  //=============================================================================
  getNextStep() {
    if (this.currentStepIndex < this.getCurrentTour().extendedDocs.length) {
      this.currentStepIndex++;
    }
    return this.getCurrentStep();
  }


  /**
  * Reset browser at the begining of the guided tours
  */
  //=============================================================================
  reset() {
    this.currentStepIndex = 0;
    this.currentTourIndex = 0;
    this.currentGuidedTour = this.guidedTours[this.currentTourIndex];
    this.guidedTour.currentStep = this.getCurrentStep();
    this.documentController.documentBrowser.activateWindow(false);
    this.documentController.documentBrowser.closeDocFull();
    this.guidedTour.previewTour();

  }

  //Hide or show previous / next buttons in browser window
  //=============================================================================
  toggleGuidedTourButtons(active) {
    document.getElementById("guidedTourPreviousTourButton").style.display = active ? "block" : "none";
    document.getElementById("guidedTourNextTourButton").style.display = active ? "block" : "none";
    document.getElementById("guidedTourPreviousStepButton").style.display = active ? "none" : "block";
    document.getElementById("guidedTourNextStepButton").style.display = active ? "none" : "block";
    document.getElementById('guidedTourStartButton').style.display = active ? "block" : "none";
    document.getElementById("guidedTourExitButton").style.display = active ? "none" : "block";

  }

  /////// MODULE MANAGEMENT FOR BASE DEMO

  enableView() {
    this.guidedTour.appendTo(this.parentElement);
  }

  disableView() {
    this.guidedTour.dispose();
  }

}
