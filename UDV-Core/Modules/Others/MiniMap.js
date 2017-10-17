/**
* Class : MiniMapController
* adds a "minimap" window that can be open/closed with a button
*/

//import {itowns} from 'itowns';       // OK
//import { Coordinates, PlanarView, THREE } from 'itowns';   // NOK
import * as itowns from 'itowns';
THREE = itowns.THREE;

//update the html with elements for this class (windows, buttons etc)
var miniMapDiv = document.createElement("div");
miniMapDiv.id = 'minimap';
document.body.appendChild(miniMapDiv);

document.getElementById("minimap").innerHTML = '<button id="miniMapTab">CARTE</button>\
<div id="miniMapViewer"></div>';

/**
* Constructor for MiniMapController
* manages the 3d scene inside the minimap div, and the open/close button
* in the minimap scene, we had an itowns view with the same extent as for the main view
* an indicator object (THREE.BoxGeometry) follows the PlanarControls camera movement on x,y plane
* @param controls : an instance of PlanarControls
* @param extent : itowns extent object (city limits)
* @param renderer : the global renderer
*/
// ===========================================================================================
function MiniMapController(controls, extent, renderer) {

    // instance of PlanarControls
    this.controls = controls;

    // itowns extent
    this.extent = extent;

    // camera height (zoom level)
    this.cameraZ = 16000;

    // view setup
    const mapDiv = document.getElementById('miniMapViewer');
    this.view = new itowns.PlanarView(mapDiv, extent, { renderer });

    this.view.tileLayer.disableSkirt = true;
    // Add an WMS imagery layer (see WMS_Provider* for valid options)
    this.view.addLayer({
        url: 'https://download.data.grandlyon.com/wms/grandlyon',
        networkOptions: { crossOrigin: 'anonymous' },
        type: 'color',
        protocol: 'wms',
        version: '1.3.0',
        id: 'wms_imagery',
        name: 'Ortho2009_vue_ensemble_16cm_CC46',
        projection: 'EPSG:3946',
        axisOrder: 'wsen',
        options: {
            mimetype: 'image/jpeg',
        },
    });

    // state of the minimap window (open/closed)
    this.miniMapIsActive = false;

    // indicator object
    const geometry = new THREE.BoxGeometry( 250, 250, 250 );
    const material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
    this.mapIndicator = new THREE.Mesh( geometry, material );
    this.mapIndicator.position.z = 500;

    // camera position at center of extent, looking at the ground, at altitude cameraZ, with north/south/east/west orientation
    this.view.camera.setPosition(new itowns.Coordinates('EPSG:3946',this.extent.center().xyz().x, this.extent.center().xyz().y, this.cameraZ));
    this.view.camera.camera3D.quaternion.copy(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0));

    this.view.scene.add( this.mapIndicator );
    this.view.notifyChange(true);
    this.view.addFrameRequester(this);

    // called by framerequester
    //===================================================================
    this.update = function update(){

        this.mapIndicator.position.x = this.controls.camera.position.x;
        this.mapIndicator.position.y = this.controls.camera.position.y;
        this.mapIndicator.updateMatrixWorld();

        this.view.notifyChange(true);
    }
    //===================================================================
    this.toggleMap = function toggleMap(){

        mapDiv.style.display = this.miniMapIsActive ? "none" : "block";
        this.miniMapIsActive = this.miniMapIsActive ? false : true;
        this.view.notifyChange(true);

    }

    document.getElementById("miniMapTab").addEventListener('mousedown', this.toggleMap.bind(this),false);
    mapDiv.style.display = (this.miniMapIsActive)? "block" : "none";
}
