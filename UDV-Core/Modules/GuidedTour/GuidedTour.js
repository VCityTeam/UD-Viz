

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
    <button id="guidedTourNextButton" type=button>SUIVANT</button>\
    <button id="guidedTourPreviousButton" type=button>PRECEDENT</button>\
    <button id="guidedTourExitButton" type=button>SORTIE</button>\
    <button id="guidedTourStartButton" type=button>DEMARRER</button>\
</div>\
';

/**
* Constructor for GuidedTourController
* The controller reads data from a csv file to build one or more guided tours
* Each guided tour is a succession of "steps"
* Each step has a document + tour text + doc text (steps are instances of the TourStep class)
* Multiple guided tours are supported but there is no way yet to choose a specific tour at runtime
* The guided tour which will be accessible by the user is specified by startingTourIndex
* This controller is initialized after DocumentHandler has finished initializing
* @param docHandler : an instance of DocumentHandler (required)
*/
//=============================================================================
function GuidedTourController(docHandler, options={}) {

    // DocumentHandler instance, required
    this.docs = docHandler;

    // TemporalController instance, optional
    this.temporal = options.temporal;

    // The tour steps of the currently active guided tour
    this.tourStepsCurrent = null;

    // Array of all the guided tours loaded from the csv file
    this.tours = [];

    // index of the tour accessible by the user (loaded by default)
    // as of now, there is no way to choose a specific tour at runtime
    const startingTourIndex = 0;

    // path to the csv file holding the guided tour data
    const CSVdataFile = "visite.csv";

    // boolean to control the state of the guided tour window (open/closed)
    this.guidedTourWindowIsActive = false;

    // the current step index of the current tour
    this.currentStepIndex = 0;

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

        // display the introduction (step 0) for the current tour
        this.setupIntro();

    }

    // loads the steps from the chosen tour
    //=============================================================================
    this.selectTour = function selectTour(index){

        this.tourStepsCurrent = this.tours[index];
    }

    // setup the display for the introduction (buttons, image, text...)
    //=============================================================================
    this.setupIntro = function setupIntro(){

        // hide & show elements
        document.getElementById("guidedTourPreviousButton").style.display = "none";
        document.getElementById("guidedTourNextButton").style.display = "none";
        document.getElementById("guidedTourExitButton").style.display = "none";
        document.getElementById("guidedTourText2").style.display = "none";
        document.getElementById("guidedTourStartButton").style.display = "block";
        document.getElementById("guidedTourDocPreviewImg").style.display = "inline-block";

        // setup image & text
        document.getElementById("guidedTourDocPreviewImg").src = this.tourStepsCurrent[0].doc.imageSourceBD;
        document.getElementById("guidedTourText1").innerHTML = this.tourStepsCurrent[0].text1;
        document.getElementById("guidedTourTitle").innerHTML = this.tourStepsCurrent[0].stepTitle;
        document.getElementById("guidedTourStepTitle").innerHTML = null;



    }

    // Actual start of a guided tour, will modify behavior of other controllers
    //=============================================================================
    this.startGuidedTour = function startGuidedTour(){

        // setup the display (hide & show elements)
        document.getElementById("guidedTourPreviousButton").style.display = "block";
        document.getElementById("guidedTourNextButton").style.display = "block";
        document.getElementById("guidedTourExitButton").style.display = "block";
        document.getElementById("guidedTourText2").style.display = "inline-block";
        document.getElementById("guidedTourStartButton").style.display = "none";
        document.getElementById("guidedTourDocPreviewImg").style.display = "none";

        documents.hideBillboards(true);

        // order the TemporalController to enter "guidedtourmode" which can modifiy its behavior
        if(this.temporal){
            this.temporal.startGuidedTourMode();
        }

        // order the DocumentsHandler to enter "guidedtourmode" which can modifiy its behavior
        this.docs.startGuidedTourMode();

        this.currentStepIndex = 0; //index will become 1 in goToNextStep()

        this.goToNextStep();
    };

    // resume normal behavior
    //=============================================================================
    this.exitGuidedTour = function exitGuidedTour(){

        this.selectTour(0);
        this.setupIntro();
        this.docs.showBillboards(false);
        this.docs.closeDocFull();
        if(this.temporal){
            this.temporal.exitGuidedTourMode();
        }
        this.docs.exitGuidedTourMode();
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
        document.getElementById("guidedTourDocPreviewImg").style.display = "none";
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
        this.docs.focusOnDoc();
        document.getElementById("guidedTourDocPreviewImg").style.display = "none";
        document.getElementById("guidedTourText1").innerHTML = this.tourStepsCurrent[this.currentStepIndex].text1;
        document.getElementById("guidedTourText2").innerHTML = this.tourStepsCurrent[this.currentStepIndex].text2;

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
    document.getElementById("guidedTourStartButton").addEventListener('mousedown', this.startGuidedTour.bind(this),false);
    document.getElementById("guidedTourNextButton").addEventListener('mousedown', this.goToNextStep.bind(this),false);
    document.getElementById("guidedTourPreviousButton").addEventListener('mousedown', this.goToPreviousStep.bind(this),false);
    document.getElementById("guidedTourExitButton").addEventListener('mousedown', this.exitGuidedTour.bind(this),false);
    document.getElementById("guidedTourTab").addEventListener('mousedown', this.toggleGuidedTourWindow.bind(this), false);

    // event listener to trigger loadDataFromFile after DocumentsHandler has been initialized
    window.addEventListener('docInit', this.loadDataFromFile.bind(this), false);


}

//TourStep constructor
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
