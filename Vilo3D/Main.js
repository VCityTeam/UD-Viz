
THREE = itowns.THREE;

var showBuildings = false;

var helpIsActive = true;

// # Planar (EPSG:3946) viewer

document.getElementById("info").innerHTML = "UDV v0.2";

document.getElementById("helpTab").onclick = function () {
    document.getElementById('help').style.display = helpIsActive ? "none" : "block";
    helpIsActive = helpIsActive ? false : true;


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

// ====================
let renderer;
// ====================

// `viewerDiv` will contain iTowns' rendering area (`<canvas>`)
const viewerDiv = document.getElementById('viewerDiv');
// Instanciate PlanarView*
var view = new itowns.PlanarView(viewerDiv, extent, { renderer });

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



				var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
				directionalLight.position.set( 1, 1, 20000 );
                directionalLight.updateMatrixWorld();
				view.scene.add( directionalLight );


var center = extent.center().xyz();
var offset1 = new THREE.Vector3(1000,1000,200);
var offset2 = new THREE.Vector3(-3000,-3000,3000);
var offset3 = new THREE.Vector3(000,000,1000);

var target = center.add(offset1);
var startpos = new THREE.Vector3(1845341,5174897,800);
var startlook = new THREE.Vector3(1843670,5175604,180);


/*
var controls = new CameraController(viewerDiv,view,extent,
{
debug: true,
startPos: startpos,
startLook: startlook
}
);
*/
view.camera.setPosition(new itowns.Coordinates('EPSG:3946', extent.west(), extent.south(), 2000));
view.camera.camera3D.lookAt(extent.center().xyz());

var controls = new itowns.PlanarControls(view, {zoomInFactor : 0.5, zoomOutFactor : 0.5});

var documents = new DocumentsHandler(view,controls);

var temporal = new TemporalController(view,controls,"2017-09-15");





documents.showBillboards();
documents.hideBillboards();
documents.showBillboards();

var guidedtour = new GuidedTour(documents);

// TEST collada

/*

//=========================================================================================================

// Rotate an object around an arbitrary axis in world space
function rotateAroundWorldAxis(object, axis, radians) {
    rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);

    // old code for Three.JS pre r54:
    //  rotWorldMatrix.multiply(object.matrix);
    // new code for Three.JS r55+:
    rotWorldMatrix.multiply(object.matrix);                // pre-multiply

    object.matrix = rotWorldMatrix;

    // old code for Three.js pre r49:
    // object.rotation.getRotationFromMatrix(object.matrix, object.scale);
    // old code for Three.js pre r59:
    // object.rotation.setEulerFromRotationMatrix(object.matrix);
    // code for r59+:
    object.rotation.setFromRotationMatrix(object.matrix);
}

var positionCollada = extent.center().xyz().clone().add(new THREE.Vector3(0,0,300));
console.log("positioncollada" , positionCollada)


//var ColladaLoader = require('three-collada-loader');
var scale = 100;
var object;
var loadingManager = new THREE.LoadingManager( function() {      view.scene.add( object );    } );
var loader = new THREE.ColladaLoader(loadingManager);
//loader.options.convertUpAxis = false;
loader.load('elf/elf.dae', function ( collada ) {
    object = collada.scene;
    object.scale.set( scale, scale, scale );
    object.position.set(positionCollada.x, positionCollada.y, positionCollada.z);
    console.log(positionCollada);
    object.updateMatrixWorld();

    object.rotation.x = 0;
    object.updateMatrixWorld();
} );



var geometry = new THREE.BoxGeometry( 5, 5, 5 );
var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
var cube = new THREE.Mesh( geometry, material );
cube.position.copy(positionCollada);
cube.updateMatrixWorld();
view.scene.add( cube );

var AmbientLight = new THREE.AmbientLight( 0xffffff,0.25 );
AmbientLight.position.set(449588.55700000003, 6200917.614, 3454.564500000003 + 1000 ).normalize();
view.scene.add( AmbientLight );

//guidedtour.startGuidedTour();

*/
