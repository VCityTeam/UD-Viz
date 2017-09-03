
THREE = itowns.THREE;

var showBuildings = true;

var helpIsActive = true;

var miniMapIsActive = false;

// # Planar (EPSG:3946) viewer

document.getElementById("info").innerHTML = "UDV v0.2";
document.getElementById("cartoDataSource").innerHTML = "données urbaines : https://data.grandlyon.com/";

document.getElementById("helpTab").onclick = function () {
    document.getElementById('help').style.display = helpIsActive ? "none" : "block";
    helpIsActive = helpIsActive ? false : true;


};

document.getElementById("miniMapTab").onclick = function () {
    document.getElementById('miniMap').style.display = miniMapIsActive ? "none" : "block";
    miniMapIsActive = miniMapIsActive ? false : true;


};


// Define projection that we will use (taken from https://epsg.io/3946, Proj4js section)
itowns.proj4.defs('EPSG:3946',
'+proj=lcc +lat_1=45.25 +lat_2=46.75 +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');

// Define geographic extent: CRS, min/max X, min/max Y
const extent = new itowns.Extent(
    'EPSG:3946',
    1837816.94334, 1847692.32501,
    5170036.4587, 5178412.82698,
);

const center = extent.center().xyz();

// ====================
let renderer;
// ====================

// `viewerDiv` will contain iTowns' rendering area (`<canvas>`)
const viewerDiv = document.getElementById('viewerDiv');
const miniMap = document.getElementById('miniMap');
// Instanciate PlanarView*
var view = new itowns.PlanarView(viewerDiv, extent, { renderer });

var mapView = new itowns.PlanarView(miniMap, extent, { renderer });

view.tileLayer.disableSkirt = true;

