

var guidedTourWindowIsActive = false;
/**
* Constructor
* @param domElement :
* @param view :
* @param controls :
*/

function GuidedTour(docHandler) {

    this.docs = docHandler;

    this.tourSteps = [];

    this.tourSteps.push(new TourStep(this.docs.AllDocuments[0],step1text,step1text2));
    this.tourSteps.push(new TourStep(this.docs.AllDocuments[2],step2text,step2text2));
    this.tourSteps.push(new TourStep(this.docs.AllDocuments[3],step3text,step3text2));
    this.tourSteps.push(new TourStep(this.docs.AllDocuments[1],step4text,step4text2));

    this.currentIndex = 0;

    this.initialize = function initialize(){

        document.getElementById("guidedTourPreviousButton").style.display = "none";
        document.getElementById("guidedTourNextButton").style.display = "none";
        document.getElementById("guidedTourExitButton").style.display = "none";
        document.getElementById("guidedTourText2").style.display = "none";
        document.getElementById("guidedTourStartButton").style.display = "block";
        document.getElementById("guidedTourDocPreviewImg").src = this.tourSteps[0].doc.imageSourceBD;
        document.getElementById("guidedTourText1").innerHTML = tourInitText1;
        document.getElementById("guidedTourText2").innerHTML = tourInitText2;

    }

    this.startGuidedTour = function startGuidedTour(){

        document.getElementById("guidedTourPreviousButton").style.display = "block";
        document.getElementById("guidedTourNextButton").style.display = "block";
        document.getElementById("guidedTourExitButton").style.display = "block";
        document.getElementById("guidedTourText2").style.display = "inline-block";
        document.getElementById("guidedTourStartButton").style.display = "none";
        document.getElementById("guidedTourDocPreviewImg").src = this.tourSteps[0].doc.imageSourceBD;

        documents.hideBillboards();

        this.currentIndex = -1; //index will become 0 in goToNextStep()
        this.goToNextStep();
    };

    this.exitGuidedTour = function exitGuidedTour(){

        this.initialize(); //temporary
        this.docs.showBillboards();
        this.docs.closeDocFull();
    };


    this.goToNextStep = function goToNextStep(){

        if(this.currentIndex + 1 >= this.tourSteps.length){
            return;
        }

        this.currentIndex += 1;
        this.docs.currentDoc = this.tourSteps[this.currentIndex].doc;
        this.docs.orientViewToDoc();
        document.getElementById("guidedTourDocPreviewImg").src = this.tourSteps[this.currentIndex].doc.imageSourceBD;
        document.getElementById("guidedTourText1").innerHTML = this.tourSteps[this.currentIndex].text1;
        document.getElementById("guidedTourText2").innerHTML = this.tourSteps[this.currentIndex].text2;

    };

    this.goToPreviousStep = function goToPreviousStep(){

        if(this.currentIndex === 0){
            return;
        }

        this.currentIndex += -1;
        this.docs.currentDoc = this.tourSteps[this.currentIndex].doc;
        this.docs.orientViewToDoc();
        document.getElementById("guidedTourDocPreviewImg").src = this.tourSteps[this.currentIndex].doc.imageSourceBD;
        document.getElementById("guidedTourText1").innerHTML = this.tourSteps[this.currentIndex].text1;
        document.getElementById("guidedTourText2").innerHTML = this.tourSteps[this.currentIndex].text2;

    };

    document.getElementById("guidedTourStartButton").addEventListener('mousedown', this.startGuidedTour.bind(this),false);
    document.getElementById("guidedTourNextButton").addEventListener('mousedown', this.goToNextStep.bind(this),false);
    document.getElementById("guidedTourPreviousButton").addEventListener('mousedown', this.goToPreviousStep.bind(this),false);
    document.getElementById("guidedTourExitButton").addEventListener('mousedown', this.exitGuidedTour.bind(this),false);

    this.initialize();

}

function TourStep(doc, text1, text2) {


    this.doc=doc;
    this.text1 = text1;
    this.text2 = text2;


}

document.getElementById("guidedTourTab").onclick = function () {
    document.getElementById('guidedTourWindow').style.display = guidedTourWindowIsActive ? "none" : "block";
    guidedTourWindowIsActive = guidedTourWindowIsActive ? false : true;


};

var tourTitle = "Les processus incrémentaux : l’exemple de l’îlot du lac (1725 à aujourd’hui)";

document.getElementById("guidedTourTitle").innerHTML = tourTitle;

var tourInitText1 = " L’histoire de l’îlot du lac pendant 300 ans est un parfait exemple de l’évolution spontanée d’un îlot urbain. Elle montre comment il nait, se développe, puis est rasé et reconstruit. Elle permet surtout de comprendre le mécanisme de la lente densification progressive, sans volonté planificatrice de quiconque, propriétaire foncier ou pouvoirs publiques. C’est ce que l’on appelle un « processus incrémental »: personne n’a décidé au départ que l’îlot devrait évoluer de cette façon, pourtant, des siècles plus tard, le résultat est bien là, logique et cohérent.";

var tourInitText2 = "Sur ce plan de 1949, la séparation de l’îlot en deux est claire. Dans la partie située à l’est subsiste toujours des bâtiments placés en diagonale, influencés par le lac disparu pourtant depuis longtemps.";

var step1text = "1/ Du rural aux loisirs : l’évolution de la terre du lac avant la création de l’îlot (1725-1851) En 1725 l’ancien « domaine rural de la Part-Dieu » est donné à l’Hôtel-Dieu, principal hôpital de Lyon, par une riche héritière, Catherine Servient. C’est la coutume lyonnaise d’aide aux pauvres dans le contexte d’une société majoritairement catholique. En février 1812, le Rhône inonde la ville avec de gros dégâts sur sa rive gauche. Après la décrue, un lac reste, donnant lieu à la dénomination de « Grand Pré du Lac ». L’exploitation du lieu par des cultivateurs est totalement rurale jusqu’en 1839 où les Hospices civils, formés par la réunion de l’Hôtel Dieu et des autres hôpitaux lyonnais, louent le terrain avec une nouvelle destination : « promenades, jeux de boules et autres amusements publics », car la ville se rapproche."
var step1text2 = "Plan des terrains de la rive gauche du Rhône vers 1760. L'état ancien est superposé au tracé récent du Rhône et des artères principales de Lyon."
var step2text = step1text;
var step2text2 = step1text2;
var step3text = step1text;
var step3text2 = step1text2;
var step4text = step1text;
var step4text2 = step1text2;
