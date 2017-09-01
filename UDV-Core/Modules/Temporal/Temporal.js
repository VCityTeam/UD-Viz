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

    this.currentDate = new Date(startDate);
    this.lastVersionIndex = -1;

    this.minDate = new Date( "1700-01-01" );
    this.maxDate = new Date( "2050-01-01" );

    this.initialize = function initialize(){

        console.log("temporal init : ", this.buildingDates);

        this.syncBuildingVersionToCurrentDate();

        document.getElementById("timeDateSelector").value = this.currentDate.toISOString().substring(0,10);

        document.getElementById("timeSlider").min = this.minDate.getFullYear();
        document.getElementById("timeSlider").max = this.maxDate.getFullYear();
        document.getElementById("timeSlider").value = this.currentDate.getFullYear();
        document.getElementById("timeSliderMinDate").innerHTML = this.minDate.getFullYear();
        document.getElementById("timeSliderMaxDate").innerHTML = this.maxDate.getFullYear();
    };

    this.syncBuildingVersionToCurrentDate = function syncBuildingVersionToCurrentDate(){

        let currentVersionIndex = 0;

        this.buildingDates.forEach((element,index)=>{

            if(this.currentDate > element){
                currentVersionIndex = index;
            }

        });

        if(currentVersionIndex === this.lastVersionIndex){
            return;
        }


        this.buildingVersions.forEach((element, index)=>{

            if(index === currentVersionIndex){

                this.view.scene.add(element);

            }
            else{
                this.view.scene.remove(element);
            }

            this.view.notifyChange(true);
        });

        this.lastVersionIndex = currentVersionIndex;

    };



    this.timeSelection = function timeSelection(){


        var d = new Date(document.getElementById("timeDateSelector").value.toString());

        if(!isNaN(d)){

            document.getElementById("timeSlider").value = d.getFullYear();

            this.currentDate = d;

            this.syncBuildingVersionToCurrentDate();

        }

    };

    this.timeSelectionSlider = function timeSelectionSlider() {

        var d = new Date(document.getElementById("timeSlider").value.toString());

        if(!isNaN(d)){

            document.getElementById("timeDateSelector").value = d.toISOString().substring(0,10);

            this.currentDate = d;

            this.syncBuildingVersionToCurrentDate();

        }

    };

    window.addEventListener('allModelsLoaded', this.initialize.bind(this), false);



    document.getElementById("timeDateSelector").addEventListener('input', this.timeSelection.bind(this), false);
    document.getElementById("timeSlider").addEventListener('input', this.timeSelectionSlider.bind(this), false);



}



document.getElementById("temporalTab").onclick = function () {
    document.getElementById('temporalWindow').style.display = temporalWindowIsActive ? "none" : "block";
    temporalWindowIsActive = temporalWindowIsActive ? false : true;


};
