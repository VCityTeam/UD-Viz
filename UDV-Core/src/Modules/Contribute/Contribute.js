//to use alpaca and jQuery
//HELP: https://www.sanwebe.com/2016/07/ajax-form-submit-examples-using-jquery

import $ from 'jquery';
import 'alpaca';
import 'bootstrap-datepicker'
import './DocumentPositioner.js';
import '../Documents/DocumentsHandler.js';

export function Contribute(view, controls, storedData, options = {}, mode) {

  //Contribute Mode: start window
  var contriDiv = document.createElement("div");
  contriDiv. id = "startContributeWindow";
  document.body.appendChild(contriDiv);
  document.getElementById("startContributeWindow").innerHTML =
  '<div id = "filtersWindow"></div>\
  <button id = "docInBrowser">Browser</button>\
  <button id = "docInBillboard">Billboards</button>\
  ';

  var schemaFilter = "http://rict.liris.cnrs.fr/schemaFilter.json";
  var optionsFilter = "http://rict.liris.cnrs.fr/optionsFilter.json";
  var schema = "http://rict.liris.cnrs.fr/schemaType.json";
  var optionsCreate = "http://rict.liris.cnrs.fr/optionsCreate.json";
  $('#filtersWindow').alpaca({
    "schemaSource":schema,
    "optionsSource":optionsFilter
  });

  var formDiv = document.createElement("div");
  formDiv.id = 'aform';
  document.body.appendChild(formDiv);

  var link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('type', 'text/css');
  link.setAttribute('href', '/src/Modules/Contribute/Contribute.css');
  document.getElementsByTagName('head')[0].appendChild(link);
//test
  var meta = document.createElement('meta');
  meta.setAttribute('charset', "UTF-8");
  document.getElementsByTagName('head')[0].appendChild(meta);

//  <input type="file" accept="image/*" name="link" id="link" onchange="preview_image(event)"/>\
  //Window CREATE MODE
  document.getElementById("aform").innerHTML =
  '<div id="CreateDocWindow">\
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
  <button id = "closeCreateDoc">Close</button>\
  </div>\
  </div>\
  ';

  $("#alpacaForm").alpaca({
       "schemaSource": schema,
       "optionsSource": optionsCreate
  });

  function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $('#docPositionerFullImg').attr('src', e.target.result);
            }

            reader.readAsDataURL(input.files[0]);
        }
    }

    $(":file").change(function(){
console.log('hello');
        readURL(this);
    });

  var posDiv = document.createElement("div");
  posDiv.id = 'pos';
  document.body.appendChild(posDiv);

  document.getElementById("pos").innerHTML =
  '<div id="docPositionerFull">\
      <img id="docPositionerFullImg"/>\
      <div id="docPositionerFullPanel">\
          <button id="docPositionerClose" type=button>Close</button>\
          <button id="CameraPositionTab" type=button>CameraPosition</button>\
          <label id="docOpaLabel2" for="docOpaSlider2">Opacity</label>\
          <input id="docOpaSlider2" type="range" min="0" max="100" value="75"\
          step="1" oninput="docPositionerOpaUpdate(value)">\
          <output for="docPositionerOpaSlider" id="docPositionedOpacity">50</output><br>\
          <input id = "posX"><br>\
          <input id = "posY"><br>\
          <input id = "posZ"><br>\
          <input id = "quatX"><br>\
          <input id = "quatY"><br>\
          <input id = "quatZ"><br>\
          <input id = "quatW"><br>\
      </div>\
  </div>\
  ';

  ///////////// Class attributes
  // Whether this window is currently displayed or not.
  this.windowIsActive = options.active || false;
  this.filtered_data = storedData;
  this.current;
  //var positioner = new udvcore.DocumentPositioner(view, controls, storedData, options = {});

