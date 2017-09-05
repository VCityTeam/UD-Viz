


var miniMapDiv = document.createElement("div");
miniMapDiv.id = 'minimap';
document.body.appendChild(miniMapDiv);

document.getElementById("minimap").innerHTML = '<button id="miniMapTab">CARTE</button>\
<div id="miniMapViewer"></div>';


function MiniMapController(controls, extent, renderer) {

    this.controls = controls;
    this.extent = extent;
    this.cameraZ = 16000;

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

    this.miniMapIsActive = false;

    const indicatorScale = new THREE.Vector3();
    const geometry = new THREE.BoxGeometry( 250, 250, 250 );
    const material = new THREE.MeshBasicMaterial( {color: 0xffffff} );
    this.mapIndicator = new THREE.Mesh( geometry, material );
    this.mapIndicator.position.z = 500;

    this.view.camera.setPosition(new itowns.Coordinates('EPSG:3946',this.extent.center().xyz().x, this.extent.center().xyz().y, this.cameraZ));
    this.view.camera.camera3D.quaternion.copy(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0));

    this.view.scene.add( this.mapIndicator );
    this.view.notifyChange(true);
    this.view.addFrameRequester(this);
    this.update = function update(){

        this.mapIndicator.position.x = this.controls.camera.position.x;
        this.mapIndicator.position.y = this.controls.camera.position.y;
        this.mapIndicator.updateMatrixWorld();

        this.view.notifyChange(true);
    }

    this.toggleMap = function toggleMap(){

        mapDiv.style.display = this.miniMapIsActive ? "none" : "block";
        this.miniMapIsActive = this.miniMapIsActive ? false : true;
        this.view.notifyChange(true);

    }

    document.getElementById("miniMapTab").addEventListener('mousedown', this.toggleMap.bind(this),false);
    mapDiv.style.display = (this.miniMapIsActive)? "block" : "none";
}
