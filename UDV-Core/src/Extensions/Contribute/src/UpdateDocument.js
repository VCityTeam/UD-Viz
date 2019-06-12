import { Window } from "../../../Utils/GUI/js/Window";

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

export class UpdateDocument extends Window {

  constructor(updateContainer, contributeController) {
    super('update_doc', 'Document - Update')
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

    this.appendTo(this.contributeController.documentController.parentElement);
    this.hide();
    this.addEventListener(Window.EVENT_HIDDEN, () => {
      this.contributeController.documentController.documentBrowser.show();
    });
    this.initialize();
  }

  initialize()
  {
    this.contributeController.documentController.documentBrowser.addEventListener(
      Window.EVENT_CREATED, () => {
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

        document.getElementById('docUpdateButton').addEventListener('mousedown', this.updateDoc.bind(this),false);
        document.getElementById('docDeleteButton').addEventListener('mousedown', this.contributeController.documentDelete.bind(this.contributeController),false);
      }
    );

    this.docModelToSchema();
  }

  get innerContentHtml() {
    return `
    <div id = "updateTitle">You can update following information:</div>
    <div class="update">
    <div id = "updateWindow" ></div></div>
    <div id="docUpdatePreview"><img id="docUpdatePreviewImg"/></div>
    <div id ="updateTabs">
    <button id = "docUpdate">Validate</button>
    <button id = "updateCancel">Cancel</button>
    </div>
    `;
  }

  windowCreated() {
    this.initializeButtons();
    this.window.style.setProperty('left', '590px');
    this.window.style.setProperty('top', '10px');
    this.window.style.setProperty('width', '390px');
  }

  /**
   * Create schema and options files used to generate the update view (html form
   * using Alpaca )
   */
  //=============================================================================
  docModelToSchema(){

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
  updateDoc() {
    this.enable();
    this.fillUpdateForm();
    this.contributeController.documentController.documentBrowser.hide();
  }

  /**
   * Fills update form with current document data
   */
  //=============================================================================
  fillUpdateForm(){
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
  cancelUpdate(){
    this.disable();
  }

  initializeButtons() {
    document.getElementById('docUpdate').addEventListener('mousedown', this.contributeController.documentUpdate.bind(this.contributeController),false);

    document.getElementById('updateCancel').addEventListener('mousedown', this.cancelUpdate.bind(this),false);
  }
}