//var mydocuments = new udvcore.DocumentsHandlerBIS(view, controls, storedData, {temporal: temporal} );

  // Display or hide this window
  this.activateWindow = function activateWindow( active ){
    if (typeof active != 'undefined') {
      this.windowIsActive = active;
    }
    document.getElementById('startContributeWindow').style.display = active ? "block" : "none" ;
  }

  this.refresh = function refresh( ){
    this.activateWindow( this.windowIsActive );
  }

  this.initialize = function initialize(){

  }

  ///////////// Initialization
  this.refresh( );
  this.initialize();
  this.getCameraPosition = function getCameraPosition(){
  //    console.log(view.camera.camera3D.position );
      var cam = view.camera.camera3D;
      var position = cam.position;
      var quaternion = cam.quaternion;
      document.getElementById("posX").value = position.x;
      document.getElementById("posY").value = position.y;
      document.getElementById("posZ").value = position.z;
      document.getElementById("quatX").value = quaternion.x;
      document.getElementById("quatY").value = quaternion.y;
      document.getElementById("quatZ").value = quaternion.z;
      document.getElementById("quatW").value = quaternion.w;
      return view.camera.camera3D;
    }

    this.showDocPositioner = function showDocPositioner() {

      console.log("displaying document in the center");
      document.getElementById('docPositionerFull').style.display = "block";
      document.getElementById('docPositionerFullImg').src =
      //controls.goToTopView();
      document.getElementById('docPositionerClose').addEventListener('mousedown', this.getCameraPosition.bind(this), false);
    }

      // close the center window (oriented view / doc focus)
      //=========================================================================
      this.closeDocPositioner = function closeDocPositioner(){
          document.getElementById('docPositionerFull').style.display = "none";
          //document.getElementById('docFullImg').src = null;
      }

    // Close the window...when close button is hit
    document.getElementById("showDocTab").addEventListener('mousedown', this.showDocPositioner.bind(this),false);
    document.getElementById("docPositionerClose").addEventListener('mousedown', this.closeDocPositioner.bind(this),false);
    document.getElementById("CameraPositionTab").addEventListener('mousedown', this.getCameraPosition.bind(this),false);


  this.handleDocCreation = function handleDocCreation(){
    this.contributeMode = "create";
    document.getElementById('startContributeWindow').style.display = "none";
    document.getElementById('CreateDocWindow').style.display ="block";
  }

  this.closeDocCreation = function closeDocCreation(){
    document.getElementById('CreateDocWindow').style.display ="none";
  }

  this.displayDocs = function displayDocs(){
    //check which filters are activated
    var form_data = new FormData(document.getElementById('filterForm'));
    var entries = form_data.entries();

    for (var pair of form_data.entries()){
      console.log(pair[0]+ ', ' + pair[1]);
    }
    var chain = "http://rict.liris.cnrs.fr/APIVilo3D/APIExtendedDocument/web/app_dev.php/getDocuments?";

    for(var pair of entries ){
      if(pair[1]!=""){
      chain+= pair[0] + "=" + pair[1];
      chain+="&";
    }
  }
  var chain = chain.slice('&',-1);
  console.log(chain);
  //get documents with or without filters
  var req = new XMLHttpRequest();
    req.open("GET", chain,false);
    req.send();
    console.log(req.statusText);
    this.filtered_data = JSON.parse(req.responseText);
    //console.log(this.filtered_data);
    //display doc in browser
    if(this.filtered_data.length==0){
      alert('No document found');
    }
    else{
      //add options billboard / browser in documentsHandler parameters
      var documents = new udvcore.DocumentsHandler(view, controls, this.filtered_data, {temporal: temporal} );
      document.getElementById('docBrowserWindow').style.display = "block";
      document.getElementById('docCreate').addEventListener("mousedown", this.handleDocCreation.bind(this),false);
  }
}

  // event listeners for buttons
  document.getElementById("docInBrowser").addEventListener('mousedown', this.displayDocs.bind(this),false);
  document.getElementById("closeCreateDoc").addEventListener('mousedown', this.closeDocCreation.bind(this),false);

  function PostCreateDoc(url, data, callback) {
    console.log(data);
    var stat = 0; //1 of OK 0 if not ok
    var req = new XMLHttpRequest();
    req.open("POST", url);
    req.addEventListener("load", function () {
        if (req.status >= 200 && req.status < 400) {
            stat = 1;
            callback(req.responseText);
            alert('Posted');

        } else {
            console.error(req.status + " " + req.statusText + " " + url);
            console.log("problem");
            stat = 0;
        }
    });
    req.addEventListener("error", function () {
        console.error("Network error with url: " + url);
        stat = false;
    });
    req.send(data);
    return stat;
  }


  document.getElementById('submitButton').addEventListener("mousedown", function(e){
        //gets form data
        var form_data = new FormData(document.getElementById('myCreationForm'));
        var cam = positioner.getCameraPosition();
        // update data with camera position
        //data.append("positionX", cam.position.x);
        form_data.append("positionY", cam.position.y);
        //data.append("positionZ", cam.position.z);
        form_data.append("quaternionX",cam.quaternion.y);
        //data.append("quaternionY", cam.quaternion.y);
        //data.append("quaternionZ", cam.quaternion.z);
        //data.append("quaternionW", cam.quaternion.w);

        //add data verification

        //post data and execute script to process data
        var creationStatus = PostCreateDoc("http://rict.liris.cnrs.fr/APIVilo3D/APIExtendedDocument/web/app_dev.php/addDocument",form_data, function(){});
        console.log(creationStatus);
        if (creationStatus==1){
          //clear all form fields
          $("#myCreationForm").get(0).reset();
          //close document positionner
          document.getElementById('docPositionerFull').style.display = "none";
          //close form
          document.getElementById('CreateDocWindow').style.display = "none";
        }
        else{
                    alert('Document could not be created, check information');
        }
//debug

  for (var pair of form_data.entries()) {
      console.log(pair[0]+ ', ' + pair[1]);
  }
});
}
