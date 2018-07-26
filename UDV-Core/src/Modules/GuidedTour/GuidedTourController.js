import { readCSVFile } from '../../Tools/CSVLoader.js';
import './GuidedTour.css';
import { GuidedTour }   from './GuidedTour.js';

/**
* Classes: GuidedTourController & TourStep
* Description :
* The GuidedTourController is an object holding TourSteps objects
* It handles the display of guided tours in the guided tour window, and all the
* functionalities related to the guided tour (start, exit, next, previous...)
* TourSteps are object with properties : index, document, text1 and text2.
* They are the individual steps of which guided tours are made.
*/

/**
* Constructor for GuidedTourController
* The controller reads data from a csv file to build one or more guided tours
* Each guided tour is a succession of "steps"
* Each step has a document + tour text + doc text (steps are instances of the TourStep class)
* Multiple guided tours are supported (only one tour is finished for the demo)
* For the demo : options.preventUserFromChangingTour allows to hide the buttons for changing tour



/**
 * Constructor for GuidedTourControllerClass
 * @param controls : PlanarControls instance
 * @param options : optional parameters (including TemporalController)
 * @param view :  itowns planar view
 * @param config : file holding congiguration settings
 *
 ======================================================================
 */
export function GuidedTourController(documentController) {

  this.guidedTourContainerId = "guidedTourContainer";

  this.documentController = documentController; //instance of DocumentController

  this.url = this.documentController.serverModel.url + this.documentController.serverModel.guidedTour;

  this.browser = this.documentController.documentBrowser;

  this.guidedTours = [];

  this.currentTourIndex = 0;

  this.steps = [];

  // the current step index of the current tour
  this.currentStepIndex = 0;

  this.guidedTour;

  this.preventUserFromChangingTour = false;


   /**
    * initialize the controller
    */
    //=============================================================================
    this.initialize = function initialize(){

      var guidedTourContainer = document.createElement("div");
      guidedTourContainer.id =   this.guidedTourContainerId;
      document.body.appendChild(guidedTourContainer);
      this.guidedTour = new GuidedTour(guidedTourContainer, this);

    }

    /**
     * Gets the documents from a database, using filters
     *
     */
    //=============================================================================
    this.getGuidedTours = function getGuidedTours(){
      var req = new XMLHttpRequest();
      req.open("GET", this.url ,false);
      req.send(req.responseText);
      this.guidedTours = JSON.parse(req.responseText);
      this.documentController.documentBrowser.numberDocs = 1;

    }

    this.getCurrentTour = function getCurrentTour(){
      if (this.guidedTours.length != 0){
        console.log('current tour index', this.currentTourIndex)
        return this.guidedTours[this.currentTourIndex];;
      }
      else
      {
        return null;
      }
    }

    //=============================================================================
    this.getNextTour = function getNextTour(){
      if (this.currentTourIndex < this.guidedTours.length  || this.guidedTours.length == 0){
        this.currentTourIndex++;
      }
      return this.getCurrentTour();
    };

    //=============================================================================
    this.getPreviousTour = function getPreviousTour(){
      if (this.currentTourIndex > 0 || this.currentTourIndex.length == 0)
      {
        this.currentTourIndex--;
      }
      return this.getCurrentTour();
    };

    /**
    * Returns the current tour step
    */
    //=============================================================================
    this.getCurrentStep = function getCurrentStep(){
      if (this.getCurrentTour().length != 0){
        return this.getCurrentTour().extendedDocs[this.currentStepIndex];
      }
      else
      {
        return null;
      }
    }

    this.getPreviousStep = function getPreviousStep(){
      if (this.currentStepIndex > 0 || this.getCurrentTour().extendedDocs.length == 0)
      {
          this.currentStepIndex--;
      }
      return this.getCurrentStep();
    }

    this.getNextStep = function getNextStep(){
      console.log(this.getCurrentTour().extendedDocs.length)
      if (this.currentStepIndex < this.getCurrentTour().extendedDocs.length -1){
          this.currentStepIndex ++;
        }
        return this.getCurrentStep();
    }


    /**
    * Reset browser at the begining of documents list
    */
    //=============================================================================
    this.reset = function reset(){
      this.currentStepIndex =1;
      this.currentTourIndex = 0;
      this.currentGuidedTour = this.guidedTours[this.currentTourIndex];
      this.guidedTour.currentStep = this.getCurrentStep();
      this.documentController.documentBrowser.activateWindow(false);
      this.documentController.documentBrowser.closeDocFull();
      this.guidedTour.previewTour();
      //this.toggleGuidedTourButtons(true);
    }

    this.toggleGuidedTourButtons = function toggleGuidedTourButtons(active){
        document.getElementById("guidedTourPreviousTourButton").style.display = active ? "block" : "none";
        document.getElementById("guidedTourNextTourButton").style.display = active ? "block" : "none";
        document.getElementById("guidedTourPreviousStepButton").style.display = active ? "none" : "block";
        document.getElementById("guidedTourNextStepButton").style.display = active ? "none" : "block";
        document.getElementById('guidedTourStartButton').style.display = active ? "block" : "none";
        document.getElementById("guidedTourExitButton").style.display = active ? "none":"block";

    }

    this.initialize();

}
