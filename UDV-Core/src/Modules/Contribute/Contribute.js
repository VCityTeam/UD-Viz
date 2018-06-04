//to use alpaca and jQuery
//HELP: https://www.sanwebe.com/2016/07/ajax-form-submit-examples-using-jquery

import $ from 'jquery';
import 'alpaca';
import 'bootstrap-datepicker'
import './DocumentPositioner.js';
import '../Documents/DocumentsHandler.js';

export function Contribute(view, controls, storedData, options = {}, mode) {

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
  this.filtered_data = storedData;

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
    this.objects = [];
  }

  ///////////// Initialization
  this.refresh( );
  this.initialize();

  this.displayDocs = function displayDocs(){
    //check which filters are activated
    var filters = new FormData(document.getElementById('filterForm'));
    var entries = filters.entries();

    /* DEBUG displaying filters
    for (var pair of filters.entries()){
      console.log(pair[0]+ ', ' + pair[1]);
    }*/
        var chain = "http://rict.liris.cnrs.fr/APIVilo3D/APIExtendedDocument/web/app_dev.php/getDocuments?";
        for(var pair of entries ){
          if(pair[1]!=""){
            chain+= pair[0] + "=" + pair[1];
            chain+="&";
          }
        }
        var chain = chain.slice('&',-1);
        console.log(chain);
        //get documents with or without filters
        var req = new XMLHttpRequest();
        req.open("GET", chain,false);
        req.send();
        console.log(req.statusText);
        this.filtered_data = JSON.parse(req.responseText);
        console.log(this.filtered_data);
        //display doc in browser
        if(this.filtered_data.length==0){
          alert('No document found');
        }
        else {
          //TODO add options billboard / browser in documentsHandler parameters
          //create instance of DocumentsHandler with the selected documents according to the filters
          if (this.modePlace ==1){
            this.showBrowser();
          }
          else{
            if (this.modePlace == 2){
              this.showBillboard();
            }
          }

        }
      }

      this.showBrowser = function showBrowser(){
        var documents = new udvcore.DocumentsHandler(view, controls, this.filtered_data, {temporal: temporal} );
        document.getElementById('docBrowserWindow').style.display = "block";
      }

      //TODO take this function into another class in charge of handling a set of objects
      this.showBillboard = function showBillboard(){
      document.addEventListener('mousedown', this.myfunctiontest.bind(this),false);
        for (var i =0; i<this.filtered_data.length;i++){
              var object, material;
              var objGeometry = new THREE.PlaneGeometry(12,10);
              var texture = new THREE.TextureLoader().load("http://rict.liris.cnrs.fr/APIVilo3D/APIExtendedDocument/web/documentsDirectory/" + this.filtered_data[i].metadata.link);
              // immediately use the texture for material creation
              material = new THREE.MeshBasicMaterial( { map: texture, side: THREE.DoubleSide } );

              object = new THREE.Mesh(objGeometry.clone(), material);
              this.objects.push(object);
              object.scale.set(50,50,50);
              //var q = new THREE.Quaternion(this.filtered_data[i].visualization.quaternionX,this.filtered_data[i].visualization.quaternionY,this.filtered_data[i].visualization.quaternionZ,this.filtered_data[i].visualization.quaternionW);
            //  object.applyQuaternion(q);
            object.rotation.x = Math.PI / 2; //rotates the object so it is "standing"
              object.position.x=this.filtered_data[i].visualization.positionX;
              object.position.y=	this.filtered_data[i].visualization.positionY;
              object.position.z=	626;
              object.updateMatrixWorld();
              this.view.scene.add(object);
            }

            }

this.myfunctiontest = function myfunctiontest(event){
  var mouse = new THREE.Vector2();
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  const pointUnderCursor = this.controls.getWorldPointAtScreenXY(mouse);
  console.log('mouse point screen');
  console.log(pointUnderCursor);
}

      this.handleDocCreation = function handleDocCreation(){
        console.log("entering creation class");
        var newDocCreation = new udvcore.CreateDoc(this.controls, this.view);
      }

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

      document.getElementById("docInBrowser").addEventListener('mousedown', this.setBrowserMode.bind(this),false);
      document.getElementById('docCreate').addEventListener("mousedown", this.handleDocCreation.bind(this),false);
      document.getElementById('docInBillboard').addEventListener('mousedown', this.setBillboardMode.bind(this),false);

    }
