/**
* Constructor
* @param domElement :
* @param view :
* @param controls :
*/

function GuidedTour(docHandler) {

    this.documentsHandler = docHandler;

    this.tourSteps = [];

    this.tourSteps.push(new TourStep(3,"step1text"));
    this.tourSteps.push(new TourStep(2,"step2text"));
    this.tourSteps.push(new TourStep(1,"step3text"));
    this.tourSteps.push(new TourStep(0,"step4text"));

    this.currentIndex = 0;

    this.startGuidedTour = function startGuidedTour(){

        this.currentIndex = 0;
        this.documentsHandler.currentDoc = this.documentsHandler.AllDocuments[this.tourSteps[this.currentIndex].docIndex];
        this.documentsHandler.orientViewToDoc();
        console.log("tour text : ",this.tourSteps[this.currentIndex].text);
    };

    this.goToNextStep() = function goToNextStep(){

        this.currentIndex += 1;
        this.documentsHandler.currentDoc = this.documentsHandler.AllDocuments[this.tourSteps[this.currentIndex].docIndex];
        this.documentsHandler.orientViewToDoc();
        console.log("tour text : ",this.tourSteps[this.currentIndex].text);
    };

    this.goToPreviousStep() = function goToNextStep(){

        this.currentIndex += -1;
        this.documentsHandler.currentDoc = this.documentsHandler.AllDocuments[this.tourSteps[this.currentIndex].docIndex];
        this.documentsHandler.orientViewToDoc();
        console.log("tour text : ",this.tourSteps[this.currentIndex].text);
    };

}

function TourStep(docIndex, text) {


    this.docIndex=docIndex;
    this.text = text;


}
