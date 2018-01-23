import 'moment'; // Note that "import * as moment from 'moment';" fails

/**
* Constructor for TemporalController Class
* Handles the GUI part enabling the user to specify the chosen "time" (moment or
* date) of observation for displayal of the (3D) scene.
* Note that it is not the Temporal Controller's responsability to
* alter/modify/update the scene according to the user specify moment (but only
* to trigger the possible hook-ups).
* This controller represents a timestamp with the Moment.js library.
* @param refreshCallback : callback to be called when the time has changed.
* @param options : optional parameters (starting and ending times)
*/

export function TemporalController(refreshCallback, options={}) {

    ///////////// Html elements
    var temporalDiv = document.createElement("div");
    temporalDiv.id = 'temporal';
    document.body.appendChild(temporalDiv);

    document.getElementById("temporal").innerHTML =
    '<div id="temporalWindow">\
       <div id="timeSliderMinDate"></div>\
       <div id="timeSliderMaxDate"></div>\
       <button id="timePreviousButton" type=button>⇦</button>\
       <input  id="timeDateSelector"   type="date">\
       <button id="timeNextButton"     type=button>⇨</button>\
       <input  id="timeSlider"         type="range">\
       <button id="timeOverlayButton"  type=button>Overlay</button>\
       <button id="timeCloseButton">Close</button>\
    </div>';

    ///////////////// Associated stylesheet
    var link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', '/src/Modules/Temporal/Temporal.css');
    document.getElementsByTagName('head')[0].appendChild(link);

    /////// Class attributes

    // Whether the temporal sub window displaying controlling GUI elements
    // is currently displayed or not.
    this.temporalIsActive = options.active || true;

    // The currently selected timestamp
    this.currentTime = options.startTime || new moment();

    // Minimum and maximum times that can be displayed by this occurence
    this.minTime = options.minTime || new moment( "1700-01-01" );
    this.maxTime = options.maxTime || new moment( "2020-01-01" );

    // The timestep used to increment or decrement time with the slide buttons.
    // Note that timeStep is a "duration" as opposed to a timestamp.
    this.timeStep = options.timeStep || new moment.duration(1, 'years');

    // A moment.format() is used to encode the current mode of display of the
    // represented times. For the time being we allow
    //   - "YYYY"    to represent a display of times limited to their years
    //   - "YYYY-MM" to represent a display of times limited to years
    //     followed by the month of the year
    this.timeFormat = options.timeFormat || "YYYY";

    // Whether temporal overlay (all CityObjects displayed independently from
    // their creation/destruction dates) is selected or not
    this.temporalUsesOverlay = false;

    //////////////// Behavior
    // Toggle the overlay displaying option
    this.toggleOverlayButton = function toggleOverlayButton(){
        this.temporalUsesOverlay = !this.temporalUsesOverlay;
    }

    // Call back on new user input with the date selector
    this.timeSelection = function timeSelection(){
        var date = new moment(
               document.getElementById("timeDateSelector").value.toString() );

        if( date.isValid() ){
            this.changeTime(date);
        }
    };

    // Call back on new user input with the time slider
    this.timeSelectionSlider = function timeSelectionSlider() {
        var timeFromSlider = new moment(
                      document.getElementById("timeSlider").value.toString() );

        if( timeFromSlider.isValid() ){
            this.changeTime( timeFromSlider );
        }
    };

    // go to the next key date (next temporal version)
    this.goToNextDate = function goToNextDate(){
       if( this.currentTime >= this.maxTime ){ return; }
       this.changeTime( this.currentTime.add( this.timeStep ) );
    }

    // go to the previous key date (previous temporal version)
    this.goToPreviousDate = function goToPreviousDate(){
       if( this.currentTime <= this.minTime ){ return; }
       this.changeTime( this.currentTime.subtract(this.timeStep) );
    }

    // change the current date and sync the temporal version to this new date
    this.changeTime = function changeTime( time ){
      if( ! time instanceof moment ) {
        throw new Error('Temporal.changeTime requires a moment argument');
      }
      this.currentTime = time;

      document.getElementById("timeSlider").value =
                                                time.format( this.timeFormat );
      document.getElementById("timeDateSelector").value =
                                                time.format( 'YYYY-MM-DD' );

      // Eventually inform who it may concern (e.g. an associated iTowns layer)
      // that the currentTime has changed:
      refreshCallback( this.currentTime.toDate() );
    }

    // Display or hide this window
    this.activateWindow = function activateWindow( active ){
        if (typeof active != 'undefined') {
          this.temporalIsActive = active;
        }
        document.getElementById( 'temporalWindow').style.display =
                                 active ? "block" : "none";
    }

    this.refresh = function refresh( ){
      this.activateWindow( this.temporalIsActive );
      document.getElementById("timeDateSelector").value =
                                   this.currentTime.format( 'YYYY-MM-DD' );
      document.getElementById("timeSlider").min   =
                                       this.minTime.format( this.timeFormat );
      document.getElementById("timeSlider").max   =
                                       this.maxTime.format( this.timeFormat );
      document.getElementById("timeSlider").value =
                                   this.currentTime.format( this.timeFormat );
      document.getElementById("timeSliderMinDate").innerHTML =
                                      this.minTime.format( this.timeFormat );
      document.getElementById("timeSliderMaxDate").innerHTML =
                                      this.maxTime.format( this.timeFormat );
    }

    // Hook up the callbacks
    document.getElementById("timeDateSelector").addEventListener(
                                'input', this.timeSelection.bind(this), false);
    document.getElementById("timeSlider").addEventListener(
                          'input', this.timeSelectionSlider.bind(this), false);
    document.getElementById("timeOverlayButton").addEventListener(
                      'mousedown', this.toggleOverlayButton.bind(this), false);
    document.getElementById("timeNextButton").addEventListener(
                             'mousedown', this.goToNextDate.bind(this), false);
    document.getElementById("timePreviousButton").addEventListener(
                         'mousedown', this.goToPreviousDate.bind(this), false);
    document.getElementById("timeCloseButton").addEventListener(
                   'mousedown', this.activateWindow.bind(this, false ), false);

    ///////////// Initialization
    this.refresh( );
}
