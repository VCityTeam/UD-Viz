import $ from 'jquery';
import 'alpaca';
import 'bootstrap-datepicker'
import '../Contribute/DocumentPositioner.js';
import './DocumentsHandler.js';


export function CreateDoc(controls, view){
  this.myUploadedImage = null;

  var formDiv = document.createElement("div");
  formDiv.id = 'aform';
  document.body.appendChild(formDiv);

  document.getElementById("aform").innerHTML =
  '<div id="CreateDocWindow">\
  <label id="WindowTitle" >Document creation</label>\
  <p></p>\
  <div id="alpacaForm" name = "alpacaForm">\
  </div>\
  <div id="pickingInfo" style="display:none">\
  <input id = "billboardX">\
  <input id ="billboardY">\
  </div>\
  <div id = "divButtons">\
  <button id = "showDocTab">Place doc</button>\
  <button id = "billboardSelectPosition">Choose billboard position</button>\
  <button id = "submitButton">Submit</button>\
  <button id = "closeCreateDoc">Close</button>\
  </div>\
  </div>\
  ';
  var schema = "http://rict.liris.cnrs.fr/schemaType.json";
  var optionsCreate = "http://rict.liris.cnrs.fr/optionsCreate.json";
  var optionsCreateDur = {
    "form": {
      "attributes":{
        "id":"myCreationForm"
      }
    },
    "fields":{
      "title": {
        "label":"Title of the document"
      },
      "refDate1": {
        "name":"refDate",
        "label":"Referring date",
        "inputType": "date",
        "id":"refDate",
        "validate":true
      },
      "refDate2":{
        "disabled":true,
        "hidden":true
      },
      "publicationDate1":{
        "inputType":"date",
        "id":"publicationDate",
        "label": "Publication date",
        "required":true,
        "name":"publicationDate"
      },
      "publicationDate2":{
        "disabled":true,
        "hidden":true
      },
      "keyword":{
        "disabled":true,
        "hidden":true
      },
      "type":{
        "label":"Type",
        "type":"select",
        "id":"type"
      },
      "subject":{
        "label":"Subject",
        "type":"select",
        "id":"subject"
      },
 "link":{
   "label":"Upload your file",
   "type":"file",
   "styled":true,
   "format":"uri",
   "id":"uploadedFile",
   "selectionHandler": function(files, data) {
            document.getElementById('docPositionerFullImg').src = data[0];
            this.myUploadedImage = data[0];
          }
      },
 "description":{
   "input":"textarea",
   "id":"description",
   "label":"Describe your file:"
 }
}
}

  $("#alpacaForm").alpaca({
       "schemaSource": schema,
       "optionsSource": optionsCreateDur
  });

  var posDiv = document.createElement("div");
  posDiv.id = 'pos';
  document.body.appendChild(posDiv);

  document.getElementById("pos").innerHTML =
  '<div id="docPositionerFull">\
      <img id="docPositionerFullImg"/>\
      <div id="docPositionerFullPanel">\
          <button id="docPositionerClose" type=button>Save</button>\
          <button id = "saveManualPosTEST" type = button>SAVEBIS</button>\
          <button id="CameraPositionTab" type=button>CameraPositionDebug</button>\
          <button id = "setPositionManually" type = button>SetPositionManualy</button>\
          <label id="docOpaLabel2" for="docOpaSlider2">Opacity</label>\
          <input id="docOpaSlider2" type="range" min="0" max="100" value="75"\
          step="1" oninput="docPositionerOpaUpdate(value)">\
          <output for="docPositionerOpaSlider" id="docPositionedOpacity">50</output><br>\
          <div id = "debugCameraPostion" >\
          <input id = "posX"><br>\
          <input id = "posY"><br>\
          <input id = "posZ"><br>\
          <input id = "quatX"><br>\
          <input id = "quatY"><br>\
          <input id = "quatZ"><br>\
          <input id = "quatW"><br>\
          </div>\
          <div id = "setPositionFields" >\
          <input id = "setPosX"><br>\
          <input id = "setPosY"><br>\
          <input id = "setPosZ"><br>\
          <input id = "setQuatX"><br>\
          <input id = "setQuatY"><br>\
          <input id = "setQuatZ"><br>\
          <input id = "setQuatW"><br>\
          </div>\
      </div>\
  </div>\
  ';

  this.initialize = function initialize(){
    this.contributeMode = "create";
    document.getElementById('startContributeWindow').style.display = "none";
    document.getElementById('CreateDocWindow').style.display ="block";
    this.docPos = new THREE.Vector3();
    this.docQuat =  new THREE.Quaternion();
    // billboard position
    this.docBillboardPos = new THREE.Vector3();
    //the way the user chooses to place the doc (overlay / billboard)
    this.modePlace = 1; //to handle as an option ??
    this.newDocData = null;

    this.creationStatus = 0; //status of the POST request to doc creation

    this.controls = controls;
    this.view = view;

  }
  ///////////// Initialization

  this.initialize();


  //Fonction used for DEBUG =>don't pay attention
  this.getCameraPosition = function getCameraPosition(){
  //    console.log(view.camera.camera3D.position );
      document.getElementById('debugCameraPostion').style.display = "block";
      var cam = this.view.camera.camera3D;
      var position = cam.position;
      var quaternion = cam.quaternion;
      document.getElementById("posX").value = position.x;
      document.getElementById("posY").value = position.y;
      document.getElementById("posZ").value = position.z;
      document.getElementById("quatX").value = quaternion.x;
      document.getElementById("quatY").value = quaternion.y;
      document.getElementById("quatZ").value = quaternion.z;
      document.getElementById("quatW").value = quaternion.w;
      return this.view.camera.camera3D;
    }

    //SETMANUALPOSIITON
    //Gives the user the possibility to give values for position and quaternion
    //by writting them in HTML 'input' elements.
    //By default, the values are set to the curretn camera position and quaternion
    //=========================================================================
    this.setManualPosition = function setManualPosition(){
      //dispaly input fields
      document.getElementById('setPositionFields').style.display = "block";
      var cam = this.view.camera.camera3D;
      var position = cam.position;
      var quaternion = cam.quaternion;
      //set values by default
      document.getElementById('setPosX').value = position.x;
      document.getElementById('setPosY').value = position.y;
      document.getElementById('setPosZ').value = position.z;
      document.getElementById('setQuatX').value = quaternion.x;
      document.getElementById('setQuatY').value = quaternion.y;
      document.getElementById('setQuatZ').value = quaternion.z;
      document.getElementById('setQuatW').value = quaternion.w;
    }

    // UPDATEDOCDATA
    // Handles the update of the document's metadatas by adding
    // the documnet's visualization metadatas
    // position : vec3(x,y,z) => camera position
    // quaternion : quaternion(x,y,z,w) => camera quaternion
    // billboard : vec3(x,y,z) => TODO
    //=========================================================================
    this.UpdateDocData = function UpdateDocData(){

        this.newDocData.append("positionX", this.docPos.x);
        this.newDocData.append("positionY", this.docPos.y);
        this.newDocData.append("positionZ", this.docPos.z);
        this.newDocData.append("quaternionX",this.docQuat.x);
        this.newDocData.append("quaternionY",this.docQuat.y);
        this.newDocData.append("quaternionZ",this.docQuat.z);
        this.newDocData.append("quaternionW",this.docQuat.w);

    }

    // SAVEDOCPOSITON: saves the position of the document chosed by the user
    // If the user chose the "OverlayMode": the billboard position is set by default
    // If the user chose the "BillboardMode": the overlay position is set by default
    //=========================================================================
    this.SaveDocPosition = function SaveDocPosition(){
      //DEBUG
      console.log(this.modePlace);
      //OverlayMode
      if(this.modePlace==1){
        var cam = this.view.camera.camera3D;
        this.docPos = cam.position;
        this.docQuat = cam.quaternion;
      }
      //BillboardMode
      if(this.modePlace==2){
      }
      console.log("end of save doc position");
    }


    this.SaveDocManualPosition = function SaveDocManualPosition(){

      this.docPos.x = document.getElementById('setPosX').value;
      this.docPos.y = document.getElementById('setPosY').value;
      this.docPos.z = document.getElementById('setPosZ').value;
      this.docQuat.x = document.getElementById('setQuatX').value;
      this.docQuat.y = document.getElementById('setQuatY').value;
      this.docQuat.z = document.getElementById('setQuatZ').value;
      this.docQuat.w = document.getElementById('setQuatW').value;

    }



    // SHOWDOCPOSITIONER
    // Handles the tool used to placed documents in overlay to the scene
    //=========================================================================
    this.showDocPositioner = function showDocPositioner() {
      console.log("displaying document in the center");
      this.mode = 1; //the user chose to place its document in overlay
      document.getElementById('docPositionerFull').style.display = "block";
    }

    // CLOSEDOCPOSITIONER
    // Closes the tool to choose the position/orientation of the image in overlay
    //=========================================================================
    this.closeDocPositioner = function closeDocPositioner(){
      document.getElementById('docPositionerFull').style.display = "none";
      //document.getElementById('docFullImg').src = null;
      this.SaveDocPosition();
//      this.SaveDocManualPosition();
    //  this.modePlace = 0; //defaultMode reinitialization
    }

    this.saveManualPosition = function saveManualPosition(){
      console.log("saving manual position");
      document.getElementById('docPositionerFull').style.display = "none";
      this.SaveDocManualPosition();
    }

    // SELECTBILLBOARDPOSITION:
    // Handles the selection of a position for the billboard
    // 1. showinstructons
    // 2. by user click
    //    Display billboard with image, then offer the user the possiblity to drag and drop billboard
    //    To begin => color the "selected position" on the map
    // 3. save
    // TODO
    //=========================================================================
    this.selectBillboardPosition = function selectBillboardPosition(event){
      event.preventDefault();
      this.modePlace = 2; //billboard mode
      console.log("billboard mode");
      var mouse = new THREE.Vector2();
      //  var raycaster = new THREE.Raycaster();
      mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
      this.mousePosition = new THREE.Vector2(mouse.x, mouse.y);
      var pos = this.controls.getWorldPointAtScreenXY(this.mousePosition);
      //console.log(pos);
      //raycaster.setFromCamera( mouse, this.camera );
      //
      //console.log(mouse);
    }

    this.getPosition = function getPosition(event){
      var mouse = new THREE.Vector2();
      mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
      this.mousePosition = new THREE.Vector2(mouse.x, mouse.y);
      var pos = this.controls.getWorldPointAtScreenXY(this.mousePosition);
    }

    this.updateBillboardPositionFromMousePicking = function updateBillboardPositionFromMousePicking(event){
      document.getElementById('pickingInfo').style.display = "block";
      var mouse = new THREE.Vector2();
      mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
      mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
      var billboardPosition = this.controls.getWorldPointAtScreenXY(mouse);
      console.log(billboardPosition);
      $('#billboardX').val(billboardPosition.x);
      $('#billboardY').val(billboardPosition.y);
    }

    // BILLBOARDPOSITIONER:
    //
    //=========================================================================
    this.billboardPositioner = function billboardPositioner(event){

      // DEBUG
      console.log('billboard positioner');
      this.modePlace = 2; //billboard mode
  //     //create plane object
  //     var object, material;
  //     var objGeometry = new THREE.PlaneGeometry(12,10);
  //     var texture = new THREE.TextureLoader().load("http://rict.liris.cnrs.fr/DataStore/1824marsPlanCadastralTerra_Bis_BD.jpg");
  //     // immediately use the texture for material creation
  //     material = new THREE.MeshBasicMaterial( { map: texture, side: THREE.DoubleSide } );
  // //      object = new THREE.Mesh(objGeometry.clone(), material); clone if I want to have several similar objects
  //     this.object = new THREE.Mesh(objGeometry, material);
  //     this.object.scale.set(100,100,100);
  //     this.object.position.x=1843489;
  //     this.object.position.y=	5175421;
  //     this.object.position.z=	228;
  //     this.object.rotation.x = Math.PI / 2;
  //     this.object.updateMatrixWorld();
  //     this.view.scene.add(this.object);
  //     //DEBUG log position
  //     //this.getPosition(event);
      document.addEventListener('mousedown', this.updateBillboardPositionFromMousePicking.bind(this),false);
    }

    this.closeDocCreation = function closeDocCreation(){
      document.getElementById('CreateDocWindow').style.display ="none";
    }

    //POSTNEWDOC
    //Sends Http request to create a new document in the DB
    //=========================================================================
    this.PostNewDoc = function PostNewDoc(url, data, callback) {
      //console.log(data);
      var req = new XMLHttpRequest();
      req.open("POST", url);
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
        console.error("Network error with url: " + url);
      });
      req.send(data);
    }

      // CREATENEWDOC
      // Handles the creation of a new document in the database
      //=========================================================================
      this.CreateNewDoc = function CreateNewDoc(){
        this.newDocData = new FormData(document.getElementById('myCreationForm'));
        this.UpdateDocData();
        console.log("myNewDoc");
        //console.log(this.newDocData);
        //TODO: add data verification
        //post data and execute script to process data if data verification OK
        //TODO create new instance of Document ??
        //var doc = new Document(docTitle,docIndex,doc_ID,docImageSourceHD,docImageSourceBD,billboardPosition,docViewPosition,docViewQuaternion,docRefDate, docPublicationDate, docDescription, docMetaData, docSubject)
        this.PostNewDoc("http://rict.liris.cnrs.fr/APIVilo3D/APIExtendedDocument/web/app_dev.php/addDocument",this.newDocData, function(){});
        if (this.creationStatus = 1){ //request succeeded
          //clear all form fields
          $("#myCreationForm").get(0).reset();
          //close document positionner and creation window
          document.getElementById('docPositionerFull').style.display = "none";
          document.getElementById('CreateDocWindow').style.display = "none";
        }

        else { //request failed
          alert('Document could not be created, check information');
        }
        // DEBUG
        for (var pair of this.newDocData.entries()) {
          console.log(pair[0]+ ', ' + pair[1]);
        }
      }

    // event listeners for buttons
    document.getElementById("showDocTab").addEventListener('mousedown', this.showDocPositioner.bind(this),false);
    document.getElementById("billboardSelectPosition").addEventListener('mousedown', this.billboardPositioner.bind(this), false);
    document.getElementById("docPositionerClose").addEventListener('mousedown', this.closeDocPositioner.bind(this),false);
    document.getElementById("saveManualPosTEST").addEventListener('mousedonw', this.saveManualPosition.bind(this),false);
    document.getElementById("CameraPositionTab").addEventListener('mousedown', this.getCameraPosition.bind(this),false);
    document.getElementById("setPositionManually").addEventListener('mousedown', this.setManualPosition.bind(this),false);
    document.getElementById('submitButton').addEventListener("mousedown", this.CreateNewDoc.bind(this), false);
    document.getElementById("closeCreateDoc").addEventListener('mousedown', this.closeDocCreation.bind(this),false);

}
