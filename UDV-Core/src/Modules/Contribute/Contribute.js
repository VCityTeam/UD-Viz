//to use alpaca and jQuery
//HELP: https://www.sanwebe.com/2016/07/ajax-form-submit-examples-using-jquery

import $ from 'jquery';
import 'alpaca';
import 'bootstrap-datepicker'
import './DocumentPositioner.js';

export function Contribute(view, controls, dataFile, options = {}) {

  var positioner = new udvcore.DocumentPositioner(view, controls, dataFile, options = {});
  var formDiv = document.createElement("div");
  formDiv.id = 'aform';
  document.body.appendChild(formDiv);
/*
  document.getElementById("aform").innerHTML =
  '<div id="ContributeWindow">\
  <div id="alpacaForm" name="alpacaForm"></div>\
  <div id="server-results"><!-- For server results --></div>\
  </div>\
  ;'
*/

document.getElementById("aform").innerHTML =
'<div id="ContributeWindow">\
<label id="WindowTitle" >Document upload</label>\
<p></p>\
<div id="myFormDiv">\
<p></p>\
<label>Title</label>\
<input type="text" name="docTitle" id="docTitle" />\
<label>Subject</label>\
<input type="text" name="docSubject" id="docSubject" />\
<label>Referring date</label>\
<input type="text" name="refDate" id="refDate"/>\
<label>Publication date</label>\
<input type="date" name="publicationDate" id="publicationDate"/>\
<label>Description</label><p></p>\
<p></p>\
<textarea name = "docDescription" id="docDescription"   rows="7" cols="30"></textarea>\
<p></p>\
<input type="file" name="docUpload" id="docUpload"/>\
<button id = "VisuDoc">Place doc</button>\
<div id="server-results"><!-- For server results --></div>\
</div>\
</div>\
';


/*

  document.getElementById("aform").innerHTML =
  '<div id="ContributeWindow">\
  <label id="WindowTitle" >Document upload</label>\
  <p></p>\
  <div id="myFormDiv">\
  <form method="post" id="alpaca3">\
  <p></p>\
  <label>Title</label>\
  <input type="text" name="docTitle" id="docTitle" />\
  <label>Subject</label>\
  <input type="text" name="docSubject" id="docSubject" />\
  <label>Referring date</label>\
  <input type="text" name="refDate" id="refDate"/>\
  <label>Publication date</label>\
  <input type="date" name="publicationDate" id="publicationDate"/>\
  <label>Description</label><p></p>\
  <p></p>\
  <textarea name = "docDescription" id="docDescription"   rows="7" cols="30"></textarea>\
  <p></p>\
  <input type="file" name="docUpload" id="docUpload"/>\
  <input type="submit" name="submit" value="Submit" id="submitButton"/>\
  <div id="server-results"><!-- For server results --></div>\
  </div>\
  </div>\
  ';

   var schema = "http://rict.liris.cnrs.fr/schema.json";
   var options = "http://rict.liris.cnrs.fr/options.json";
   $("#alpacaForm").alpaca({
     "schemaSource": schema,
     "optionsSource": options
});

   $("#alpaca3").submit(function(event){
       event.preventDefault(); //prevent default action
       var post_url = "http://rict.liris.cnrs.fr/py_script.py";
       //var post_url = $(this).attr("action"); //get form action url
       var form_data = $(this).serialize(); //Encode form elements for submission

       $.post( post_url, form_data, function( response ) {
         //$("#server-results").html( response );
         alert('sent');
         $("#alpaca3").get(0).reset() //clear fields
       });
   });
*/
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
    document.getElementById('ContributeWindow').style.display = active ? "block" : "none" ;
  }

  this.refresh = function refresh( ){
    this.activateWindow( this.windowIsActive );
  }

  // Close the window...when close button is hit
  document.getElementById("aboutCloseButton").addEventListener(
       'mousedown', this.activateWindow.bind(this, false ), false);

  document.getElementById("VisuDoc").addEventListener('mousedown', positioner.showMyDoc.bind(this),false);


  ///////////// Initialization
  this.refresh( );


}
