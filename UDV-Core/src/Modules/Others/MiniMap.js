import { Coordinates, PlanarView} from 'itowns';
import { MAIN_LOOP_EVENTS } from 'itowns';
import * as THREE from 'three';
import './MiniMap.css';
import * as itowns from "itowns";

/**
* Constructor for MiniMapController
* manages the 3d scene inside the minimap div, and the open/close button
* in the minimap scene, we had an itowns view with the same extent as for the main view
* an indicator object (THREE.BoxGeometry) follows the PlanarControls camera movement on x,y plane
* @param controls : an instance of PlanarControls
* @param extent : itowns extent object (city limits)
* @param renderer : the global renderer
*/
// ===========================================================================
export function MiniMapController(controls, extent, renderer) {

    //update the html with elements for this class (windows, buttons etc)
    var miniMapDiv = document.createElement("div");
    miniMapDiv.id = 'minimap';
    document.getElementById('viewerDiv').appendChild(miniMapDiv);

    document.getElementById("minimap").innerHTML =
      '<button   id="miniMapTab">Minimap</button>\
       <div id="miniMapViewer"></div>';

    // instance of PlanarControls
    this.controls = controls;

    // itowns extent
    this.extent = extent;

    // camera height (zoom level)
    this.cameraZ = 16000;

    // layer id
    this.layerId = 'wms_imagery_minimap';

    // view setup
    const mapDiv = document.getElementById('miniMapViewer');

    // Since the elevation layer use color textures, specify min/max z which is in
    // gray scale. Normally a multiplicative factor should allow to get the data at
    // the right scale but it is not done by the Open Data Grand Lyon
    const config = {
        materialOptions: {
            useColorTextureElevation: true,
            colorTextureElevationMinZ: 0,
            colorTextureElevationMaxZ: 255,
        },
        disableSkirt: true,
    };

    this.view = new PlanarView(mapDiv, extent, config);

    // Add an WMS imagery layer (see WMS_Provider* for valid options)
    this.view.addLayer({
        type: 'color',
        id: this.layerId,
        updateStrategy: {
            type: itowns.STRATEGY_DICHOTOMY,
            options: {},
        },
        source: {
            extent: extent,
            name: 'Ortho2009_vue_ensemble_16cm_CC46',
            protocol: 'wms',
            url: 'https://download.data.grandlyon.com/wms/grandlyon',
            version: '1.3.0',
            projection: 'EPSG:3946',
            format: 'image/jpeg',
        },
    });

    // called by framerequester
    //===================================================================
    this.update = function update(){

        this.mapIndicator.position.x = this.controls.camera.position.x;
        this.mapIndicator.position.y = this.controls.camera.position.y;
        this.mapIndicator.updateMatrixWorld();

        // Request redraw of the scene
        this.view.notifyChange();
    };

    //===================================================================
    this.toggleMap = function toggleMap(){

        mapDiv.style.display = this.miniMapIsActive ? "none" : "block";
        this.miniMapIsActive = this.miniMapIsActive ? false : true;
        this.view.notifyChange();
    };

    // state of the minimap window (open/closed)
    this.miniMapIsActive = false;

    // indicator object
    const geometry = new THREE.BoxGeometry( 250, 250, 250 );
    const material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
    this.mapIndicator = new THREE.Mesh( geometry, material );
    this.mapIndicator.position.z = 500;

    // camera position at center of extent, looking at the ground, at altitude cameraZ, with north/south/east/west orientation
    this.view.camera.setPosition(new Coordinates('EPSG:3946',this.extent.center().xyz().x, this.extent.center().xyz().y, this.cameraZ));
    this.view.camera.camera3D.quaternion.copy(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0));

    this.view.scene.add( this.mapIndicator );
    this.view.notifyChange();
    this.view.addFrameRequester( MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE,
                                 this.update.bind(this) );



    document.getElementById("miniMapTab").addEventListener('mousedown', this.toggleMap.bind(this),false);
    mapDiv.style.display = (this.miniMapIsActive)? "block" : "none";
}
