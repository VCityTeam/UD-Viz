import { Window } from "../../../Utils/GUI/js/Window";

/**
 * Class: CreateDocument
 * Description :
 * The CreateDocument is an object handling the creation view
 *
 */

 /**
  *
  * @constructor
  * @param { HTML DOM Element object } creationContainer
  * @param { contributeController } contributeController
  */

export class CreateDocument extends Window {

  constructor(creationContainer, contributeController) {
    super('create_doc', 'Document - Creation');

    this.contributeController = contributeController;
    this.creationContainer = creationContainer;
    this.browserTabs = this.contributeController.documentController.documentBrowser.browserTabID;

    this.contributeController.documentController.documentBrowser.addEventListener(
      Window.EVENT_CREATED, () => {
        var docBrowserCreateButton = document.createElement('button');
        docBrowserCreateButton.id = "docBrowserCreateButton";
        var word = document.createTextNode("Create");
        docBrowserCreateButton.appendChild(word);
        document.getElementById(this.browserTabs).appendChild(docBrowserCreateButton);

        this.contributeController.documentController.documentBrowser.refresh(); //original documentBrowser is updated with additional buttons

        document.getElementById('docBrowserCreateButton').addEventListener('mousedown',
        this.updateCreationWindow.bind(this),false);
      }
    );
    
    // Whether this window is currently displayed or not.
    this.windowIsActive = this.contributeController.documentController.options.active || false;
    this.windowManualIsActive = false;

    this.creationFormId = "creationForm"; //creation form ID.

    this.appendTo(this.contributeController.documentController.parentElement);
    this.hide();
    this.addEventListener(Window.EVENT_HIDDEN, () => {
      this.contributeController.documentController.documentResearch.show();
      this.contributeController.documentController.documentBrowser.show();
    });
  }

  /**
   * Creates the creation view
   */
  //=============================================================================
  initialize()
  {
    this.docModelToSchema();

    // HTML container of the pane allowing to place the document in the scene
    var positionerContainer = document.createElement("div");
    positionerContainer.id = "positionerContainer";
    document.body.appendChild(positionerContainer);

    positionerContainer.innerHTML =
    '<div id="docPositionerFull">\
    <img id="docPositionerFullImg"/></div>\
    ';
  }

  get innerContentHtml() {
    return /*html*/`
    <div class="creation" id="${this.creationWholePanelId}">
      <div id = "creationWindow"></div>
      <div id ="creationTabs">
        <button id = "docCreation">Send</button>
        <button id = "documentPositioner">Place doc</button>
      </div>
    </div>
    <div id="docPositionWindow">
      <div id = "inputFields" >
        <table>
          <tr><td><label id = "xPosLab" for="setPosX">XPosition </label></td>
          <td><input id = "setPosX"></label></td>
          </tr>
          <tr><td><label id = "yPosLab" for="setPosY">YPosition</label></td>
          <td><input id = "setPosY"></label></td>
          </tr>
          <tr><td><label id = "zPosLab" for="setPosZ">ZPosition</label></td>
          <td><input id = "setPosZ"></label></td>
          </tr>
          <tr><td><label id = "xQuatLab" for="quatX">XQuaternion</label></td>
          <td><input id = "quatX"></label></td>
          </tr>
          <tr><td><label id = "yQuatLab" for="quatY">YQuaternion</label></td>
          <td><input id = "quatY"></label></td>
          <tr><td><label id = "zQuatLab" for="quatZ">ZQuaternion</label></td>
          <td><input id = "quatZ"></label></td>
          </tr>
          <tr><td><label id = "wQuatLab" for="quatW">WQuaternion</label></td>
          <td><input id = "quatW"></label></td>
          </tr>
        </table>
      </div>
      <div id="docPositionerFullPanel">
        <button id="docPositionerSave" type=button>Save</button>
        <button id="moveDocument" type=button>Go to position</button>
        <button id = "docPositionerCancel" type=button>Cancel</button>
      </div>
    </div>
    `;
  }

  windowCreated() {
    this.initialize();
    this.initializeButtons();
    this.window.style.setProperty('left', 'unset');
    this.window.style.setProperty('right', '10px');
    this.window.style.setProperty('top', '10px');
    this.window.style.setProperty('width', '390px');
  }

  /**
   * Display or hide creation view, second window (document positions)
   */
  //=============================================================================
  activateManualPosition(active){

    if (typeof active != 'undefined')
    {
        this.windowManualIsActive = active;
    }

    document.getElementById('manualPos').style.display = active  ? "block" : "none ";
    this.contributeController.documentController.documentResearch.show();
    this.contributeController.documentController.documentBrowser.show();
  }


