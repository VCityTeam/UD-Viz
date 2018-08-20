import './GuidedTour.css'

/**
 * Class: GuidedTour
 * Description :
 * The GuidedTour is an object handling the guidedtour view
 *
 *
 * @param { HTML DOM Element object } guidedTourContainer
 * @param { guidedTourController } guidedTourController : instance of GuidedTourController
 *
//=============================================================================*/
export function GuidedTour(guidedTourContainer, guidedTourController) {

  this.guidedTourController = guidedTourController;

  this.tourIndex = 1; //current guided tour. Default is 1 (start)

  this.stepIndex = 1; //current step of the guidedtour. Defautt is 1 (start)

  // boolean to control the state of the guided tour window (open/closed)
  this.guidedTourWindowIsActive = true;

  this.isStart = true;

  this.currentTour = null; //current guided tour
  this.currentStep = null; //current step of the current guided tour

  //instance of document browser
  this.documentBrowser = this.guidedTourController.browser;

  // update the html with elements for this class (windows, buttons etc)
  guidedTourContainer.innerHTML = '\
  <button id="guidedTourTab">EXPLORE</button>\
  <div id="guidedTourWindow">\
  <div id="guidedTourTitle"></div>\
  <div id="guidedTourStepTitle"></div>\
  <div id="guidedTourText1"></div>\
  <div id="guidedTourDocPreview"><img id="guidedTourDocPreviewImg"/></div>\
  <div id="tourCpt"></div>\
  <button id="guidedTourNextStepButton" type=button>⇨</button>\
  <button id="guidedTourNextTourButton" type=button>⇨</button>\
  <button id="guidedTourPreviousStepButton" type=button>⇦</button>\
  <button id="guidedTourPreviousTourButton" type=button>⇦</button>\
  <button id="guidedTourExitButton" type=button>EXIT</button>\
  <button id="guidedTourStartButton" type=button>START</button>\
  </div>\
  ';

  //update browser view
  var guidedTourText2 = document.createElement('div');
  guidedTourText2.id = 'guidedTourText2';
  document.getElementById('docBrowserWindow').appendChild(guidedTourText2);

  // hide or show the guided tour window
  //=============================================================================
  this.toggleGuidedTourWindow = function toggleGuidedTourWindow(){

    document.getElementById('guidedTourWindow').style.display =
                                this.guidedTourWindowIsActive ? "block" : "none";
    this.guidedTourWindowIsActive = this.guidedTourWindowIsActive ? false : true;

    if(this.isStart){
      this.startGuidedTourMode();
      this.isStart = false;
      this.guidedTourController.toggleGuidedTourButtons(true);
    }
  }

  //get all available guided tour from the database
  this.startGuidedTourMode = function startGuidedTourMode(){
    this.guidedTourController.getGuidedTours();
    this.previewTour();

  }

  /**
   * Initialize the preview of the guided tour
   */
  //=============================================================================
  this.previewTour = function previewTour(){
    document.getElementById('tourCpt').innerHTML = "Tour: "
      + this.tourIndex + " out of " + this.guidedTourController.guidedTours.length;
    document.getElementById("guidedTourPreviousTourButton").style.display = "block";
    document.getElementById("guidedTourNextTourButton").style.display = "block";
    // for the demo, until we have more than one finished guided tour
    // we can prevent user from changing tour by hiding the buttons
    if(this.guidedTourController.preventUserFromChangingTour){
        document.getElementById("guidedTourPreviousTourButton").style.display = "none";
        document.getElementById("guidedTourNextTourButton").style.display = "none";
    }

    document.getElementById("guidedTourPreviousStepButton").style.display = "none";
    document.getElementById("guidedTourNextStepButton").style.display = "none";
    document.getElementById("guidedTourExitButton").style.display = "none";
    document.getElementById("guidedTourText2").style.display = "none";
    document.getElementById("guidedTourStartButton").style.display = "block";

    document.getElementById('guidedTourTitle').innerHTML =
                                  this.guidedTourController.getCurrentTour().name;
    document.getElementById('guidedTourText1').innerHTML =
                           this.guidedTourController.getCurrentTour().description;
    document.getElementById("guidedTourText1").style.height = "45%";
    document.getElementById("guidedTourStepTitle").innerHTML = null;

    document.getElementById('docHead').style.display = "none";
    document.getElementById('resetFilters').style.display = "none";
    document.getElementById('docBrowserInfo').style.display = "none";

  }


  // update step with current step data
  //=============================================================================
  this.updateStep = function updateStep(){

    this.currentStep = this.guidedTourController.getCurrentStep();
    this.documentBrowser.currentMetadata =
                    this.guidedTourController.getCurrentStep().document.metaData;
    this.documentBrowser.currentDoc = this.guidedTourController.getCurrentStep().document;
    this.documentBrowser.updateBrowser();
    document.getElementById("guidedTourText1").innerHTML = this.currentStep.text1;
    document.getElementById('guidedTourStepTitle').innerHTML = this.currentStep.title;
    document.getElementById("guidedTourText2").innerHTML = this.currentStep.text2;
    this.documentBrowser.focusOnDoc();
  }

  //start guided tour
  //=============================================================================
  this.startGuidedTour = function startGuidedTour(){

    if(this.guidedTourController.getCurrentTour().extendedDocs.length > 0){
      this.tourIndex = 1;
      this.stepIndex = 1;
      this.updateStep();
      // setup the display (hide & show elements)
      this.guidedTourController.toggleGuidedTourButtons(false);
      document.getElementById("guidedTourText2").style.display = "inline-block";
      document.getElementById("guidedTourDocPreviewImg").style.display = "none";
      document.getElementById("guidedTourText1").style.height = "60%";
      document.getElementById('docBrowserWindow').style.display = "block";
      document.getElementById('docBrowserPreviousButton').style.display = "none";
      document.getElementById('docBrowserNextButton').style.display = "none";
      document.getElementById('docBrowserIndex').style.display = "none";
      document.getElementById('tourCpt').style.display = "none";
    }
    else {
      alert('This guided tour is empty'); //should never happen. If a guided tour
                                          //doesn't have steps, then it is not a guided tour
    }
  };

  // Quit current guided tour
  //=============================================================================
  this.exitGuidedTour = function exitGuidedTour(){

      this.guidedTourController.reset();
      // show the regular buttons for doc window
      document.getElementById('docBrowserPreviousButton').style.display = "block";
      document.getElementById('docBrowserNextButton').style.display = "block";
      document.getElementById('docBrowserIndex').style.display = "block";
  };

  /**
   * Update guided tour preview by clicking on "guidedTourNextTourButton" button
   */
  //=============================================================================
  this.nextTour = function nextTour(){
    if(this.tourIndex < this.guidedTourController.guidedTours.length){
      this.guidedTourController.getNextTour();
      this.tourIndex ++;
      this.previewTour();
    }
  }

  /**
   * Update guided tour preview by clicking on "guidedTourPreviousTourButton" button
   */
  //=============================================================================
  this.previousTour = function previousTour(){
    this.guidedTourController.getPreviousTour();
    if(this.tourIndex > 1 ){
      this.tourIndex --;
    }
    this.previewTour();
  }

  /**
   * Update step by clicking on "guidedTourNextStepButton" button
   */
  //=============================================================================
  this.nextStep = function nextStep(){

    if(this.stepIndex < this.guidedTourController.getCurrentTour().extendedDocs.length ){
      this.stepIndex ++;
      this.guidedTourController.getNextStep();
          this.updateStep();
    }

  }

  /**
   * Update step by clicking on "guidedTourPreviousStepButton" button
   */
  //=============================================================================
  this.previousStep = function previousStep(){

    if( this.stepIndex > 1 ){
      this.guidedTourController.getPreviousStep();
      this.stepIndex --;
      this.updateStep();
    }
  }

  // event listeners (buttons)
  document.getElementById("guidedTourNextTourButton").addEventListener('mousedown',
                                                this.nextTour.bind(this),false);
  document.getElementById("guidedTourPreviousTourButton").addEventListener('mousedown',
                                            this.previousTour.bind(this),false);
  document.getElementById("guidedTourStartButton").addEventListener('mousedown',
                                         this.startGuidedTour.bind(this),false);
  document.getElementById("guidedTourNextStepButton").addEventListener('mousedown',
                                                this.nextStep.bind(this),false);
  document.getElementById("guidedTourPreviousStepButton").addEventListener('mousedown',
                                            this.previousStep.bind(this),false);
  document.getElementById("guidedTourExitButton").addEventListener('mousedown',
                                          this.exitGuidedTour.bind(this),false);
  document.getElementById("guidedTourTab").addEventListener('mousedown',
                                 this.toggleGuidedTourWindow.bind(this), false);

}
