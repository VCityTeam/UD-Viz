//to use alpaca and jQuery
//HELP: https://www.sanwebe.com/2016/07/ajax-form-submit-examples-using-jquery

import $ from 'jquery';
import 'alpaca';
import 'bootstrap-datepicker'
import './DocumentPositioner.js';

export function Contribute(view, controls, dataFile, options = {}) {

  var contriDiv = document.createElement("div");
  contriDiv. id = "contributeModeWindow";
  document.body.appendChild(contriDiv);
  document.getElementById("contributeModeWindow").innerHTML =
  '<button id = "createButton">Create new doc</button>\
  <button id = "updateButton">Update my docs</button>\
  <button id = "deleteButton">Delete one of my docs</button>\
  ';

  var formDiv = document.createElement("div");
  formDiv.id = 'aform';
  document.body.appendChild(formDiv);


//  <input type="file" accept="image/*" name="link" id="link" onchange="preview_image(event)"/>\
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
  </div>\
  </div>\
  ';

  var divList = document.createElement("div");
  divList.id = 'divList';
  document.body.appendChild(divList);

  document.getElementById("divList").innerHTML = '<SELECT id ="listOfDocuments">\
  </SELECT>\
  <div id="newAlpacaForm" name = "newAlpacaForm">\
  </div>\
  <div id = "updateFormButtons">\
  </div>\
  ';

  var schema = "http://rict.liris.cnrs.fr/schema.json";
     var options = "http://rict.liris.cnrs.fr/options.json";
     $("#alpacaForm").alpaca({
       "schemaSource": schema,
       "optionsSource": options
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
  this.storeddata;

  var confirmDeleteButton = document.createElement("button");
  confirmDeleteButton.id = "confirmDelete";
  var text = document.createTextNode("Delete selected doc");
  confirmDeleteButton.appendChild(text);

  var cancelUpdateButton = document.createElement("button");
  cancelUpdateButton.id = "closeUpdateForm";
  var text = document.createTextNode("Cancel modifications");
  cancelUpdateButton.appendChild(text);

  var saveUpdateButton = document.createElement("button");
  saveUpdateButton.id = "saveTab";
  var text = document.createTextNode('Save modifications');
  saveUpdateButton.appendChild(text);

  this.contributeMode = "default";
  this.storedData = new Object();

  // Display or hide this window
  this.activateWindow = function activateWindow( active ){
    if (typeof active != 'undefined') {
      this.windowIsActive = active;
    }
    document.getElementById('contributeModeWindow').style.display = active ? "block" : "none" ;
  }

  this.refresh = function refresh( ){
    this.activateWindow( this.windowIsActive );
  }
  this.initialize = function initialize(){
    var req = new XMLHttpRequest();
    var url = "http://rict.liris.cnrs.fr/APIVilo3D/APIExtendedDocument/web/app_dev.php/getDocuments";
    req.open("GET", url);
    req.send();
    alert(req.statusText);
    this.storedData = JSON.parse(req.responseText);
    for(var i= 0; i < this.storedData.length; i++)
    {
      var x = document.getElementById("listOfDocuments");
      var newEntree = document.createElement("option");
      newEntree.text = this.storedData[i].metadata.id;
      x.add(newEntree);
    }
  }

  ///////////// Initialization
  this.refresh( );
  this.initialize();
  //
  this.handleDocCreation = function handleDocCreation(){
    this.contributeMode = "create";
    document.getElementById('contributeModeWindow').style.display = "none";
    document.getElementById('CreateDocWindow').style.display ="block";
  }

  this.handleDocUpdate = function handleDocUpdate(){
    this.contributeMode = "update";
    document.getElementById("updateFormButtons").appendChild(cancelUpdateButton);
    document.getElementById("updateFormButtons").appendChild(saveUpdateButton);
    DisplayDocumentsInList(this.storedData, this.contributeMode);
    //GetAllDocuments(this.contributeMode);
  }

  this.handleDocDeletion = function handleDocDeletion(){
    this.contributeMode = "delete";
    //DisplayDocumentsInList(this.storedData, this.contributeMode)
  }

  // event listeners for buttons
  document.getElementById("createButton").addEventListener('mousedown', this.handleDocCreation.bind(this),false);
  document.getElementById("updateButton").addEventListener('mousedown', this.handleDocUpdate.bind(this),false);
  document.getElementById("deleteButton").addEventListener('mousedown', this.handleDocDeletion.bind(this),false);


  var positioner = new udvcore.DocumentPositioner(view, controls, dataFile, options = {});

  function PostCreateDoc(url, data, callback) {
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

  function DeleteDoc(url, callback){
    var req = new XMLHttpRequest();
    req.open("POST", url);
    req.send();
  }

  this.GetAllStoredDocs = function GetAllStoredDocs(){
    //console.log(contributeMode);
    var req = new XMLHttpRequest();
    var url = "http://rict.liris.cnrs.fr/APIVilo3D/APIExtendedDocument/web/app_dev.php/getDocuments";
    req.open("GET", url);
    req.send();
    alert(req.statusText);
    var stored_data = JSON.parse(req.responseText);
    for(var i= 0; i < stored_data.length; i++)
    {
      var x = document.getElementById("listOfDocuments");
      var newEntree = document.createElement("option");
      newEntree.text = stored_data[i].metadata.id;
      x.add(newEntree);
    }
    return stored_data;
  }

/*

  function GetAllDocuments(contributeMode){
    //var myArr= GetAllStoredDocs();
    DisplayDocumentsInList(myArr, contributeMode);

    for(var i= 0; i < myArr.length; i++)
    {
      var x = document.getElementById("listOfDocuments");
      var newEntree = document.createElement("option");
      newEntree.text = myArr[i].metadata.id;
      x.add(newEntree);
    }
  }*/

function ConfirmDeleteOneDocument(myid){
  var url = "http://rict.liris.cnrs.fr/APIVilo3D/APIExtendedDocument/web/app_dev.php/deleteDocument/" + myid;
  DeleteDoc(url, function(){});
}

function DisplayDocumentsInList(json_of_json, contributeMode){
  if(contributeMode == "delete"){
    document.getElementById("updateFormButtons").appendChild(confirmDeleteButton);
    document.getElementById("updateFormButtons").appendChild(cancelUpdateButton);
    document.getElementById('confirmDelete').addEventListener("mousedown", function(e){
      var x=$("#listOfDocuments").val();
      ConfirmDeleteOneDocument(x);
      alert('The document was successfully deleted');
      var y = document.getElementById("listOfDocuments");
      y.remove(x);
      alert('The document was successfully deleted');
      document.getElementById('divList').style.display = "none";
      contributeMode="default";
    });
  }

  else{
    if(contributeMode == "update"){
      console.log("entering update mode");

    }
  }
  $("#newAlpacaForm").alpaca({
    "schemaSource": {
      "title": "Updating selecting file...",
      "type": "object",
      "properties": {
          "description": {
              "type": "string",
              "title": "Description of the file"
          },
          "idDocument": {
              "type": "string",
              "title": "ID of the document"
          },
          "publicationDate":{
            "title":"Publication date",
            "type":"string"
          },
          "refDate":{
            "title":"Referring date",
            "type":"string"
          },
          "subject":{
            "title":"Subject",
            "type":"string"
          },
          "title":{
            "title":"Title of the doc",
            "type":"string"
          },
          "type":{
            "title":"Type of the doc",
            "type":"string"
          }
      }
    }
  });
    var id;
    $('#listOfDocuments').on('change', function() {
      id = parseInt(this.value);
      console.log(id);
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

    document.getElementById('divList').style.display = "block";
    document.getElementById('closeUpdateForm').addEventListener("mousedown",this.closeUpdateWindow.bind(this),false);
    //jquery => update browser with current doc (doc selected in the list)
  } //end of function DisplayDocumentsInList


  document.getElementById('submitButton').addEventListener("mousedown", function(e){
        e.preventDefault();
        //gets form data
        var data = new FormData(document.getElementById("alpaca2"));
        console.log(data);
        var cam = positioner.getCameraPosition();
        // update data with camera position
        //data.append("positionX", cam.position.x);
        data.append("positionY", cam.position.y);
        //data.append("type", document.getElementById("type").value);
        //data.append("positionZ", cam.position.z);
        data.append("quaternionX", cam.quaternion.x);
        //data.append("quaternionY", cam.quaternion.y);
        //data.append("quaternionZ", cam.quaternion.z);
        //data.append("quaternionW", cam.quaternion.w);
        // post data and execute script to process data
        PostCreateDoc("http://rict.liris.cnrs.fr/APIVilo3D/APIExtendedDocument/web/app_dev.php/addDocument", data, function(){});
        alert("posted");
        //clear all form fields
        $("#alpaca2").get(0).reset();
        //close document positionner
        document.getElementById('docPositionerFull').style.display = "none";
        //close form
        document.getElementById('CreateDocWindow').style.display = "none";
      });

/*

      document.getElementById('saveTab').addEventListener("mousedown", function(e){
          e.preventDefault();
          //gets form data
          var data = $("#newAlpacaForm").alpaca('Fields').getValue();
          var form_data = new FormData();
          for ( var key in data ) {
            form_data.append(key, data[key]);
          }

          var id = document.getElementById('listOfDocuments').value;          //console.log(form_data);

          var cam = positioner.getCameraPosition();
          form_data.append("positionY", cam.position.y);
          form_data.append("quaternionX", cam.quaternion.x);
          PostUpdateDoc("http://rict.liris.cnrs.fr/APIVilo3D/APIExtendedDocument/web/app_dev.php/editDocument/",form_data, function() {});
          alert("posted");
        });
*/
}
