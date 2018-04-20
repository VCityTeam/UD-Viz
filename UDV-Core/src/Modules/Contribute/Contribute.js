//to use alpaca and jQuery
import $ from 'jquery';
import 'alpaca';
import 'bootstrap-timepicker';

export function Contribute() {

  var formDiv = document.createElement("div");
  formDiv.id = 'aform';
  document.body.appendChild(formDiv);

  document.getElementById("aform").innerHTML =
  '<button id=ContributeTab>CONTRIBUTE</button>\
  <div id="ContributeWindow">\
  <div id="alpacaForm" name="alpacaForm"></div>\
  <iframe name = "hiddenFrame" class="hide></iframe>\
  </div>\
  ';


   var schema = "http://rict.liris.cnrs.fr/schema.json";
   var options = "http://rict.liris.cnrs.fr/options.json";
   $("#alpacaForm").alpaca({
     "schemaSource": schema,
     "optionsSource": {
  "form": {
    "attributes":{
      "action": "http://rict.liris.cnrs.fr/py_script.py",
      "method": "post",
      "enctype": "multipart/form-data",
      "target" : "blank"
    },
    "buttons": {
      "submit": {
     }
  }
},
"fields":{
  "docUpload":{
    "type":"file",
    "styled":true
  },
  "refDate":{
  },
}
},
"view":{
  "parent":'bootstrap-edit',
  "bindings":{

  }
}
   });


  var link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('type', 'text/css');
  link.setAttribute('href', '/src/Modules/Contribute/Contribute.css');
  document.getElementsByTagName('head')[0].appendChild(link);

  var meta = document.createElement('meta');
  meta.setAttribute('charset', "UTF-8");
  document.getElementsByTagName('head')[0].appendChild(meta);

  ///////////// Class attributes
  // Whether this window is currently displayed or not.
  this.windowIsActive = options.active || false;

  //////////// Behavior

  // Display or hide this window
  this.activateWindow = function activateWindow( active ){
    if (typeof active != 'undefined') {
      this.windowIsActive = active;
    }
    document.getElementById('ContributeWindow').style.display =
                            active ? "block" : "none" ;
  }

  this.refresh = function refresh( ){
    this.activateWindow( this.windowIsActive );
  }

  // Close the window...when close button is hit
  document.getElementById("aboutCloseButton").addEventListener(
       'mousedown', this.activateWindow.bind(this, false ), false);

  ///////////// Initialization
  this.refresh( );


}
