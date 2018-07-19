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

    this.guidedTourContainerId = "guidedTourContainer";
    // DocumentHandler instance, required
    this.docs;

    this.url; //= url get guided tour

    this.guidedTour; //holds tour steps will be loaded by clicking on start

    this.documentController = documentController;

    this.browser = this.documentController.documentBrowser;

    this.stepIndex = 0; //step index of the current guidedtour

    // TemporalController instance, optional
    this.temporal = this.documentController.options.temporal;

    // The tour steps of the currently active guided tour
    this.tourStepsCurrent = null;

    // the current step index of the current tour
    this.currentStepIndex = 0;

    // Array of all the guided tours loaded from the csv file
    this.tours = []; //not good. We don't need to load every guided tour at the beginning.
                      //maybe just if we go to "next tour" or if we choose the guided tour in a list, by it's name for example

    // the current tour index
    this.currentTourIndex = 0; //useful if we load all guided tours

    // index of the tour accessible by the user (loaded by default)
    // as of now, there is no way to choose a specific tour at runtime
    const startingTourIndex = 0;

    // for the demo : if this is true, hide the buttons for changing tour
    //this.preventUserFromChangingTour = options.preventUserFromChangingTour || false;


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

    // loads the steps from the chosen tour
    //=============================================================================
    this.selectTour = function selectTour(index){

        this.tourStepsCurrent = this.tours[index];
        this.currentTourIndex = index;
        this.setupIntro();
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

    //=============================================================================
    this.goToNextStep = function goToNextStep(){

        if(this.currentStepIndex + 1 >= this.tourStepsCurrent.length){
            return;
        }

        this.currentStepIndex += 1;
        this.docs.currentDoc = this.tourStepsCurrent[this.currentStepIndex].doc;
        this.docs.updateBrowser();
        this.docs.focusOnDoc();

        document.getElementById("guidedTourText1").innerHTML = this.tourStepsCurrent[this.currentStepIndex].text1;
        document.getElementById("guidedTourText2").innerHTML = this.tourStepsCurrent[this.currentStepIndex].text2;
        document.getElementById("guidedTourStepTitle").innerHTML = this.tourStepsCurrent[this.currentStepIndex].stepTitle;

    };

    //=============================================================================
    this.goToPreviousStep = function goToPreviousStep(){

        if(this.currentStepIndex === 1){
            return;
        }

        this.currentStepIndex += -1;
        this.docs.currentDoc = this.tourStepsCurrent[this.currentStepIndex].doc;
        this.docs.updateBrowser();
        this.docs.focusOnDoc();

        document.getElementById("guidedTourText1").innerHTML = this.tourStepsCurrent[this.currentStepIndex].text1;
        document.getElementById("guidedTourText2").innerHTML = this.tourStepsCurrent[this.currentStepIndex].text2;

    };

    //=============================================================================
    this.goToNextTour = function goToNextTour(){

        if(this.currentTourIndex + 1 >= this.tours.length){
            return;
        }

        this.currentTourIndex += 1;
        this.selectTour(this.currentTourIndex);

    };

    //=============================================================================
    this.goToPreviousTour = function goToPreviousTour(){

        if(this.currentTourIndex === 0){
            return;
        }

        this.currentTourIndex += -1;
        this.selectTour(this.currentTourIndex);

    };

    /**
     * Returns the current tour step
     */
    //=============================================================================
    this.getCurrentTourStep = function getCurrentTourStep()
    {
        if (this.guidedTour.length != 0)
            return this.guidedTour[this.stepIndex];
        else
        {
            return null;
        }
    }

    this.getPreviousStep = function getPreviousStep(){

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
/**
* Constructor for TourStep
* TourSteps are object with properties : index, document, text1 and text2.
* They are the individual steps of which guided tours are made.
* @param docHandler : an instance of DocumentHandler (required)
* @param dataFile : CSV file holding the Guided Tours data
* @param options : optional parameters (including temporal)
*/
//=============================================================================
function TourStep(doc, stepTitle, text1, text2) {

    // document to show
    this.doc=doc;

    // step title
    this.stepTitle = stepTitle;

    // text for this step (displayed in the guided tour window)
    this.text1 = text1;

    // document text (context) for this step (displayed in doc browser window)
    this.text2 = text2;

}
