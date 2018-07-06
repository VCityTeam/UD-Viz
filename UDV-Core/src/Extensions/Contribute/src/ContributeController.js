import { CreateDocument }  from './CreateDocument.js';
import { UpdateDocument }   from './UpdateDocument.js';
import "./Contribute.css";
import { MAIN_LOOP_EVENTS } from 'itowns';

export function ContributeController(documentController){

  this.documentController = documentController;

  this.documentCreate;
  this.documentUpdate;
  this.creationContainerId = "creationContainer";
  this.updateContainerId = "updateContainer";
  this.url = this.documentController.url + "app_dev.php/addDocument";

  this.newDocData = null;
  this.docPos = new THREE.Vector3();//DEBUG
  this.docQuat =  new THREE.Quaternion();//DEBUG

  this.creationStatus = 0; //status of the POST request to doc creation DEBUG

  this.initialize = function initialize(){
    var updateContainer = document.createElement("div");
    updateContainer.id =   this.updateContainerId;
    document.body.appendChild(updateContainer);
    this.documentUpdate = new UpdateDocument(updateContainer, this);

    var creationContainer = document.createElement("div");
    creationContainer.id = this.creationContainerId;
    document.body.appendChild(creationContainer);
    this.documentCreate = new CreateDocument(creationContainer, this);

  }

  this.addVisualizationData = function addVisualizationData(){
    this.docPos = new THREE.Vector3(0,0,0);
    this.docQuat = new THREE.Quaternion(0,0,0,0);
    this.newDocData.append("positionY", this.docPos.y);
    this.newDocData.append("positionZ", this.docPos.z);
    this.newDocData.append("quaternionX",this.docQuat.x);
    this.newDocData.append("quaternionY",this.docQuat.y);
    this.newDocData.append("quaternionZ",this.docQuat.z);
    this.newDocData.append("quaternionW",this.docQuat.w);
  }

  this.documentCreation = function documentCreation(){
    this.newDocData = new FormData(document.getElementById('creationForm'));
    this.addVisualizationData();
    this.addDocument(this.newDocData, function(){});
    if(this.creationStatus =1){
      console.log(this.creationStatus);
      $("#creationForm").get(0).reset();
    }
    else{
      alert('Document could not be created, check information');
    }

    //DEBUG
    for (var pair of this.newDocData.entries() ){
      console.log(pair[0] + ":" + pair[1]);
    }

  }


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

  this.addDocument = function addDocument(data, callback){
    var req = new XMLHttpRequest();
    req.open("POST", this.url);
    req.addEventListener("load", function () {
      if (req.status >= 200 && req.status < 400) {
        //update creation status
        this.creationStatus = 1;
        callback(req.responseText);
          alert('Posted');
        }
        else {
          this.creationStatus = 0;
          console.error(req.status + " " + req.statusText + " " + url);
        }
      });
      req.addEventListener("error", function () {
        console.log(req.status);
        console.log(req.statusText);
        console.error("Network error with url: " + url);
      });
      req.send(data);
  }

  this.updateCamPos = function updateCamPos(){
    this.documentShowPosition();
  }

  this.documentController.view.addFrameRequester( MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE,this.updateCamPos.bind(this) );

  this.initialize();

}
