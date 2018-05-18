//to use alpaca and jQuery
//HELP: https://www.sanwebe.com/2016/07/ajax-form-submit-examples-using-jquery

import $ from 'jquery';
import 'alpaca';
import 'bootstrap-datepicker'
import './DocumentPositioner.js';
import '../Documents/DocumentsHandlerBIS.js';

export function Contribute(view, controls, storedData, options = {}) {

  //Contribute Mode: start window
  var contriDiv = document.createElement("div");
  contriDiv. id = "startContributeWindow";
  document.body.appendChild(contriDiv);
  document.getElementById("startContributeWindow").innerHTML =
  '<div id = "filtersWindow"></div>\
  <button id = "docInBrowser">Browser</button>\
  <button id = "docInBillboard">Billboards</button>\
  ';

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

  var schema = "http://rict.liris.cnrs.fr/schema.json.save";
     var options = "http://rict.liris.cnrs.fr/options.json";
     $("#alpacaForm").alpaca({
       "schemaSource": schema,
       "optionsSource": options
  });


  //Window UPDATE MODE
  var updateModeWindow = document.createElement("div");
  updateModeWindow.id = 'updateModeWindow';
  document.body.appendChild(updateModeWindow);

  document.getElementById("updateModeWindow").innerHTML = '<SELECT id ="listOfDocuments">\
  </SELECT>\
  <div id="newAlpacaForm" name = "newAlpacaForm">\
  </div>\
  <div id = "updateFormButtons">\
    <button id = "saveUpdateButton">Save modifications</button>\
    <button id = "closeUpdateForm">Cancel modifications</button>\
  </div>\
  ';

  $('#newAlpacaForm').alpaca({
    "schemaSource":schema
  });


  var schemaFilter = "http://rict.liris.cnrs.fr/schemaFilter.json";
  var optionsFilter = "http://rict.liris.cnrs.fr/optionsFilter.json";
  $('#filtersWindow').alpaca({
    "schemaSource":schemaFilter,
    "optionsSource":optionsFilter
  });

  ///////////// Class attributes
  // Whether this window is currently displayed or not.
  this.windowIsActive = options.active || false;
  //this.storeddata;
  this.documents = new udvcore.DocumentsHandlerBIS(view, controls, storedData, {temporal: temporal} );

  var confirmDeleteButton = document.createElement("button");
  confirmDeleteButton.id = "confirmDelete";
  var text = document.createTextNode("Delete selected doc");
  confirmDeleteButton.appendChild(text);
  document.getElementById('docBrowserWindow').appendChild(confirmDeleteButton);

  this.contributeMode = "default";
  //this.storedData = new Object();

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

  //var documents = new udvcore.DocumentsHandlerBIS(this.view, this.controls, this.storedData, {temporal: temporal} );

  this.initialize = function initialize(){

    var req = new XMLHttpRequest();
    var url = "http://rict.liris.cnrs.fr/APIVilo3D/APIExtendedDocument/web/app_dev.php/getDocuments";
    req.open("GET", url);
    req.send();
    alert(req.statusText);
    this.storedData = JSON.parse(req.responseText);
    for(var i= 0; i < storedData.length; i++)
    {
      var x = document.getElementById("listOfDocuments");
      var newEntree = document.createElement("option");
      newEntree.text = storedData[i].metadata.id;
      x.add(newEntree);
    }
}

  ///////////// Initialization
  this.refresh( );
  this.initialize();

  //
  this.handleDocCreation = function handleDocCreation(){
    this.contributeMode = "create";
    document.getElementById('startContributeWindow').style.display = "none";
    document.getElementById('CreateDocWindow').style.display ="block";
  }

  this.handleDocUpdate = function handleDocUpdate(){
    this.contributeMode = "update";
    DisplayDocumentsInUpdateForm(this.storedData, this.contributeMode);
    //GetAllDocuments(this.contributeMode);
  }

  this.handleDocDeletion = function handleDocDeletion(){
    this.contributeMode = "delete";
    DisplayDocumentsInBrowser(this.storedData, this.contributeMode)
  }

  this.closeDocCreation = function closeDocCreation(){
    document.getElementById('CreateDocWindow').style.display ="none";
  }
  this.closeUpdateWindow = function closeUpdateWindow(){
    document.getElementById('updateModeWindow').style.display = "none";
  }

//  function GetAllDocuments() =

  this.displayDocInBrowser = function displayDocInBrowser(){
  //check what filters are activated
  //  var data = $("#filterForm").alpaca('Fields').getValue();
  var form_data = new FormData(document.getElementById('filterForm'));

  //get documents with or without filters.
  var req = new XMLHttpRequest();
  var url = "http://rict.liris.cnrs.fr/APIVilo3D/APIExtendedDocument/web/app_dev.php/getDocuments";
  req.open("GET", url);
  req.send();
  alert(req.statusText);
//  console.log(req.responseText);
  var filtered_data = JSON.parse(req.responseText);
  //console.log(testData[0]);
  //display doc in browser
  var documents = new udvcore.DocumentsHandlerBIS(view, controls, filtered_data, {temporal: temporal} );
  document.getElementById('docBrowserWindow').style.display = "block";
//testing get doc with filter
  }

  // event listeners for buttons
  document.getElementById("docInBrowser").addEventListener('mousedown', this.displayDocInBrowser.bind(this),false);
  //document.getElementById("updateButton").addEventListener('mousedown', this.handleDocUpdate.bind(this),false);
  //document.getElementById("deleteButton").addEventListener('mousedown', this.handleDocDeletion.bind(this),false);
  document.getElementById("closeCreateDoc").addEventListener('mousedown', this.closeDocCreation.bind(this),false);
  document.getElementById('closeUpdateForm').addEventListener("mousedown",this.closeUpdateWindow.bind(this),false);


//  var positioner = new udvcore.DocumentPositioner(view, controls, storedData, options = {});

  function PostCreateDoc(url, data, callback) {
    var stat = false; //1 of OK 0 if not ok
    var req = new XMLHttpRequest();
    req.open("POST", url);
    req.addEventListener("load", function () {
        if (req.status >= 200 && req.status < 400) {
            stat = true;
            callback(req.responseText);
            alert('Posted');

        } else {
            console.error(req.status + " " + req.statusText + " " + url);
            console.log("problem");
            stat = false;
        }
    });
    req.addEventListener("error", function () {
        console.error("Network error with url: " + url);
        stat = false;
    });
    req.send(data);
    return stat;
  }

  function PostUpdateDoc(url,data, callback){
    var req = new XMLHttpRequest();
    req.open('POST',url);
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

this.ConfirmDeleteOneDocument = function ConfirmDeleteOneDocument(){
  if(confirm('Delete this document permanently?')){
var myid =   this.documents.currentDoc.doc_ID
  var url = "http://rict.liris.cnrs.fr/APIVilo3D/APIExtendedDocument/web/app_dev.php/deleteDocument/" + myid;
  var req = new XMLHttpRequest();
  req.open("POST", url);
  req.send();
  alert("The document has been deleted successfully");
  document.getElementById('docBrowserWindow').style.display = "none";
}
else{
  alert('you changed your mind');
}

}

function DisplayDocumentsInUpdateForm(json_of_json, contributeMode){
  var id;
  $('#listOfDocuments').on('change', function() {
    id = parseInt(this.value);
    for (var i = 0; i < json_of_json.length; i++) {
      if (json_of_json[i]['idDocument'] === id) {
        var  data = json_of_json[i].metadata;
        console.log(data);
        break;
      }
    }
    //dynamicaly update form data
    $("#newAlpacaForm").alpaca('get').setValue(data);
  })
  //display update form
  document.getElementById('updateModeWindow').style.display = "block";
  }

  function DisplayDocumentsInBrowser(existingData, contributeMode){

  //  document.getElementById('docBrowserWindow').style.display = "block";

  }

  document.getElementById('confirmDelete').addEventListener("mousedown", this.ConfirmDeleteOneDocument.bind(this),false);

  document.getElementById('submitButton').addEventListener("mousedown", function(e){
        //gets form data
        var form_data = new FormData(document.getElementById('myAlpacaForm'));
        var cam = positioner.getCameraPosition();
        // update data with camera position
        //data.append("positionX", cam.position.x);
        form_data.append("positionY", cam.position.y);
        //data.append("positionZ", cam.position.z);
        form_data.append("quaternionX",cam.quaternion.y);
        //data.append("quaternionY", cam.quaternion.y);
        //data.append("quaternionZ", cam.quaternion.z);
        //data.append("quaternionW", cam.quaternion.w);
        //post data and execute script to process data
        var creationStatus = PostCreateDoc("http://rict.liris.cnrs.fr/APIVilo3D/APIExtendedDocument/web/app_dev.php/addDocument",form_data, function(){});
        console.log(creationStatus);
        if (creationStatus==true){
          //clear all form fields
          $("#myAlpacaForm").get(0).reset();
          //close document positionner
          document.getElementById('docPositionerFull').style.display = "none";
          //close form
          document.getElementById('CreateDocWindow').style.display = "none";
        }
        else{
                    alert('Document could not be created');
        }
//debug
/*
  for (var pair of form_data.entries()) {
      console.log(pair[0]+ ', ' + pair[1]);
  }*/
      });

      document.getElementById('saveUpdateButton').addEventListener("mousedown", function(e){
          e.preventDefault();
          //gets form data
      //    var data = $("#newAlpacaForm").alpaca('Fields').getValue();
        //  var form_data = new FormData();
          var form_data = new FormData(document.getElementById('newAlpacaForm'));
          /*for ( var key in data ) {
            form_data.append(key, data[key]);
          }*/
          var id = document.getElementById('listOfDocuments').value;          //console.log(form_data);

          var cam = positioner.getCameraPosition();
          form_data.append("positionY", cam.position.y);
          form_data.append("quaternionX", cam.quaternion.x);
    //      PostUpdateDoc("http://rict.liris.cnrs.fr/APIVilo3D/APIExtendedDocument/web/app_dev.php/editDocument/" + id,form_data, function() {});
          alert("posted. Please reload webbrowser to see changes");
//          closeUpdateWindow();

        });
}
