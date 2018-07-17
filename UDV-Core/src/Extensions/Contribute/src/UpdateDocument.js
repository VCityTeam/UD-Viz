export function UpdateDocument(updateContainer, contributeController){

  this.contributeController = contributeController;
  this.updateContainer = updateContainer;
  this.browser = this.contributeController.documentController.documentBrowser;
  this.data;

  this.schemaType = { //schema defining the update form, using Alpaca
    "type": "object",
    "properties": {
      //will be set by calling docModelToSchema
    }
  };

  this.optionsUpdate = { //options to render the update form
    "form": {
      "attributes":{
        "id":"updateForm"
      }
    },
    "fields":{
      //will be set by calling docModelToSchema
    }
  };




  this.initialize = function initialize()
  {
    var docUpdateButton = document.createElement('button');
    docUpdateButton.id = "docUpdateButton";
    var text = document.createTextNode("Update");
    docUpdateButton.appendChild(text);
    document.getElementById("browserWindowTabs").appendChild(docUpdateButton);

    var docDeleteButton = document.createElement('button');
    docDeleteButton.id = "docDeleteButton";
    var text = document.createTextNode("Delete");
    docDeleteButton.appendChild(text);
    document.getElementById("browserWindowTabs").appendChild(docDeleteButton);

    this.updateContainer.innerHTML =
    '<br/><div id = "updateTitle"Update document metadata</div><br/>\
    <br/>\
    <button id = "closeUpdate">Close</button>\
    <div class="update">\
    <div id = "updateWindow" ></div></div>\
    <div id ="updateTabs">\
    <button id = "docUpdate">Validate</button>\
    <button id = "updateCancel">Cancel</button>\
    </div>\
    ';

    this.docModelToSchema();
  }

  this.activateWindow = function activateWindow(active){
    if (typeof active != 'undefined')
    {
      this.windowIsActive = active;
    }
    document.getElementById(this.contributeController.updateContainerId).style.display = active  ? "block" : "none ";

  }

  this.docModelToSchema = function docModelToSchema(){

    var metadata = this.contributeController.documentController.documentModel.metadata;

    var view = { //so that the attribute that can not be modified are also displayed
      "displayReadonly": true
    };

    for (var key in metadata) {
      var attribute = metadata[key]; //holds all metadata relative information
      this.schemaType.properties[attribute['name']]={};
      this.optionsUpdate.fields[attribute['name']] = {};
      this.optionsUpdate.fields[attribute['name']]['id'] = attribute['updateID'];
      this.optionsUpdate.fields[attribute['name']]['inputType'] = attribute['type'];
      this.optionsUpdate.fields[attribute['name']]['name'] = attribute['name'];
      this.optionsUpdate.fields[attribute['name']]['label'] = attribute['label'];

      if(attribute['updatable'] == "false"){
        this.optionsUpdate.fields[attribute['name']]['readonly'] = "true";
      }
    }

    //Creating an empty form using alpaca
    //The form will be filled with current document's data by calling fillUpdateForm
    $("#updateWindow").alpaca({
      "schemaSource": this.schemaType,
      "options": this.optionsUpdate,
      "view": view
    });

  }


  this.updateDoc = function updateDoc(){

    this.activateWindow(true);
    this.fillUpdateForm();
    this.contributeController.documentController.documentBrowser.activateWindow(false);
  }

  this.fillUpdateForm = function fillUpdateForm(){
    //holds the current document's data (= the one currently shown in the browser)
    this.data =  this.contributeController.documentController.getCurrentDoc().metadata;
    $("#updateForm").alpaca('get').setValue(this.data);
  }

  this.deleteDoc = function deleteDoc(){


  }

  this.initialize();

  document.getElementById('docUpdateButton').addEventListener('mousedown', this.updateDoc.bind(this),false);
  document.getElementById('docDeleteButton').addEventListener('mousedown', this.deleteDoc.bind(this),false);
  document.getElementById('closeUpdate').addEventListener('mousedown', this.activateWindow.bind(this,false),false);

  document.getElementById('docUpdate').addEventListener('mousedown', this.contributeController.documentUpdate.bind(this.contributeController),false);

}
