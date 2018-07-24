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
* This controller is initialized after DocumentHandler has finished initializing
* @param docHandler : an instance of DocumentHandler (required)
* @param dataFile : CSV file holding the Guided Tours data
* @param options : optional parameters (including temporal)
*/
//=============================================================================
export function GuidedTourController(documentController) {


      // TemporalController instance, optional
  //    this.temporal = this.documentController.options.temporal;

      // The tour steps of the currently active guided tour
    //  this.tourStepsCurrent = null;


    this.guidedTourContainerId = "guidedTourContainer";
    // DocumentHandler instance, required
    this.docs;

    this.url = "http://rict.liris.cnrs.fr:9095/getGuidedTours";

    this.documentController = documentController;

    this.browser = this.documentController.documentBrowser;

    // Array of all the guided tours loaded from the csv file
    this.guidedTours = []; //not good. We don't need to load every guided tour at the beginning.
                      //maybe just if we go to "next tour" or if we choose the guided tour in a list, by it's name for example


    this.currentTourIndex = 0;// the current tour index, default is 1

    this.currentGuidedTour; //holds tour steps will be loaded by clicking on start

    //this.currentStep = null;

    // the current step index of the current tour
    this.currentStepIndex = 0;

    /**
    * initialize the controller
    */
    //=============================================================================
    this.initialize = function initialize(){

      var guidedTourContainer = document.createElement("div");
      guidedTourContainer.id =   this.guidedTourContainerId;
      document.body.appendChild(guidedTourContainer);
      this.guidedTourContainer = new GuidedTour(guidedTourContainer, this);

    }

    /**
     * Gets the documents from a database, using filters
     *
     */
    //=============================================================================
    this.getGuidedTours = function getGuidedTours(){

      var req = new XMLHttpRequest();
      req.open("GET", "http://rict.liris.cnrs.fr:9095/getGuidedTours",false);
      req.send();
      this.guidedTours = JSON.parse(req.responseText);
      console.log(this.guidedTours)

    }

    // setup the display for the introduction (buttons, image, text...)
    //=============================================================================
    this.setupIntro = function setupIntro(){

        // hide & show elements
        document.getElementById("guidedTourPreviousTourButton").style.display = "block";
        document.getElementById("guidedTourNextTourButton").style.display = "block";

        // for the demo, until we have more than one finished guided tour
        // we can prevent user from changing tour by hiding the buttons
        if(this.preventUserFromChangingTour){
            document.getElementById("guidedTourPreviousTourButton").style.display = "none";
            document.getElementById("guidedTourNextTourButton").style.display = "none";
        }

        document.getElementById("guidedTourPreviousStepButton").style.display = "none";
        document.getElementById("guidedTourNextStepButton").style.display = "none";
        document.getElementById("guidedTourExitButton").style.display = "none";
        document.getElementById("guidedTourText2").style.display = "none";
        document.getElementById("guidedTourStartButton").style.display = "block";
        document.getElementById("guidedTourDocPreviewImg").style.display = "inline-block";

        // setup image & text
        document.getElementById("guidedTourDocPreviewImg").src = this.tourStepsCurrent[0].doc.imageSourceBD;
        document.getElementById("guidedTourText1").innerHTML = this.tourStepsCurrent[0].text1;
        document.getElementById("guidedTourText1").style.height = "45%";
        document.getElementById("guidedTourTitle").innerHTML = this.tourStepsCurrent[0].stepTitle;
        document.getElementById("guidedTourStepTitle").innerHTML = null;

    }

    this.getCurrentTour = function getCurrentTour(){
      if (this.guidedTours.length != 0){
        this.currentGuidedTour = this.guidedTours[this.currentTourIndex];
        return this.currentGuidedTour;
      }
      else
      {
        return null;
      }
    }

    //=============================================================================
    this.getNextTour = function getNextTour(){
      if (this.currentTourIndex < this.guidedTours.length - 1 || this.guidedTours.length == 0){
        this.currentTourIndex++;
      }
      return this.getCurrentTour();
    };

    //=============================================================================
    this.getPreviousTour = function getPreviousTour(){
      if (this.currentTourIndex > 0 || this.currentTourIndex.length == 0)
      {
        this.currentTourIndex--;
        return this.getCurrentTour();
      }
    };

    /**
    * Returns the current tour step
    */
    //=============================================================================
    this.getCurrentStep = function getCurrentStep(){
      if (this.guidedTours[this.currentTourIndex].length != 0)
          return this.currentGuidedTour[this.currentStepIndex];
      else
      {
        console.log('no documents in guided tour');
        return null;
      }
    }

    this.getPreviousStep = function getPreviousStep(){

      if (this.stepIndex > 0 || this.guidedTour.length == 0)
      {
          this.stepIndex--;
          var currentDoc = this.getCurrentDoc();
          return this.getCurrentDoc();
      }

    }

    this.getNextStep = function getNextStep(){
      if (this.stepIndex < this.guidedTour.length - 1 || this.guidedTour.length == 0)
          this.stepIndex ++;
      return this.getCurrentTourStep();
    }

    this.loadGuidedTour = function loadGuidedTour(id){
      /*
      var req = new XMLHttpRequest();
      req.open("POST", this.url + '/' + id ,false);
      req.send();
      this.guidedTour = JSON.parse(req.responseText);
      */
      //console.log(this.guidedTour);
    }

    this.initialize();

}
