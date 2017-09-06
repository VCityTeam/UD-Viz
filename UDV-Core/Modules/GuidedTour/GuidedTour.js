

//update the html with elements for this class (windows, buttons etc)
var tourDiv = document.createElement("div");
tourDiv.id = 'guidedtour';
document.body.appendChild(tourDiv);

document.getElementById("guidedtour").innerHTML = '<button id="guidedTourTab">VISITE</button>\
<div id="guidedTourWindow">\
    <div id="guidedTourTitle"></div>\
    <div id="guidedTourStepTitle"></div>\
    <div id="guidedTourText1"></div>\
    <div id="guidedTourDocPreview"><img id="guidedTourDocPreviewImg" src = "test2.png"/></div>\
    <button id="guidedTourNextButton" type=button>SUIVANT</button>\
    <button id="guidedTourPreviousButton" type=button>PRECEDENT</button>\
    <button id="guidedTourExitButton" type=button>SORTIE</button>\
    <button id="guidedTourStartButton" type=button>DEMARRER</button>\
</div>';

/**
* Constructor
* @param domElement :
* @param view :
* @param controls :
*/
//=============================================================================
function GuidedTour(docHandler, options={}) {

    this.docs = docHandler;
    this.temporal = options.temporal;
    this.tourStepsCurrent = null;
    this.tours = [];

    this.guidedTourWindowIsActive = false;


    this.currentIndex = 0;

    //=============================================================================
    this.initialize = function initialize(tourDataFromFile){

        for (var i=0; i<tourDataFromFile.length; i++) {

            var tourData = tourDataFromFile[i];
            var tourIndex = parseFloat(tourData[0]);
            var docIndex = parseFloat(tourData[1]);
            var stepTitle = tourData[2];
            var text1 = tourData[3].toString();
            var text2 = tourData[4].toString();

            if(this.tours.length===tourIndex){
                this.tours.push([]);
            }

            this.tours[tourIndex].push(new TourStep(this.docs.AllDocuments[docIndex],stepTitle,text1,text2));

        }

        this.selectTour(0);

        this.setupIntro();

    }

    this.selectTour = function selectTour(index){

        this.tourStepsCurrent = this.tours[index];
    }

    //=============================================================================
    this.setupIntro = function setupIntro(){

        document.getElementById("guidedTourPreviousButton").style.display = "none";
        document.getElementById("guidedTourNextButton").style.display = "none";
        document.getElementById("guidedTourExitButton").style.display = "none";
        document.getElementById("guidedTourText2").style.display = "none";
        document.getElementById("guidedTourStartButton").style.display = "block";
        document.getElementById("guidedTourDocPreviewImg").style.display = "inline-block";
        document.getElementById("guidedTourDocPreviewImg").src = this.tourStepsCurrent[0].doc.imageSourceBD;

        document.getElementById("guidedTourText1").innerHTML = this.tourStepsCurrent[0].text1;
        document.getElementById("guidedTourTitle").innerHTML = this.tourStepsCurrent[0].stepTitle;
        document.getElementById("guidedTourStepTitle").innerHTML = null;



    }

    //=============================================================================
    this.startGuidedTour = function startGuidedTour(){

        document.getElementById("guidedTourPreviousButton").style.display = "block";
        document.getElementById("guidedTourNextButton").style.display = "block";
        document.getElementById("guidedTourExitButton").style.display = "block";
        document.getElementById("guidedTourText2").style.display = "inline-block";
        document.getElementById("guidedTourStartButton").style.display = "none";
        document.getElementById("guidedTourDocPreviewImg").style.display = "none";

        documents.hideBillboards(true);

        if(this.temporal){
            this.temporal.startGuidedTourMode();
        }

        this.docs.startGuidedTourMode();

        this.currentIndex = 0; //index will become 1 in goToNextStep()
        this.goToNextStep();
    };

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

        if(this.currentIndex + 1 >= this.tourStepsCurrent.length){
            return;
        }

        this.currentIndex += 1;
        this.docs.currentDoc = this.tourStepsCurrent[this.currentIndex].doc;
        this.docs.updateBrowser();
        this.docs.focusOnDoc();
        document.getElementById("guidedTourDocPreviewImg").style.display = "none";
        document.getElementById("guidedTourText1").innerHTML = this.tourStepsCurrent[this.currentIndex].text1;
        document.getElementById("guidedTourText2").innerHTML = this.tourStepsCurrent[this.currentIndex].text2;
        document.getElementById("guidedTourStepTitle").innerHTML = this.tourStepsCurrent[this.currentIndex].stepTitle;

    };

    //=============================================================================
    this.goToPreviousStep = function goToPreviousStep(){

        if(this.currentIndex === 1){
            return;
        }

        this.currentIndex += -1;
        this.docs.currentDoc = this.tourStepsCurrent[this.currentIndex].doc;
        this.docs.focusOnDoc();
        document.getElementById("guidedTourDocPreviewImg").style.display = "none";
        document.getElementById("guidedTourText1").innerHTML = this.tourStepsCurrent[this.currentIndex].text1;
        document.getElementById("guidedTourText2").innerHTML = this.tourStepsCurrent[this.currentIndex].text2;

    };

    //=============================================================================
    this.toggleGuidedTourWindow = function toggleGuidedTourWindow(){

        document.getElementById('guidedTourWindow').style.display = this.guidedTourWindowIsActive ? "none" : "block";
        this.guidedTourWindowIsActive = this.guidedTourWindowIsActive ? false : true;

        if(!this.guidedTourWindowIsActive){
            this.exitGuidedTour();
        }


    }

    //=============================================================================
    this.loadDataFromFile = function loadDataFromFile(){

        readCSVFile("visite.csv", this.initialize.bind(this));

    }

    document.getElementById("guidedTourStartButton").addEventListener('mousedown', this.startGuidedTour.bind(this),false);
    document.getElementById("guidedTourNextButton").addEventListener('mousedown', this.goToNextStep.bind(this),false);
    document.getElementById("guidedTourPreviousButton").addEventListener('mousedown', this.goToPreviousStep.bind(this),false);
    document.getElementById("guidedTourExitButton").addEventListener('mousedown', this.exitGuidedTour.bind(this),false);
    document.getElementById("guidedTourTab").addEventListener('mousedown', this.toggleGuidedTourWindow.bind(this), false);

    // replace initi by load doc
    window.addEventListener('docInit', this.loadDataFromFile.bind(this), false);


}

//TourStep constructor
//=============================================================================
function TourStep(doc, stepTitle, text1, text2) {


    this.doc=doc;
    this.stepTitle = stepTitle;
    this.text1 = text1;
    this.text2 = text2;


}

var tourTitle = "Les processus incrémentaux : l’exemple de l’îlot du lac (1725 à aujourd’hui)";

var tourInitText1 = " L’histoire de l’îlot du lac pendant 300 ans est un parfait exemple de l’évolution spontanée d’un îlot urbain. Elle montre comment il nait, se développe, puis est rasé et reconstruit. Elle permet surtout de comprendre le mécanisme de la lente densification progressive, sans volonté planificatrice de quiconque, propriétaire foncier ou pouvoirs publiques. C’est ce que l’on appelle un « processus incrémental »: personne n’a décidé au départ que l’îlot devrait évoluer de cette façon, pourtant, des siècles plus tard, le résultat est bien là, logique et cohérent.";
