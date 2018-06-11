//to use alpaca and jQuery
//HELP: https://www.sanwebe.com/2016/07/ajax-form-submit-examples-using-jquery

import $ from 'jquery';
import 'alpaca';
import 'bootstrap-datepicker'
import { DocumentsBrowser } from './DocumentsBrowser.js';
import { CreateDoc } from './CreateDoc.js';
import './Contribute.css';
import { MAIN_LOOP_EVENTS } from 'itowns';


export function Contribute(view, controls, options = {}, mode, url) {

  //Contribute Mode: start window
  var contriDiv = document.createElement("div");
  contriDiv. id = "startContributeWindow";
  document.body.appendChild(contriDiv);
  document.getElementById("startContributeWindow").innerHTML =
  '<div id = "filtersTitle">Document research</div>\
  <div id = "filtersWindow"></div>\
  <div id="displayModeButtons"></div>\
  <button id = "docInBrowser">Browser</button>\
  <button id = "docInBillboard">Billboards</button>\
  <button id="docCreate" type = button>Create</button>\
  ';

//should they .json be stored in "contribute" and not in server?
  var schemaFilter = "http://rict.liris.cnrs.fr/schemaFilter.json";
  var optionsFilter = "http://rict.liris.cnrs.fr/optionsFilter.json";
  var schema = "http://rict.liris.cnrs.fr/schemaType.json";

  $('#filtersWindow').alpaca({
    "schemaSource":schema,
    "optionsSource":optionsFilter
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
//  this.filtered_data = storedData;

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
    this.url = url;//
    this.filtered_data = "null";
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
    this.billboards = [];
  }

  ///////////// Initialization
  this.refresh( );
  this.initialize();

  //GETFILTEREDDOCUMENTS
  // *
  // all documents with filters chosen by the user
  this.getFilteredDocuments = function getFilteredDocuments(){
    //check which filters are activated
    var filters = new FormData(document.getElementById('filterForm'));
    var entries = filters.entries();
    var url_with_filters = this.url +"app_dev.php/getDocuments?";
    for(var pair of entries ){
      if(pair[1]!=""){
        url_with_filters+= pair[0] + "=" + pair[1];
        url_with_filters+="&";
      }
    }
    var url_with_filters = url_with_filters.slice('&',-1);

    var req = new XMLHttpRequest();
    req.open("GET", url_with_filters,false);
    req.send();
    this.filtered_data = JSON.parse(req.responseText);
  }

//DISPLAYDOCS
// shows documents / filtered documents
// there is two modes : in borwser or in billboards
  this.displayDocs = function displayDocs(){
    //get documents from database
    this.getFilteredDocuments();
    //display doc in browser
    if(this.filtered_data.length==0){
      alert('No document found');
    }
    else {
      //TODO add options billboard / browser in documentsHandler parameters?
      //create instance of DocumentsBrowser with the selected documents according to the filters
      if (this.modePlace ==1){
        this.showBrowser();
      }
      else{
        if (this.modePlace == 2){
          this.showBillboards();
        }
      }
    }
  }

//SHOWBROWSER
// shows document browser if requested
//
  this.showBrowser = function showBrowser(){
    var documents = new DocumentsBrowser(view, controls, this.filtered_data, {temporal: temporal} , this.url );
    document.getElementById('docBrowserWindow').style.display = "block";
  }


/** CREATBILLBOARD
* create billboard associated to an Extend Document
*/
//==========================================================================
// FIXME this function is called each time the "Billboard" button is clicked,
// and in that way, more 3D objects can be created than we need (if we click several times)
// the creation of a document (in createDoc) should handle the creating of an associated 33Dobject
// and here we just handle the display of them and not the creation
  this.createBillboard=function createBillboard(doc){
    var object, material;
    var objGeometry = new THREE.PlaneGeometry(12,10);
    var texture = new THREE.TextureLoader().load(this.url + "documentsDirectory/" +  doc.metadata.link);
    material = new THREE.MeshBasicMaterial( { map: texture, side: THREE.DoubleSide } );
    object = new THREE.Mesh(objGeometry.clone(), material);
    this.billboards.push(object);
    object.scale.set(50,50,50);
    object.quaternion.copy( this.view.camera.camera3D.quaternion );//face camera when created. Theb
    object.position.x=doc.visualization.positionX;
    object.position.y=	doc.visualization.positionY;
    object.position.z=	626;
    object.updateMatrixWorld();
  }

  //TODO ??? take this function into another class in charge of handling a set of objects
  this.showBillboards = function showBillboards(){
    for (var i =0; i<this.filtered_data.length;i++){
      var doc = this.filtered_data[i];
      this.createBillboard(doc);
      this.view.scene.add(this.billboards[i]);
    }
  }



/** UPDATEBILLBOARDORIENTATION
* called in the addFrameRequester so that billboards always face the screen
*/
//==========================================================================
  this.updateBillboardOrientation = function updateBillboardOrientation(){
    for(var i = 0; i<this.billboards.length;i++){
        this.billboards[i].quaternion.copy( this.view.camera.camera3D.quaternion );
        this.billboards[i].updateMatrixWorld();
    }
  }

  // request update every active frame
  this.controls.view.addFrameRequester( MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE,this.updateBillboardOrientation.bind(this) );


  this.setBrowserMode = function setBrowserMode(){
    this.modePlace = 1;
    console.log('browser mode');
    this.displayDocs();
  }
  this.setBillboardMode = function setBillboardMode(){
    this.modePlace = 2;
    console.log('billboard mode');
    this.displayDocs();
  }

  //EventListeners for buttons
  document.getElementById('docCreate').addEventListener("mousedown", function(){    handleDocCreation(this.controls, this.view);
    }, false);
  document.getElementById("docInBrowser").addEventListener('mousedown', this.setBrowserMode.bind(this),false);
  document.getElementById('docInBillboard').addEventListener('mousedown', this.setBillboardMode.bind(this),false);

}
//HANDLEDOCCREATION
function handleDocCreation(controls, view){
  console.log("entering creation class");
  var newDocCreation = new CreateDoc(controls, view);
}
