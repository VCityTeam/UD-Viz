///
import * as THREE from 'three';
import { MAIN_LOOP_EVENTS } from 'itowns';
import { Document } from '../Documents/Document.js'
import { readCSVFile } from '../../Tools/CSVLoader.js';
import '../Documents/DocumentsHandler.css';
import DefaultImage from '../Documents/DefaultImage.png';
import './DocumentPositioner.css';



export function DocumentPositioner(view, controls, dataFile, options = {}) {
  // camera position for the oriented view

  this.view = view;

  var instructionDiv = document.createElement("div");
  instructionDiv.id = 'instruc';
  document.body.appendChild(instructionDiv);

  document.getElementById("instruc").innerHTML =
  '<div id="instructionWindow">\
     <br>\
     <p><a target="_blank"\
     href="PlanarControls.js">Camera key bindings</a>:</p>\
     <ul>\
       <li>Left-Click: camera translation (drag)</li>\
       <li>Right-Click: camera translation (pan)</li>\
       <li>Ctrl + Left-Click: camera rotation (orbit)</li>\
       <li>Spacebar / Wheel-Click: smart zoom</li>\
       <li>Mouse Wheel: zoom in/out</li>\
       <li>T: orient camera to a top view</li>\
       <li>Y: move camera to start position</li>\
     </ul>\
     <button id="instructionsCloseButton">Close</button>\
     <button id ="showDoc">Preview</button>\
  </div>\
  ';

  var link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('type', 'text/css');
  link.setAttribute('href', '/src/Modules/Contribute/Contribute.css');
  document.getElementsByTagName('head')[0].appendChild(link);


  // PlanarControls instance, required for the oriented view TO DO
  this.controls = controls;


  ///////////// Class attributes
  // Whether this window is currently displayed or not.
  this.windowIsActive = options.active || false;

  // Display or hide this window
  this.activateWindow = function activateWindow( active ){
    if (typeof active != 'undefined') {
      this.windowIsActive = active;
    }
    document.getElementById('instructionWindow').style.display =
                            active ? "block" : "none" ;
  }

  this.refresh = function refresh( ){
    this.activateWindow( this.windowIsActive );
  }

 function cameraPosition(){
    console.log(view.camera.camera3D.position );
  }

  this.showMyDoc = function showMyDoc() {

      // display the image (begins loading) but with opacity 0 (hidden)
      document.getElementById('docFull').style.display = "block";
      document.getElementById('docFullImg').src = "http://rict.liris.cnrs.fr/DataStore/Vilo3Ddocs/1760versPlanHCL_BD.jpg";
      console.log("displaying camera position");
      console.log(view.camera.camera3D.position );
      controls.goToTopView();
      document.getElementById('docFullClose').addEventListener('mousedown', cameraPosition.bind(this), false);
    }




  // Close the window...when close button is hit
  document.getElementById("instructionsCloseButton").addEventListener(
       'mousedown', this.activateWindow.bind(this, false ), false);


  document.getElementById("showDoc").addEventListener('mousedown', this.showMyDoc.bind(this),false);
  ///////////// Initialization
  this.refresh( );

  //document.getElementById('docFull').style.display = "block";

  var docViewPos = new THREE.Vector3();
/*
  docViewPos.x =
  docViewPos.y =
  docViewPos.z =
*/
  // camera orientation for the oriented view
  var docViewQuat = new THREE.Quaternion();
  /*
  docViewQuat.x =
  docViewQuat.y =
  docViewQuat.z =
  docViewQuat.w =
*/


///////////// Initialization
this.refresh( );

}
