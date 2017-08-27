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

    this.goToNextStep = function goToNextStep(){

        this.currentIndex += 1;
        this.documentsHandler.currentDoc = this.documentsHandler.AllDocuments[this.tourSteps[this.currentIndex].docIndex];
        this.documentsHandler.orientViewToDoc();
        console.log("tour text : ",this.tourSteps[this.currentIndex].text);
    };

    this.goToPreviousStep = function goToPreviousStep(){

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

document.getElementById("guidedTourText").innerHTML = "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis augue velit, egestas eu posuere faucibus, aliquet sed eros. Donec vel dictum lorem. Sed sed commodo turpis.Vestibulum ornare sapien et purus sollicitudin egestas. Nunc rutrum ac dolor eu imperdiet. Cras lacinia, odio sitamet scelerisque porttitor, nisi mi pharetra tellus, non sagittis est lorem finibus nisi. Aliquam sed dolor quis esttempus finibus quis uturna.Aeneacommodoat sapien quis eleifend. Sed blandit nisi eu nisl dapibus, in efficitur mauris accumsan. Suspendisse potenti. Aenean lacus ex, aliquet at mauris a, vulputate tincidunt nibh. Interdum et malesuada fames ac ante ipsum primis in faucibus. Sed ut massa sed nibh mollis scelerisque.</p>";
document.getElementById("docBrowserText").innerHTML = "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis augue velit, egestas eu posuere faucibus, aliquet sed eros. Donec vel dictum lorem. Sed sed commodo turpis.Vestibulum ornare sapien et purus sollicitudin egestas. Nunc rutrum ac dolor eu imperdiet. Cras lacinia, odio sitamet scelerisque porttitor, nisi mi pharetra tellus, non sagittis est lorem finibus nisi. Aliquam sed dolor quis esttempus finibus quis uturna.Aeneacommodoat sapien quis eleifend. Sed blandit nisi eu nisl dapibus, in efficitur mauris accumsan. Suspendisse potenti. Aenean lacus ex, aliquet at mauris a, vulputate tincidunt nibh. Interdum et malesuada fames ac ante ipsum primis in faucibus. Sed ut massa sed nibh mollis scelerisque.</p>";