// Add an WMS imagery layer (see WMS_Provider* for valid options)
view.addLayer({
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

// Add an WMS elevation layer (see WMS_Provider* for valid options)
view.addLayer({
    url: 'https://download.data.grandlyon.com/wms/grandlyon',
    type: 'elevation',
    protocol: 'wms',
    networkOptions: { crossOrigin: 'anonymous' },
    version: '1.3.0',
    id: 'wms_elevation',
    name: 'MNT2012_Altitude_10m_CC46',
    projection: 'EPSG:3946',
    axisOrder: 'wsen',
    heightMapWidth: 256,
    options: {
        mimetype: 'image/jpeg',
    },
});
// Since the elevation layer use color textures, specify min/max z
view.tileLayer.materialOptions = {
    useColorTextureElevation: true,
    colorTextureElevationMinZ: 37,
    colorTextureElevationMaxZ: 240,
};

mapView.tileLayer.disableSkirt = true;

// Add an WMS imagery layer (see WMS_Provider* for valid options)
mapView.addLayer({
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

// Add an WMS elevation layer (see WMS_Provider* for valid options)
mapView.addLayer({
    url: 'https://download.data.grandlyon.com/wms/grandlyon',
    type: 'elevation',
    protocol: 'wms',
    networkOptions: { crossOrigin: 'anonymous' },
    version: '1.3.0',
    id: 'wms_elevation',
    name: 'MNT2012_Altitude_10m_CC46',
    projection: 'EPSG:3946',
    axisOrder: 'wsen',
    heightMapWidth: 256,
    options: {
        mimetype: 'image/jpeg',
    },
});
// Since the elevation layer use color textures, specify min/max z
mapView.tileLayer.materialOptions = {
    useColorTextureElevation: true,
    colorTextureElevationMinZ: 37,
    colorTextureElevationMaxZ: 240,
};

// function use :
// For preupdate Layer geomtry :
var preUpdateGeo = function (context, layer) {
    if(layer.root === undefined) {
        itowns.init3dTilesLayer(context, layer);
        return [];
    }
    itowns.pre3dTilesUpdate(context, layer);
    return [layer.root];
};


// Create a new Layer 3d-tiles For Viewer Request Volume
// -----------------------------------------------------
const $3dTilesLayerRequestVolume = new itowns.GeometryLayer('3d-tiles-request-volume', view.scene);

$3dTilesLayerRequestVolume.preUpdate = preUpdateGeo;
$3dTilesLayerRequestVolume.update = itowns.process3dTilesNode(
    itowns.$3dTilesCulling,
    itowns.$3dTilesSubdivisionControl
);

$3dTilesLayerRequestVolume.name = 'RequestVolume';
$3dTilesLayerRequestVolume.url = 'http://localhost:9090/getCity?city=lyon';
$3dTilesLayerRequestVolume.protocol = '3d-tiles'
$3dTilesLayerRequestVolume.overrideMaterials = false;  // custom cesium shaders are not functional
$3dTilesLayerRequestVolume.type = 'geometry';
$3dTilesLayerRequestVolume.visible = true;

if(showBuildings){itowns.View.prototype.addLayer.call(view, $3dTilesLayerRequestVolume);}


var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.45 );
directionalLight.position.set( 0, 0, 20000 );
directionalLight.updateMatrixWorld();
view.scene.add( directionalLight );

var AmbientLight = new THREE.AmbientLight( 0xffffff,0.4 );
AmbientLight.position.set(0, 0, 3000 );
directionalLight.updateMatrixWorld();
view.scene.add( AmbientLight );

// LOADING COLLADA GEOMETRY ============================================================================================
var idlBuildings = [];
var loader = new THREE.ColladaLoader();
var idlPosition = new THREE.Vector3(1844025, 5175788, 191);
var idlPosition2 = idlPosition.clone().sub(new THREE.Vector3(0,0,10));
var amountToLoad;
var amountLoaded = 0;
var allLoadedEventSent = false;


var onModelLoad = function onModelLoad(array, index, position, scale) {

    const offset = new THREE.Vector3();
    let object;

    return ( collada ) => {
        object = collada.scene;
        object.scale.set( scale, scale, scale );

        array[index] = object;

        array[index].position.set(position.x, position.y, position.z);
        array[index].rotation.x = 0 ;
        array[index].updateMatrixWorld();

        amountLoaded += 1;

        if(amountLoaded === amountToLoad && !allLoadedEventSent){

            window.dispatchEvent(allModelsLoadedEvent);
            allLoadedEventSent = true;
        }
        //onModelLoadFinished();
    };

};

var allModelsLoadedEvent = document.createEvent('Event');
allModelsLoadedEvent.initEvent('allModelsLoaded', true, true);

amountToLoad = 7;

// array, index, position, scale
loader.load('Models/IDL/Etape0/IDL_Etape0.dae', onModelLoad(idlBuildings,0,idlPosition2,0.40) );
loader.load('Models/IDL/Etape1/IDL_Etape1.dae', onModelLoad(idlBuildings,1,idlPosition2,0.40) );
loader.load('Models/IDL/Etape2/IDL_Etape2.dae', onModelLoad(idlBuildings,2,idlPosition2,0.40) );
loader.load('Models/IDL/Etape3/IDL_Etape3.dae', onModelLoad(idlBuildings,3,idlPosition2,0.40) );
loader.load('Models/IDL/Etape4/IDL_Etape4.dae', onModelLoad(idlBuildings,4,idlPosition2,0.40) );
loader.load('Models/IDL/Etape5/IDL_Etape5.dae', onModelLoad(idlBuildings,5,idlPosition2,0.40) );
loader.load('Models/IDL/Etape6/IDL_Etape6.dae', onModelLoad(idlBuildings,6,idlPosition,0.40) );
//============================================================================================

var idlDates = [];
idlDates.push(new Date("1725-01-01"));
idlDates.push(new Date("1851-01-01"));
idlDates.push(new Date("1860-01-01"));
idlDates.push(new Date("1880-01-01"));
idlDates.push(new Date("1895-01-01"));
idlDates.push(new Date("1968-01-01"));
idlDates.push(new Date("1971-01-01"));

view.camera.setPosition(new itowns.Coordinates('EPSG:3946', extent.west(), extent.south(), 2000));
view.camera.camera3D.lookAt(extent.center().xyz());

function MiniMapController(view, controls, extent) {
    this.view = view;
    this.controls = controls;
    this.extent = extent;
    this.cameraZ = 17000;

    const indicatorScale = new THREE.Vector3();
    const geometry = new THREE.BoxGeometry( 200, 200, 200 );
    const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    this.mapIndicator = new THREE.Mesh( geometry, material );
    this.mapIndicator.position.z = 500;

    this.view.camera.setPosition(new itowns.Coordinates('EPSG:3946',this.extent.center().xyz().x, this.extent.center().xyz().y, this.cameraZ));
    this.view.camera.camera3D.quaternion.copy(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0));

    this.view.scene.add( this.mapIndicator );
    this.view.addFrameRequester(this);
    this.update = function update(){

        this.mapIndicator.position.x = this.controls.camera.position.x;
        this.mapIndicator.position.y = this.controls.camera.position.y;
        this.mapIndicator.updateMatrixWorld();

        this.view.notifyChange(true);
    }
}


// instanciate only one controls !!! comment the one you dont use

// controls for editing
 //var controls = new itowns.PlanarControls(view, {zoomInFactor : 0.05, zoomOutFactor : 0.05, maxAltitude : 17000, maxZenithAngle: 88});



// regular controls
var controls = new itowns.PlanarControls(view, {maxAltitude : 15000, rotateSpeed : 2.5, autoTravelTimeMin: 2, autoTravelTimeMax: 5});

var temporal = new TemporalController(view,controls,idlBuildings,idlDates,"2017-09-15");

var documents = new DocumentsHandler(view,controls,{temporal: temporal});

var guidedtour = new GuidedTour(documents);

 var minimap = new MiniMapController(mapView, controls, extent);

 document.getElementById("miniMap").style.display = (miniMapIsActive)? "block" : "none";
