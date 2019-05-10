/**
 * Class: UpdateDocument
 * Description :
 * The UpdateDocument is an object handling the creation view
 *
 */

 /**
  *
  * @constructor
  * @param { HTML DOM Element object } creationContainer
  * @param { contributeController } contributeController
  */

export function UpdateDocument(updateContainer, contributeController){

  this.contributeController = contributeController;
  this.updateContainer = updateContainer;
  this.browser = this.contributeController.documentController.documentBrowser;
  this.data; //current document data (document shown in the browser)

  this.updateFormId = "updateForm"; //update form ID.

  this.schemaType = { //schema defining the update form, using Alpaca
    "type": "object",
    "properties": {
      //will be set by calling docModelToSchema
    }
  };

  this.optionsUpdate = { //options to render the update form
    "form": {
      "attributes":{
        "id": this.updateFormId
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
    document.getElementById(this.contributeController.documentController.documentBrowser.browserTabID).appendChild(docUpdateButton);

    var docDeleteButton = document.createElement('button');
    docDeleteButton.id = "docDeleteButton";
    var text = document.createTextNode("Delete");
    docDeleteButton.appendChild(text);
    document.getElementById(this.contributeController.documentController.documentBrowser.browserTabID).appendChild(docDeleteButton);

    this.updateContainer.innerHTML =
    '<br/><div id = "updateTitle">You can update following information:</div><br/>\
    <br/>\
    <button id = "closeUpdate">Close</button>\
    <div class="update">\
    <div id = "updateWindow" ></div></div>\
    <div id="docUpdatePreview"><img id="docUpdatePreviewImg"/></div>\
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

  /**
   * Create schema and options files used to generate the update view (html form
   * using Alpaca )
   */
  //=============================================================================
  this.docModelToSchema = function docModelToSchema(){

    var metadata = this.contributeController.documentController.documentModel.metaData;

    var view = { //so that the attribute that can not be modified are also displayed
      "displayReadonly": false
    };

    for (var key in metadata) {
      var attribute = metadata[key]; //holds all metadata relative information
      this.schemaType.properties[attribute['name']]={};
      this.optionsUpdate.fields[attribute['name']] = {};
      this.optionsUpdate.fields[attribute['name']]['id'] = attribute['updateID'];
      this.optionsUpdate.fields[attribute['name']]['inputType'] = attribute['type'];
      this.optionsUpdate.fields[attribute['name']]['name'] = attribute['name'];

      if(attribute['label'] != "false"){ //add label if required
        this.optionsUpdate.fields[attribute['name']]['label'] = attribute['label'];
      }

      if(attribute['type'] == "enum"){
        this.optionsUpdate.fields[attribute['name']]['type'] = 'select';
        this.schemaType.properties[attribute['name']]['enum'] = attribute['enum'];
      }

      if(attribute['updatable'] == "false"){
        //if not updatable, displayed in "readonly"
        //only displayed is displayReadonly is set to true
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

  /**
   * Displays update form, hide browser
   */
  //=============================================================================
  this.updateDoc = function updateDoc(){

    this.activateWindow(true);
    this.fillUpdateForm();
    this.contributeController.documentController.documentBrowser.activateWindow(false);
  }

  /**
   * Fills update form with current document data
   */
  //=============================================================================
  this.fillUpdateForm = function fillUpdateForm(){
    //holds the current document's data (= the one currently shown in the browser)
    this.data =  this.contributeController.documentController.getCurrentDoc().metaData;
    $('#'+ this.updateFormId).alpaca('get').setValue(this.data);
    document.getElementById('docUpdatePreviewImg').src = this.contributeController.documentController.url
                + this.contributeController.documentController.serverModel.document + '/'
                + this.data.id + '/'
                + this.contributeController.documentController.serverModel.file;
  }

  /**
   * Cancel update
   */
  //=============================================================================
  this.cancelUpdate = function cancelUpdate(){
    this.activateWindow(false);
    this.contributeController.documentController.documentBrowser.activateWindow(true);

  }

  this.initialize();

  document.getElementById('docUpdateButton').addEventListener('mousedown', this.updateDoc.bind(this),false);
  document.getElementById('closeUpdate').addEventListener('mousedown', this.activateWindow.bind(this,false),false);

  document.getElementById('updateCancel').addEventListener('mousedown', this.cancelUpdate.bind(this),false);

  document.getElementById('docUpdate').addEventListener('mousedown', this.contributeController.documentUpdate.bind(this.contributeController),false);
  document.getElementById('docDeleteButton').addEventListener('mousedown', this.contributeController.documentDelete.bind(this.contributeController),false);

}
