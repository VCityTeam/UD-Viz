/**
* Classes: GuidedTourController & TourStep
* Description :
* The GuidedTourController is an object holding TourSteps objects
* It handles the display of guided tours in the guided tour window, and all the 
* functionalities related to the guided tour (start, exit, next, previous...)
* TourSteps are object with properties : index, document, text1 and text2.
* They are the individual steps of which guided tours are made.
*/

// update the html with elements for this class (windows, buttons etc)
var tourDiv = document.createElement("div");
tourDiv.id = 'guidedtour';
document.body.appendChild(tourDiv);
document.getElementById("guidedtour").innerHTML = '\
<button id="guidedTourTab">VISITE</button>\
<div id="guidedTourWindow">\
    <div id="guidedTourTitle"></div>\
    <div id="guidedTourStepTitle"></div>\
    <div id="guidedTourText1"></div>\
    <div id="guidedTourDocPreview"><img id="guidedTourDocPreviewImg"/></div>\
    <button id="guidedTourNextStepButton" type=button>SUIVANT</button>\
    <button id="guidedTourNextTourButton" type=button>⇨</button>\
    <button id="guidedTourPreviousStepButton" type=button>PRECEDENT</button>\
    <button id="guidedTourPreviousTourButton" type=button>⇦</button>\
    <button id="guidedTourExitButton" type=button>SORTIE</button>\
    <button id="guidedTourStartButton" type=button>DEMARRER</button>\
</div>\
';

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
function GuidedTourController(docHandler, dataFile, options={}) {

    // DocumentHandler instance, required
    this.docs = docHandler;

    // TemporalController instance, optional
    this.temporal = options.temporal;

    // The tour steps of the currently active guided tour
    this.tourStepsCurrent = null;

    // the current step index of the current tour
    this.currentStepIndex = 0;

    // Array of all the guided tours loaded from the csv file
    this.tours = [];

    // the current tour index
    this.currentTourIndex = 0;

    // index of the tour accessible by the user (loaded by default)
    // as of now, there is no way to choose a specific tour at runtime
    const startingTourIndex = 0;

    // path to the csv file holding the guided tour data
    const CSVdataFile = dataFile;

    // boolean to control the state of the guided tour window (open/closed)
    this.guidedTourWindowIsActive = false;

    // for the demo : if this is true, hide the buttons for changing tour
    this.preventUserFromChangingTour = options.preventUserFromChangingTour || false;


    /**
    * initialize the controller using data from the csv file
    * this function is called after the completion of readCSVFile() in this.loadDataFromFile()
    * @param tourDataFromFile : contains the data loaded from the file
    */
    //=============================================================================
    this.initialize = function initialize(tourDataFromFile){

        // parse the data
        for (var i=0; i<tourDataFromFile.length; i++) {

            // data of line (i) : each line is a tourstep
            // step 0 of each tour is the intro
            var stepData = tourDataFromFile[i];

            // index of the tour (must be ordered in the file, 0 then 1 then 2...)
            var tourIndex = parseFloat(stepData[0]);

            // index of the document for this step
            var docIndex = parseFloat(stepData[1]);

            // step title
            var stepTitle = stepData[2];

            // text for this step (displayed in the guided tour window)
            var text1 = stepData[3].toString();

            // document text (context) for this step (displayed in doc browser window)
            var text2 = stepData[4].toString();

            // if this step belongs to a new tour, we add a new array in this.tours
            if(this.tours.length===tourIndex){
                this.tours.push([]);
            }

            // add the tourstep to the tour
            this.tours[tourIndex].push(new TourStep(this.docs.AllDocuments[docIndex],stepTitle,text1,text2));

        }

        // select the tour which will be accessible from the guided tour window
        this.selectTour(startingTourIndex);

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

    // Actual start of a guided tour, will modify behavior of other controllers
    //=============================================================================
    this.startGuidedTour = function startGuidedTour(){

        // setup the display (hide & show elements)
        document.getElementById("guidedTourPreviousTourButton").style.display = "none";
        document.getElementById("guidedTourNextTourButton").style.display = "none";
        document.getElementById("guidedTourPreviousStepButton").style.display = "block";
        document.getElementById("guidedTourNextStepButton").style.display = "block";
        document.getElementById("guidedTourExitButton").style.display = "block";
        document.getElementById("guidedTourText2").style.display = "inline-block";
        document.getElementById("guidedTourStartButton").style.display = "none";
        document.getElementById("guidedTourDocPreviewImg").style.display = "none";

        // bigger text block
        document.getElementById("guidedTourText1").style.height = "60%";

        documents.hideBillboards(true);

        // modify temporal
        if(this.temporal){
            // open window if closed
            if(!this.temporal.temporalWindowIsActive){
                this.temporal.toggleTemporalWindow();
            }
            // hide concurrent view button
            document.getElementById("timeConcurrentView").style.display = "none";
        }

        // open doc window and hide some buttons
        if(!this.docs.docBrowserWindowIsActive){
            this.docs.docBrowserWindowIsActive = true;
            document.getElementById('docBrowserWindow').style.display = "block";
        }
        document.getElementById('docBrowserPreviousButton').style.display = "none";
        document.getElementById('docBrowserNextButton').style.display = "none";
        document.getElementById('docBrowserIndex').style.display = "none";

        this.currentStepIndex = 0; //index will become 1 in goToNextStep()

        this.goToNextStep();
    };

    // resume normal behavior
    //=============================================================================
    this.exitGuidedTour = function exitGuidedTour(){

        this.selectTour(0);
        this.docs.showBillboards(false);
        this.docs.closeDocFull();

        if(this.temporal){
            // show concurrent view button
            document.getElementById("timeConcurrentView").style.display = "block";
        }

        // show the regular buttons for doc window
        document.getElementById('docBrowserPreviousButton').style.display = "block";
        document.getElementById('docBrowserNextButton').style.display = "block";
        document.getElementById('docBrowserIndex').style.display = "block";
    };

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

    // hide or show the guided tour window
    //=============================================================================
    this.toggleGuidedTourWindow = function toggleGuidedTourWindow(){

        document.getElementById('guidedTourWindow').style.display = this.guidedTourWindowIsActive ? "none" : "block";
        this.guidedTourWindowIsActive = this.guidedTourWindowIsActive ? false : true;

        if(!this.guidedTourWindowIsActive){
            this.exitGuidedTour();
        }


    }

    // will be called after the DocumentsHandler has been initialized
    //=============================================================================
    this.loadDataFromFile = function loadDataFromFile(){

        // read the data and loads it in an object given as parameter to this.initialize
        readCSVFile(CSVdataFile, this.initialize.bind(this));

    }

    // event listeners (buttons)
    document.getElementById("guidedTourNextTourButton").addEventListener('mousedown', this.goToNextTour.bind(this),false);
    document.getElementById("guidedTourPreviousTourButton").addEventListener('mousedown', this.goToPreviousTour.bind(this),false);
    document.getElementById("guidedTourStartButton").addEventListener('mousedown', this.startGuidedTour.bind(this),false);
    document.getElementById("guidedTourNextStepButton").addEventListener('mousedown', this.goToNextStep.bind(this),false);
    document.getElementById("guidedTourPreviousStepButton").addEventListener('mousedown', this.goToPreviousStep.bind(this),false);
    document.getElementById("guidedTourExitButton").addEventListener('mousedown', this.exitGuidedTour.bind(this),false);
    document.getElementById("guidedTourTab").addEventListener('mousedown', this.toggleGuidedTourWindow.bind(this), false);

    // event listener to trigger loadDataFromFile after DocumentsHandler has been initialized
    window.addEventListener('docInit', this.loadDataFromFile.bind(this), false);


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
