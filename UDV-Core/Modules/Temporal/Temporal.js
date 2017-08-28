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

function TemporalController(view, controls, startDate) {

  _this4 = this;

  _this4.view = view;

  _this4.controls = controls;

  _this4.currentDate = new Date(startDate);

  _this4.minDate = new Date( "1500-01-01" );
  _this4.maxDate = new Date( "2050-01-01" );
  _this4.startDate = new Date( "2017-08-20" );

  document.getElementById("timeDateSelector").value = _this4.currentDate.toISOString().substring(0,10);

  document.getElementById("timeSlider").min = _this4.minDate.getFullYear();
  document.getElementById("timeSlider").max = _this4.maxDate.getFullYear();
  document.getElementById("timeSlider").value = _this4.startDate.getFullYear();

  document.getElementById("timeDateSelector").addEventListener('input', _this4.timeSelection, false);
  document.getElementById("timeSlider").addEventListener('input', _this4.timeSelectionSlider, false);

  document.getElementById("timeSliderMinDate").innerHTML = _this4.minDate.getFullYear();
  document.getElementById("timeSliderMaxDate").innerHTML = _this4.maxDate.getFullYear();



}

TemporalController.prototype.timeSelection = function timeSelection(){


  var d = new Date(this.value.toString());

  if(!isNaN(d)){

      document.getElementById("timeSlider").value = d.getFullYear();

      _this4.currentDate = d;

      console.log(_this4.currentDate);
  }

}

TemporalController.prototype.timeSelectionSlider = function timeSelectionSlider() {

  var d = new Date(this.value.toString());

  if(!isNaN(d)){

      document.getElementById("timeDateSelector").value = d.toISOString().substring(0,10);

      _this4.currentDate = d;

        console.log(_this4.currentDate);
  }

}

document.getElementById("temporalTab").onclick = function () {
    document.getElementById('temporalWindow').style.display = temporalWindowIsActive ? "none" : "block";
    temporalWindowIsActive = temporalWindowIsActive ? false : true;


};
