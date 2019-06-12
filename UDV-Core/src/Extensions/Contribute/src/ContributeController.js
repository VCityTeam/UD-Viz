/**
 * Class: ContributeController
 * Description :
 * The ContributeControler is an object handling the document related views
 *
 */

import { CreateDocument }  from './CreateDocument.js';
import { UpdateDocument }   from './UpdateDocument.js';
import "./Contribute.css";
import { MAIN_LOOP_EVENTS } from 'itowns';
import { removeEmptyValues } from '../../../Utils/DataProcessing/DataProcessing';
import { AuthNeededError } from '../../../Utils/Request/RequestService.js';

/**
 *
 * @constructor
 * @param { documentController } documentController
 */

export function ContributeController(documentController, requestService){
  // Service to make HTTP requests (see Modules/Request)
  this.requestService = requestService;

  this.documentController = documentController;

  this.documentCreate; //CreateDocument object
  this.documentUpdate;

  this.creationContainerId = "creationContainer"; //create view
  this.updateContainerId = "updateContainer";     //update view

  //url to create a document
  this.documentUrl = this.documentController.url + this.documentController.serverModel.document;

  this.newDocData = null; //newly created document's data
  this.formData ; //document's static metadata
  this.visuData = new FormData(); //document's position data
  this.numberVisuData = 7; //number of visualization data (3 position, 4 quaternion)

  this.chosenPosition =  new THREE.Vector3();  //manual document's position
  this.chosenQuaternion =  new THREE.Quaternion(); //manual document's quaternion

  this.validPosition = false;

  this.initialize = function initialize(){

    var creationContainer = document.createElement("div");
    creationContainer.id = this.creationContainerId;
    document.body.appendChild(creationContainer);
    this.documentCreate = new CreateDocument(creationContainer, this);

    var updateContainer = document.createElement("div");
    updateContainer.id =   this.updateContainerId;
    document.body.appendChild(updateContainer);
    this.documentUpdate = new UpdateDocument(updateContainer, this);

  }

  /**
   * Gets the document's position that has been chosen by user.
   */
  //=============================================================================
  this.getVisualizationData = function getVisualizationData(){
    var cam = this.documentController.view.camera.camera3D;
    var position = cam.position;
    var quaternion = cam.quaternion;

    this.visuData.append("positionX", position.x);
    this.visuData.append('positionY', position.y);
    this.visuData.append('positionZ', position.z);
    this.visuData.append('quaternionX', quaternion.x);
    this.visuData.append('quaternionY', quaternion.y);
    this.visuData.append('quaternionZ', quaternion.z);
    this.visuData.append('quaternionW', quaternion.w);

    this.documentCreate.showDocPositioner();

    this.documentCreate.blurMetadataWindow(false);

  }

  

  /**
   * Gets the current visualization data set by the user and
   *  moves camera to this position
   */
  //=============================================================================
  this.moveDoc = function moveDoc(){
    this.chosenPosition.x = document.getElementById("setPosX").value;
    this.chosenPosition.y = document.getElementById("setPosY").value;
    this.chosenPosition.z = document.getElementById("setPosZ").value;
    this.chosenQuaternion.x = document.getElementById("quatX").value;
    this.chosenQuaternion.y = document.getElementById("quatY").value;
    this.chosenQuaternion.z = document.getElementById("quatZ").value;
    this.chosenQuaternion.w = document.getElementById("quatW").value;
    this.documentController.controls.initiateTravel(this.chosenPosition,"auto",
                                                    this.chosenQuaternion,true);
  }

  /**
  * Colors the form fields if value is not set
  */
  //=============================================================================
  this.colorField = function colorField(id, color){
    if(color == true){
    document.getElementById(id).style.border = "1px solid red";
  }
  else {
    document.getElementById(id).style.border = "1px solid white";
    }
  }

  /**
   * Checks if visualization data is provided
   */
  //=============================================================================
  this.visuDataVerification = function visuDataVerification(){

    var length = 0; //how many visu data are given?

    for (var pair of this.visuData.entries()){
      length +=1;
    }
    if(length != this.numberVisuData ){ //7 visualisation data must be provided
      alert('Please choose document position and save');
      this.documentCreate.showDocPositioner(true);
    }
    else {
      this.validPosition = true;
    }
    return this.validPosition;
  }


  /**
   * Verifies form data
   */
  //=============================================================================
  this.formDataVerification = function formDataVerification(){
    var dataIsValid = true;
    this.formData = new FormData(document.getElementById(this.documentCreate.creationFormId));
    this.newDocData = this.formData;

    for (var pair of this.formData.entries() ){
      var val = pair[0];
      if( val != "file"){ //is not file filed
        var attr = this.documentController.documentModel.metaData[val];
        if( attr['optional'] == 'false'){//is mandatory
          if(pair[1] == ""){  //but not provided
          var id = "create_"+pair[0];
          this.colorField(id, true);
          dataIsValid = false;
        }
        if(pair[1] != ""){ //is provided
          var id = "create_"+pair[0];
          this.colorField(id, false);
        }
      }
      else { //is file
        if (pair[1] == ""){ //no file provided
          dataIsValid = false;
        }
      }
    }

  }
  return dataIsValid;
}

  /**
   * Real time display of camera position ( = document position in overlay)
   */
  //=============================================================================
  this.documentShowPosition = function documentShowPosition(){

    var cam = this.documentController.view.camera.camera3D;
    var position = cam.position;
    var quaternion = cam.quaternion;
    document.getElementById("setPosX").value = position.x;
    document.getElementById("setPosY").value = position.y;
    document.getElementById("setPosZ").value = position.z;
    document.getElementById("quatX").value = quaternion.x;
    document.getElementById("quatY").value = quaternion.y;
    document.getElementById("quatZ").value = quaternion.z;
    document.getElementById("quatW").value = quaternion.w;
  }

/**
 *   Verifies if data is valid
 *   If yes, posts the new document and resets data
 */
//=============================================================================
  this.documentCreation = function documentCreation(){

    if (this.formDataVerification() ==true & this.visuDataVerification() == true){
      //add visualizationdata to document data
      for (var pair of this.visuData.entries() ){ //concatenate metadata and visu data
        this.newDocData.append(pair[0], pair[1]);
      }
      //new promess
      this.requestService.send('POST', this.documentUrl, this.newDocData)
        .then((response) => {
          $('#' + this.documentCreate.creationFormId ).get(0).reset();
          this.newDocData = new FormData();
          this.visuData = new FormData();
          this.documentController.getDocuments();
          (this.documentCreate.activateCreateWindow.bind(this.documentCreate))
            (false);
        }, (error) => {
          if (error.name === 'AuthNeededError') {
            alert("You should be logged in to create a document.");
          }
          console.error(error);
        });
    }
  }


  /**
   *   Updates document data
   */
  //=============================================================================
  this.documentUpdate = function documentUpdate(){

    this.updatedData = new FormData(document.getElementById(this.documentUpdate.updateFormId));
    this.updatedData = removeEmptyValues(this.updatedData);

    //get current doc data and id
    var currentDoc = this.documentController.getCurrentDoc();
    var id = currentDoc.metaData['id'];

    //new promise
    this.requestService.send('PUT', this.documentUrl + '/' + id, this.updatedData)
      .then((response) => {
        $('#'+this.documentUpdate.updateFormId).get(0).reset(); //clear update formular
        this.updatedData = new FormData(); //clear data
        this.documentController.reset();
        this.documentUpdate.activateWindow(false);
        this.documentController.docIndex = 0;//return to first doc
        this.documentController.documentBrowser.docIndex = 1; //reset index in browser
        this.documentController.documentBrowser.startBrowser();
        this.documentController.documentBrowser.show();
      }, (error) => {
        if (error.name === 'AuthNeededError') {
          alert("You should be logged in to update a document.");
        }
        console.error(error);
      });
  }

  /**
   *   Deletes a document
   */
  //=============================================================================

  this.documentDelete = function documentDelete(){

    //make sure you want to delete
    if(confirm('Delete this document permanently?')){
      //get current doc data and id
      var currentDoc = this.documentController.getCurrentDoc();
      var id = currentDoc.metaData['id'];

      this.requestService.send('DELETE', this.documentUrl + "/" + id)
        .then((response) => {
          alert("The document has been deleted successfully");
          this.documentController.getDocuments(); //update documents
          this.documentController.docIndex = 0;//return to first doc
          this.documentController.documentBrowser.docIndex = 1; //reset index in browser
          this.documentController.documentBrowser.startBrowser();
        }, (error) => {
          console.error("Failed!", error);
          alert('The document was not deleted');
        });
    } else {
      alert('The document was not deleted');
    }

  }



  // request update every active frame
  this.documentController.view.addFrameRequester( MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE,
                                                  this.documentShowPosition.bind(this) );

  this.initialize();

}