  /**
   * Close position window, abort position selection
   */
  //=============================================================================
  cancelPosition(){

    this.contributeController.visuData = new FormData(); //reset visuData form
    document.getElementById('docPositionWindow').style.display = 'none';
    document.getElementById('docPositionerFull').style.display = 'none';
    this.blurMetadataWindow(false);
  }

  /**
   * Blur and deactivate creation view to prevent modification while choosing
   * document position
   */
  //=============================================================================
  blurMetadataWindow(blur){

    if(blur ==true){
      document.getElementById('creationWholePanel').style.pointerEvents ="none";
      this.creationWholePanelElement.style.opacity = '0.5';
    }
    else{
      document.getElementById('creationWholePanel').style.pointerEvents ="auto";
      this.creationWholePanelElement.style.opacity = '1';
    }
  }

  /**
   * Create schema and options files used to generate the creation view (html form
   * using Alpaca )
   */
  //=============================================================================
  docModelToSchema(){
    //only use the metadata
    var metadata = this.contributeController.documentController.documentModel;
    //schema has at least a file input
    var schemaType =
    {
      "type": "object",
      "properties": {
        "file":{}
      }
    }

    //options have at least a file input, that can be displayed to the user
    var optionsCreate = {
      "form": {
        "attributes":{
          "id":this.creationFormId
        }
      },
      "fields":{
        "file":{
          "label":"Upload your file",
          "type":"file",
          "styled":true,
          "format":"uri",
          "id":"uploadedFile",
          "selectionHandler": function(files, data) {
              document.getElementById('docPositionerFullImg').src = data[0];
            }
          }
        }
      };

    for (var key in metadata) {
      var attribute = metadata[key]; //holds all metadata relative information

      //if the name exists
      if (!!attribute['name']) {
         //dynamic build the schema
          schemaType.properties[attribute['name']]={};
          optionsCreate.fields[attribute['name']] = {};
          optionsCreate.fields[attribute['name']]['id'] = attribute['creationID'];
          optionsCreate.fields[attribute['name']]['inputType'] = attribute['type'];
          if(attribute['optional'] == "false"){//this metadata is required in the creation process
            optionsCreate.fields[attribute['name']]['label'] = attribute['labelCreation'] + "* :";//start to show  field mandatory
          }
          else{
            optionsCreate.fields[attribute['name']]['label'] = attribute['labelCreation'];
          }

          optionsCreate.fields[attribute['name']]['name'] = attribute['name'];
          if(attribute['type'] == "enum"){
            optionsCreate.fields[attribute['name']]['type'] = 'select';
            schemaType.properties[attribute['name']]['enum'] = attribute['enum']
          }
      }
    }

    console.log(schemaType);
    //Create form using alpaca
    $("#creationWindow").alpaca({
         "schemaSource": schemaType,
         "options": optionsCreate
    });
  }

  /**
   * Displays creation and hide other views
   */
  //=============================================================================
  updateCreationWindow(){
    this.enable();
    this.contributeController.documentController.documentResearch.hide();
    this.contributeController.documentController.documentBrowser.hide();

  }

  get creationWholePanelId() {
    return 'creationWholePanel';
  }

  get creationWholePanelElement() {
    return document.getElementById(this.creationWholePanelId);
  }

  /**
   * Show or hide document positioner tool
   *
   */
  //=============================================================================
  showDocPositioner(show){
    if(show){
      document.getElementById('docPositionerFull').style.display = "block";
      document.getElementById('docPositionWindow').style.display = "block";
      this.blurMetadataWindow(true);
    }
    else {
      document.getElementById('docPositionerFull').style.display = "none";
      document.getElementById('docPositionWindow').style.display = "none";
      this.blurMetadataWindow(false);
    }

    this.contributeController.documentShowPosition();
  }

  initializeButtons() {
    //Event listeners for buttons
    document.getElementById('docCreation').addEventListener('mousedown',
      this.contributeController.documentCreation.bind(this.contributeController),false);
    document.getElementById('documentPositioner').addEventListener('mousedown',
                                  this.showDocPositioner.bind(this, true), false);

    document.getElementById('docPositionerSave').addEventListener('mousedown',
    this.contributeController.getVisualizationData.bind(this.contributeController), false);
    document.getElementById('moveDocument').addEventListener('mousedown',
          this.contributeController.moveDoc.bind(this.contributeController), false);
    document.getElementById('docPositionerCancel').addEventListener('mousedown',
                                      this.cancelPosition.bind(this,false), false);
  }

}
