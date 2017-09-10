/**
* Class: Temporal Controller
* This controller handles the temporal window inputs (slider, buttons, input field)
* It holds the current date which can changed by the user input or by Document Handler
* For the demo, the controller also has buildingVersions and buildingDates array
* These are used to change the version of a 3d object according to the date
*/

// we use the THREE.js library provided by itowns
THREE = itowns.THREE;

//update the html with elements for this class (windows, buttons etc)
var temporalDiv = document.createElement("div");
temporalDiv.id = 'temporal';
document.body.appendChild(temporalDiv);

document.getElementById("temporal").innerHTML = '<button id="temporalTab">TEMPOREL</button>\
<div id="temporalWindow">\
<div id="timeSliderMinDate"></div>\
<div id="timeSliderMaxDate"></div>\
<input id="timeSlider" type="range">\
<input id="timeDateSelector" type="date">\
<button id="timeNextButton" type=button>⇨</button>\
<button id="timePreviousButton" type=button>⇦</button>\
<button id="timeConcurrentView" type=button>Vue superposée</button>\
</div>\
</div>';


/**
* Constructor for TemporalController Class
* Handles the temporal window functionalities (date inputs)
* Changes which 3d object is displayed according to the date
* Versions of the 3d object are given as param with options.buildingVersions,
* and Dates corresponding to these versions with options.buildingDates
* This object is initialized after the loading of the 3d objects (asynchronous)
* @param view : itowns planar view
* @param controls : PlanarControls instance
* @param options : optional parameters (including buildingVersions & Dates)
*/
//=============================================================================
function TemporalController(view, controls, options={}) {

    this.view = view;

    // PlanarControls instance (required)
    this.controls = controls;

    // array of 3d objects
    this.buildingVersions = options.buildingVersions || [];

    // array of dates (js Date object) corresponding to the 3d objects
    this.buildingDates = options.buildingDates || [];

    // array storing the positions of buildingVersions
    this.buildingPositions = [];

    // the currently active date (javascript Date object)
    this.currentDate = new Date(options.startDate || "2017-09-15");

    // currently active temporal version (3d object)
    this.currentVersion = null;

    // the index to identify an element in the arrays (date, version, position)
    // all arrays have same size and order, so index are valid for any array
    this.currentVersionIndex = -1;
    this.lastVersionIndex = -2;

    // min and max date for the temporal slider
    // (should be in options ? or set up by guided tour ?)
    this.minDate = new Date( "1700-01-01" );
    this.maxDate = new Date( "2018-01-01" );

    // is the controller enabled
    this.enabled = false;

    // concurrent view = all temporal versions on top of each other
    this.isInConcurrentView = false;

    this.concurrentViewOffset = options.concurrentViewOffset || 45;

    // is the temporal window open or not
    this.temporalWindowIsActive = false;

    this.useBuildings = false;

    // called after 3d objects have been loaded
    //=============================================================================
    this.initialize = function initialize(){

        this.useBuildings = (this.buildingVersions.length!==0 && this.buildingDates.length!==0);

        this.buildingVersions.forEach((element)=>{
            this.buildingPositions.push(element.position.clone());
        });

        this.enabled = true;

        this.syncBuildingVersionToCurrentDate(true);

        // setup the display
        document.getElementById("timeDateSelector").value = this.currentDate.toISOString().substring(0,10);
        document.getElementById("timeSlider").min = this.minDate.getFullYear();
        document.getElementById("timeSlider").max = this.maxDate.getFullYear();
        document.getElementById("timeSlider").value = this.currentDate.getFullYear();
        document.getElementById("timeSliderMinDate").innerHTML = this.minDate.getFullYear();
        document.getElementById("timeSliderMaxDate").innerHTML = this.maxDate.getFullYear();
    };

    // sync current version to current date
    // this does nothing if the current version is already the right one, unless forceSync is true
    //=============================================================================
    this.syncBuildingVersionToCurrentDate = function syncBuildingVersionToCurrentDate(forceSync){

        if(!this.enabled || !this.useBuildings){
            return;
        }
        if(this.isInConcurrentView){
            this.toggleConcurrentView();
            return;
        }

        // get the version index corresponding to the current date
        this.buildingDates.forEach((element,index)=>{

            if(this.currentDate >= element){
                this.currentVersionIndex = index;
            }
        });

        // if the index is the same as before, exit the function, unless forceSync is true
        if(this.currentVersionIndex === this.lastVersionIndex && !forceSync){
            return;
        }

        // for each version : add it to the scene if the index is the right one, remove it if not
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

        // request a redraw of the scene
        this.view.notifyChange(true);

    };

    // show or hide (toggle) the concurrent view of the temporal versions (all versions on top of each other)
    //=============================================================================
    this.toggleConcurrentView = function toggleConcurrentView(){

        if(!this.enabled || !this.useBuildings){
            return;
        }

        this.isInConcurrentView = !this.isInConcurrentView;

        // remove current version, display all the concurrent versions
        if(this.isInConcurrentView){
            this.view.scene.remove(this.currentVersion);

            this.buildingVersions.forEach((element, index)=>{

                element.position.z += this.concurrentViewOffset * (this.buildingVersions.length-1 - index);
                element.updateMatrixWorld();

                this.view.scene.add(element);

            });
        }
        else{
            //  remove all the concurrent versions, display the current version
            this.buildingVersions.forEach((element, index)=>{

                element.position.copy(this.buildingPositions[index]);

                element.updateMatrixWorld();
            });

            this.syncBuildingVersionToCurrentDate(true);

        }

        // request redraw of the scene
        this.view.notifyChange(true);

    }

    // called when the user input a new date with the date selector
    //=============================================================================
    this.timeSelection = function timeSelection(){
        if(!this.enabled){
            return;
        }

        var date = new Date(document.getElementById("timeDateSelector").value.toString());

        if(!isNaN(date)){
            this.changeDate(date);
        }
    };

    // called when the user input a new date with the time slider
    //=============================================================================
    this.timeSelectionSlider = function timeSelectionSlider() {
        if(!this.enabled){
            return;
        }

        var date = new Date(document.getElementById("timeSlider").value.toString());

        if(!isNaN(date)){
            this.changeDate(date);
        }
    };

    // go to the next key date (next temporal version)
    //=============================================================================
    this.goToNextDate = function goToNextDate(){
        if(!this.enabled || !this.useBuildings){
            return;
        }

        if(this.currentVersionIndex === this.buildingVersions.length -1){
            return;
        }

        this.changeDate(this.buildingDates[this.currentVersionIndex+1]);


    }

    // go to the previous key date (previous temporal version)
    //=============================================================================
    this.goToPreviousDate = function goToPreviousDate(){
        if(!this.enabled || !this.useBuildings){
            return;
        }

        if(this.currentVersionIndex === 0){
            return;
        }

        this.changeDate(this.buildingDates[this.currentVersionIndex-1]);

    }

    // change the current date and sync the temporal version to this new date
    //=============================================================================
    this.changeDate = function changeDate(date){

        document.getElementById("timeSlider").value = date.getFullYear();
        document.getElementById("timeDateSelector").value = date.toISOString().substring(0,10);

        this.currentDate = date;

        this.syncBuildingVersionToCurrentDate(false);
    }

    // hide or show the temporal window
    //=============================================================================
    this.toggleTemporalWindow = function toggleTemporalWindow(){

        document.getElementById('temporalWindow').style.display = this.temporalWindowIsActive ? "none" : "block";
        this.temporalWindowIsActive = this.temporalWindowIsActive ? false : true;
    }

    document.getElementById("timeDateSelector").addEventListener('input', this.timeSelection.bind(this), false);
    document.getElementById("timeSlider").addEventListener('input', this.timeSelectionSlider.bind(this), false);
    document.getElementById("timeConcurrentView").addEventListener('mousedown', this.toggleConcurrentView.bind(this), false);
    document.getElementById("timeNextButton").addEventListener('mousedown', this.goToNextDate.bind(this), false);
    document.getElementById("timePreviousButton").addEventListener('mousedown', this.goToPreviousDate.bind(this), false);
    document.getElementById("temporalTab").addEventListener('mousedown', this.toggleTemporalWindow.bind(this), false);

    // event listener to trigger this.initialize after models are loaded
    window.addEventListener('allModelsLoaded', this.initialize.bind(this), false);

}
