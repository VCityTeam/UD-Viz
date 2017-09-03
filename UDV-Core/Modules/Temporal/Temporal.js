/**
* Generated On: 2016-05-18
* Class: Temporal Controller
* Description : TO DO
*/
var temporalWindowIsActive = false;


/**
* Constructor
* @param domElement :
* @param view :
* @param controls :
*/

function TemporalController(view, controls, buildingVersions, buildingDates, startDate) {


    this.view = view;

    this.controls = controls;

    this.buildingVersions = buildingVersions;
    this.buildingDates = buildingDates;
    this.buildingPositions = [];

    this.currentDate = new Date(startDate);
    this.currentVersion = null;
    this.currentVersionIndex = -1;
    this.lastVersionIndex = -2;

    this.minDate = new Date( "1700-01-01" );
    this.maxDate = new Date( "2050-01-01" );

    this.enabled = false;
    this.isInConcurrentView = false;

    this.initialize = function initialize(){

        this.buildingVersions.forEach((element)=>{
                this.buildingPositions.push(element.position.clone());
        });

        this.enabled = true;

        this.syncBuildingVersionToCurrentDate(true);

        document.getElementById("timeDateSelector").value = this.currentDate.toISOString().substring(0,10);

        document.getElementById("timeSlider").min = this.minDate.getFullYear();
        document.getElementById("timeSlider").max = this.maxDate.getFullYear();
        document.getElementById("timeSlider").value = this.currentDate.getFullYear();
        document.getElementById("timeSliderMinDate").innerHTML = this.minDate.getFullYear();
        document.getElementById("timeSliderMaxDate").innerHTML = this.maxDate.getFullYear();
    };

    this.syncBuildingVersionToCurrentDate = function syncBuildingVersionToCurrentDate(forceSync){

        if(!this.enabled){
            return;
        }
        if(this.isInConcurrentView){
            this.toggleConcurrentView();
            return;
        }

        this.buildingDates.forEach((element,index)=>{

            if(this.currentDate >= element){
                this.currentVersionIndex = index;
            }

        });

        if(this.currentVersionIndex === this.lastVersionIndex && !forceSync){
            return;
        }


        this.buildingVersions.forEach((element, index)=>{

            if(index === this.currentVersionIndex){

                this.view.scene.add(element);
                this.currentVersion = element;

            }
            else{
                this.view.scene.remove(element);
            }


        });

        this.lastVersionIndex = this.currentVersionIndex;

        this.view.notifyChange(true);

    };

    this.toggleConcurrentView = function toggleConcurrentView(){

        if(!this.enabled){
            return;
        }

        this.isInConcurrentView = !this.isInConcurrentView;

        if(this.isInConcurrentView){
            this.view.scene.remove(this.currentVersion);

            this.buildingVersions.forEach((element, index)=>{

                element.position.z += 40 * (this.buildingVersions.length-1 - index);
                element.updateMatrixWorld();

                this.view.scene.add(element);

            });
        }
        else{

            this.buildingVersions.forEach((element, index)=>{

                element.position.copy(this.buildingPositions[index]);

                element.updateMatrixWorld();
            });

            this.syncBuildingVersionToCurrentDate(true);

        }

        this.view.notifyChange(true);

    }

    this.timeSelection = function timeSelection(){
        if(!this.enabled){
            return;
        }

        var date = new Date(document.getElementById("timeDateSelector").value.toString());

        if(!isNaN(date)){

            this.changeDate(date);

        }

    };

    this.timeSelectionSlider = function timeSelectionSlider() {
        if(!this.enabled){
            return;
        }

        var date = new Date(document.getElementById("timeSlider").value.toString());

        if(!isNaN(date)){

            this.changeDate(date);

        }

    };

    this.goToNextDate = function goToNextDate(){

        if(this.currentVersionIndex === this.buildingVersions.length -1){
            return;
        }

        this.changeDate(this.buildingDates[this.currentVersionIndex+1]);


    }

    this.goToPreviousDate = function goToPreviousDate(){

        if(this.currentVersionIndex === 0){
            return;
        }

        this.changeDate(this.buildingDates[this.currentVersionIndex-1]);

    }

    this.changeDate = function changeDate(date){

        document.getElementById("timeSlider").value = date.getFullYear();
        document.getElementById("timeDateSelector").value = date.toISOString().substring(0,10);

        this.currentDate = date;

        this.syncBuildingVersionToCurrentDate(false);


    }

    window.addEventListener('allModelsLoaded', this.initialize.bind(this), false);



    document.getElementById("timeDateSelector").addEventListener('input', this.timeSelection.bind(this), false);
    document.getElementById("timeSlider").addEventListener('input', this.timeSelectionSlider.bind(this), false);
    document.getElementById("timeConcurrentView").addEventListener('mousedown', this.toggleConcurrentView.bind(this), false);
    document.getElementById("timeNextButton").addEventListener('mousedown', this.goToNextDate.bind(this), false);
    document.getElementById("timePreviousButton").addEventListener('mousedown', this.goToPreviousDate.bind(this), false);



}



document.getElementById("temporalTab").onclick = function () {
    document.getElementById('temporalWindow').style.display = temporalWindowIsActive ? "none" : "block";
    temporalWindowIsActive = temporalWindowIsActive ? false : true;
};
