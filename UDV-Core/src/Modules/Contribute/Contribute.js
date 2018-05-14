//to use alpaca and jQuery
//HELP: https://www.sanwebe.com/2016/07/ajax-form-submit-examples-using-jquery

import $ from 'jquery';
import 'alpaca';
import 'bootstrap-datepicker'
import './DocumentPositioner.js';

export function Contribute(view, controls, dataFile, options = {}) {

  var formDiv = document.createElement("div");
  formDiv.id = 'aform';
  document.body.appendChild(formDiv);

//formulaire en dur pour tests:
//  <input type="file" accept="image/*" name="link" id="link" onchange="preview_image(event)"/>\
  document.getElementById("aform").innerHTML =
  '<div id="ContributeWindow">\
  <div id="imageInfo" style="display:none">\
      <table>\
          <tbody><tr>\
              <td class="imagePreview" style="width: 220px" nowrap="nowrap"> </td>\
              <td class="imageProperties" width="100%"> </td> \
          </tr>\
      </tbody></table>\
  </div>\
  <label id="WindowTitle" >Document upload</label>\
  <p></p>\
  <div id="alpacaForm" name = "alpacaForm">\
  </div>\
  <div id = "divButtons">\
  <button id = "showDocTab">Place doc</button>\
  <button id = "submitButton">Submit</button>\
  </div>\
  </div>\
  ';

  var schema = "http://rict.liris.cnrs.fr/schema.json";
     var options = "http://rict.liris.cnrs.fr/options.json";
     $("#alpacaForm").alpaca({
       "schemaSource": schema,
       "optionsSource": options
  });

  var file = document.getElementById('link');
//  file.setAttribute("onchange",function(){preview_image(event);});

/*
  var input = document.createElement("input");
  input.id = "submitButton";
  input.name = "submit";
  input.type="submit";
  input.value ="Submit";
  document.getElementById("alpaca2").appendChild(input);
*/
  var link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('type', 'text/css');
  link.setAttribute('href', '/src/Modules/Contribute/Contribute.css');
  document.getElementsByTagName('head')[0].appendChild(link);

  var meta = document.createElement('meta');
  meta.setAttribute('charset', "UTF-8");
  document.getElementsByTagName('head')[0].appendChild(meta);

  var positioner = new udvcore.DocumentPositioner(view, controls, dataFile, options = {});

  ///////////// Class attributes
  // Whether this window is currently displayed or not.
  this.windowIsActive = options.active || false;

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

  ///////////// Initialization
  this.refresh( );

  function ajaxPostCreateDoc(url, data, callback) {
    var req = new XMLHttpRequest();
    req.open("POST", url);
    console.log(req.responseText);
    req.addEventListener("load", function () {
        if (req.status >= 200 && req.status < 400) {
            callback(req.responseText);
        } else {
            console.error(req.status + " " + req.statusText + " " + url);
        }
    });
    req.addEventListener("error", function () {
        console.error("Network error with url: " + url);
    });
    req.send(data);
  }

//var form = document.getElementById("#alpacaForm");

  //var form = document.querySelector("form");
  document.getElementById('submitButton').addEventListener("mousedown", function(e){
      e.preventDefault();
      //gets form data
//      var data = new FormData(form);
      //var data = new FormData();
      var data = new FormData(document.getElementById("alpaca2"));
      var cam = positioner.getCameraPosition();
      // update data with camera position
      //data.append("positionX", cam.position.x);
      data.append("positionY", cam.position.y);
      //data.append("positionZ", cam.position.z);
      data.append("quaternionX", cam.quaternion.x);
      //data.append("quaternionY", cam.quaternion.y);
      //data.append("quaternionZ", cam.quaternion.z);
      //data.append("quaternionW", cam.quaternion.w);
      // post data and execute script to process data
    // ajaxPostCreateDoc("http://rict.liris.cnrs.fr/py_script.py",data, function() {});
      //ajaxPostCreateDoc("http://rict.liris.cnrs.fr/APIVilo3D/APIExtendedDocument/web/app_dev.php/addDocument", data, function(){});
      ajaxPostCreateDoc("http://rict.liris.cnrs.fr/py_script.py", data, function(){});
      alert("posted");
      //clear all form fields
      $("#alpaca2").get(0).reset();

      //close document positionner
      document.getElementById('docPositionerFull').style.display = "none";
      //close form
      document.getElementById('ContributeWindow').style.display = "none";
    });

}
