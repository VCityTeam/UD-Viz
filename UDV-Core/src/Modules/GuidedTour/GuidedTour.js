import { readCSVFile } from '../../Tools/CSVLoader.js';
import './GuidedTour.css'

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
export function GuidedTour(guidedTourContainer, guidedTourController) {

  this.guidedTourController = guidedTourController;

  this.tourIndex = 1; //current guided tour. Default is 1 (start)

  this.stepIndex = 1; //current step of the guidedtour. Defautt is 1 (start)

  // boolean to control the state of the guided tour window (open/closed)
  this.guidedTourWindowIsActive = false;

  this.isStart = true;

  this.currentTour = null;
  this.currentStep = null;

  this.guidedTourMode = true;

  // update the html with elements for this class (windows, buttons etc)
  guidedTourContainer.innerHTML = '\
  <button id="guidedTourTab">VISITE</button>\
  <div id="guidedTourWindow">\
  <div id="guidedTourTitle"></div>\
  <div id="guidedTourStepTitle"></div>\
  <div id="guidedTourText1"></div>\
  <div id="guidedTourDocPreview"><img id="guidedTourDocPreviewImg"/></div>\
  <button id="guidedTourNextStepButton" type=button>⇨</button>\
  <button id="guidedTourNextTourButton" type=button>⇨</button>\
  <button id="guidedTourPreviousStepButton" type=button>⇦</button>\
  <button id="guidedTourPreviousTourButton" type=button>⇦</button>\
  <button id="guidedTourExitButton" type=button>SORTIE</button>\
  <button id="guidedTourStartButton" type=button>START</button>\
  </div>\
  ';

  //update browser view
  var guidedTourText2 = document.createElement('div');
  guidedTourText2.id = 'guidedTourText2';
  document.getElementById('docBrowserWindow').appendChild(guidedTourText2);
  document.getElementById('guidedTourText2').style.display = "block";

  // hide or show the guided tour window
  //=============================================================================
  this.toggleGuidedTourWindow = function toggleGuidedTourWindow(){

      document.getElementById('guidedTourWindow').style.display = this.guidedTourWindowIsActive ? "none" : "block";
      this.guidedTourWindowIsActive = this.guidedTourWindowIsActive ? false : true;

      if(this.isStart){
        this.startBrowser();
        this.isStart = false;
      }
  }

  this.startBrowser = function startBrowser(){
    this.guidedTourController.getGuidedTours();
    this.previewTour();

  }

  this.previewTour = function previewTour(){
    document.getElementById('guidedTourTitle').innerHTML = this.guidedTourController.getCurrentTour().name;
    document.getElementById('guidedTourText1').innerHTML = this.guidedTourController.getCurrentTour().description;
  }

  //udpates the browser with text2
  this.updateBrowser = function updateBrowser(){

    document.getElementById("guidedTourText2").innerHTML = this.currentStep.text2;
  }

  this.updateLeftwindow = function updateLeftwindow(){

    document.getElementById("guidedTourText1").innerHTML = this.currentStep.text1;
    document.getElementById('guidedTourStepTitle').innerHTML = this.currentStep.title;

  }

  this.updateStep = function updateStep(){
    this.currentTourIndex = 1;
    this.currentStep = this.guidedTourController.getCurrentStep();
    this.updateBrowser();
    this.updateLeftwindow();
    //DIRTY
    this.guidedTourController.documentController.documentBrowser.currentMetadata = this.currentStep.document.metaData;
    this.guidedTourController.documentController.documentBrowser.currentDoc = this.currentStep.document;
    this.guidedTourController.documentController.documentBrowser.focusOnDoc();
  }

  //
  //=============================================================================
  this.startGuidedTour = function startGuidedTour(){

    this.guidedTourMode = true;

    //loads guidedTour
    this.currentTourIndex = 1;
    //this.guidedTourController.getCurrentStep();
    this.updateStep();

    // setup the display (hide & show elements)
    document.getElementById("guidedTourPreviousTourButton").style.display = "none";
    document.getElementById("guidedTourNextTourButton").style.display = "none";
    document.getElementById("guidedTourPreviousStepButton").style.display = "block";
    document.getElementById("guidedTourNextStepButton").style.display = "block";
    document.getElementById("guidedTourExitButton").style.display = "block";
    document.getElementById("guidedTourText2").style.display = "inline-block";
    document.getElementById("guidedTourStartButton").style.display = "none";
    document.getElementById("guidedTourDocPreviewImg").style.display = "none";
    document.getElementById("resetFilters").style.display = "none";
    // bigger text block
    document.getElementById("guidedTourText1").style.height = "60%";
  //  this.guidedTourController.documentController.documentBillboard.hideBillboards(true);
    this.guidedTourController.documentController.documentBrowser.activateWindow(true);


/*
      // modify temporal
      if(this.temporal){
          // open window if closed
          if(!this.temporal.temporalWindowIsActive){
              this.temporal.activateWindow();
          }
          // hide concurrent view button
          document.getElementById("timeConcurrentView").style.display = "none";
      }*/
      /*
      // open doc window and hide some buttons
      if(!this.docs.docBrowserWindowIsActive){
          this.docs.docBrowserWindowIsActive = true;
          document.getElementById('docBrowserWindow').style.display = "block";
      }*/
      document.getElementById('docBrowserPreviousButton').style.display = "none";
      document.getElementById('docBrowserNextButton').style.display = "none";
      document.getElementById('docBrowserIndex').style.display = "none";

      this.currentStepIndex = 0; //index will become 1 in goToNextStep()

  //    this.goToNextStep();
  };

  // resume normal behavior
  //=============================================================================
  this.exitGuidedTour = function exitGuidedTour(){
      //
      // this.selectTour(0);
      // this.docs.showBillboards(false);
      // this.docs.closeDocFull();
      //
      // if(this.temporal){
      //     // show concurrent view button
      //     document.getElementById("timeConcurrentView").style.display = "block";
      // }
      //
      // // show the regular buttons for doc window
      // document.getElementById('docBrowserPreviousButton').style.display = "block";
      // document.getElementById('docBrowserNextButton').style.display = "block";
      // document.getElementById('docBrowserIndex').style.display = "block";
  };

  this.nextTour = function nextTour(){

    this.guidedTourController.getNextTour();
    if(this.tourIndex < this.guidedTourController.guidedTours.length){
      this.tourIndex ++;
    }
    this.previewTour();
  }

  this.previousTour = function previousTour(){
    this.guidedTourController.getPreviousTour();
    if(this.tourIndex > 1 ){
      this.tourIndex --;
    }
    this.previewTour();
  }

  this.previousStep = function previousStep(){

    this.currentStep = this.guidedTourController.getNextStep();
    if(this.stepIndex < this.guidedTourController.currentGuidedTour.length){
      this.stepIndex ++;
    }
    this.updateStep();
  }

  this.nextStep = function nextStep(){

    this.currentStep = this.guidedTourController.getPreviousStep();
    if( this.stepIndex > 1 ){
      this.stepIndex --;
    }
    this.updateStep();

  }

  // event listeners (buttons)
  document.getElementById("guidedTourNextTourButton").addEventListener('mousedown', this.nextTour.bind(this),false);
  document.getElementById("guidedTourPreviousTourButton").addEventListener('mousedown', this.previousTour.bind(this),false);
  document.getElementById("guidedTourStartButton").addEventListener('mousedown', this.startGuidedTour.bind(this),false);
  document.getElementById("guidedTourNextStepButton").addEventListener('mousedown', this.nextStep.bind(this),false);
  document.getElementById("guidedTourPreviousStepButton").addEventListener('mousedown', this.previousStep.bind(this),false);
  // document.getElementById("guidedTourExitButton").addEventListener('mousedown', this.exitGuidedTour.bind(this),false);
  document.getElementById("guidedTourTab").addEventListener('mousedown', this.toggleGuidedTourWindow.bind(this), false);

}
