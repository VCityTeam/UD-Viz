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
       <li>Arrow keys: camera translation </li>\
       <li>Another control</li>\
       <li>Another control</li>\
       <li>Another control</li>\
       <li>Another control</li>\
       <li>Another control</li>\
       <li>Another control</li>\
     </ul>\
     <button id="instructionsCloseButton">Close</button>\
     <button id ="showDocTab">Preview</button>\
  </div>\
  ';

var posDiv = document.createElement("div");
posDiv.id = 'pos';
document.body.appendChild(posDiv);

document.getElementById("pos").innerHTML =
'<div id="docPositionerFull">\
    <img id="docPositionerFullImg"/>\
    <div id="docPositionerFullPanel">\
        <button id="docPositionerClose" type=button>Close</button>\
        <button id="CameraPositionTab" type=button>CameraPosition</button>\
        <label id="docOpaLabel2" for="docOpaSlider2">Opacity</label>\
        <input id="docOpaSlider2" type="range" min="0" max="100" value="75"\
        step="1" oninput="docPositionerOpaUpdate(value)">\
        <output for="docPositionerOpaSlider" id="docPositionedOpacity">50</output><br>\
        <input id = "posX"><br>\
        <input id = "posY"><br>\
        <input id = "posZ"><br>\
        <input id = "quatX"><br>\
        <input id = "quatY"><br>\
        <input id = "quatZ"><br>\
        <input id = "quatW"><br>\
    </div>\
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

this.getCameraPosition = function getCameraPosition(){
//    console.log(view.camera.camera3D.position );
    var cam = view.camera.camera3D;
    var position = cam.position;
    var quaternion = cam.quaternion;
    document.getElementById("posX").value = position.x;
    document.getElementById("posY").value = position.y;
    document.getElementById("posZ").value = position.z;
    document.getElementById("quatX").value = quaternion.x;
    document.getElementById("quatY").value = quaternion.y;
    document.getElementById("quatZ").value = quaternion.z;
    document.getElementById("quatW").value = quaternion.w;
    return view.camera.camera3D;
  }

  this.showDocPositioner = function showDocPositioner() {
    console.log("displaying document in the center");
    document.getElementById('docPositionerFull').style.display = "block";
    //controls.goToTopView();
    document.getElementById('docPositionerClose').addEventListener('mousedown', this.getCameraPosition.bind(this), false);
  }

    // close the center window (oriented view / doc focus)
    //=========================================================================
    this.closeDocPositioner = function closeDocPositioner(){
        document.getElementById('docPositionerFull').style.display = "none";
        //document.getElementById('docFullImg').src = null;
    }

  // Close the window...when close button is hit
  document.getElementById("instructionsCloseButton").addEventListener(
       'mousedown', this.activateWindow.bind(this, false ), false);


  document.getElementById("showDocTab").addEventListener('mousedown', this.showDocPositioner.bind(this),false);
  document.getElementById("docPositionerClose").addEventListener('mousedown', this.closeDocPositioner.bind(this),false);
  document.getElementById("CameraPositionTab").addEventListener('mousedown', this.getCameraPosition.bind(this),false);
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
// in orientied view (focusOnDoc) this is called when the user changes the value of the opacity slider
//=============================================================================
function docPositionerOpaUpdate(opa){
    document.querySelector('#docPositionedOpacity').value = opa;
    document.getElementById('docPositionerFullImg').style.opacity = opa/100;
}
