THREE = itowns.THREE;

/**
* Call this to initialize the values of global var : view, extent and renderer (Main.js)
* After this, the itowns view will contain itowns layers for city geometry
* The view will be displayed in
* @param buildingServerRequest : the request sent to building-server
* Example : http://localhost:9090/getCity?city=lyon for local server
* Example : http://rict.liris.cnrs.fr:9090/getCity?city=lyon for distant server
*/
//=============================================================================
var Setup3DScene = function Setup3DScene(buildingServerRequest){

// Define projection that we will use (taken from https://epsg.io/3946, Proj4js section)
itowns.proj4.defs('EPSG:3946',
'+proj=lcc +lat_1=45.25 +lat_2=46.75 +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');

// Define geographic extent: CRS, min/max X, min/max Y
extent = new itowns.Extent(
    'EPSG:3946',
    1837816.94334, 1847692.32501,
    5170036.4587, 5178412.82698,
);

// `viewerDiv` will contain iTowns' rendering area (`<canvas>`)
const viewerDiv = document.getElementById('viewerDiv');
// Instanciate PlanarView
view = new itowns.PlanarView(viewerDiv, extent, { renderer });

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

// Create a new Layer 3d-tiles  => data sent from building-server (LYON 6)
// -----------------------------------------------------
const $3dTilesLayer = new itowns.GeometryLayer('3d-tiles-request-volume', view.scene);

$3dTilesLayer.preUpdate = preUpdateGeo;
$3dTilesLayer.update = itowns.process3dTilesNode(
    itowns.$3dTilesCulling,
    itowns.$3dTilesSubdivisionControl
);

$3dTilesLayer.name = 'RequestVolume';

$3dTilesLayer.url = buildingServerRequest;

$3dTilesLayer.protocol = '3d-tiles'
$3dTilesLayer.overrideMaterials = false;  // custom cesium shaders are not functional
$3dTilesLayer.type = 'geometry';
$3dTilesLayer.visible = true;

// add the layer to the view
if(showBuildings){itowns.View.prototype.addLayer.call(view, $3dTilesLayer);}

// sky color
view.mainLoop.gfxEngine.renderer.setClearColor( 0x6699cc, 1);

// lights
var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
directionalLight.position.set( 0, 0, 20000 );
directionalLight.updateMatrixWorld();
view.scene.add( directionalLight );

var ambientLight = new THREE.AmbientLight( 0xffffff,0.5 );
ambientLight.position.set(0, 0, 3000 );
directionalLight.updateMatrixWorld();
view.scene.add( ambientLight );
}

// SETUP DATES & LOAD COLLADA BUILDINGS for Ilot du Lac (IDL)
var SetupIlotDuLac = function SetupIlotDuLac(){

    idlDates.push(new Date("1725-01-01"));
    idlDates.push(new Date("1812-01-01"));
    idlDates.push(new Date("1851-01-01"));
    idlDates.push(new Date("1860-01-01"));
    idlDates.push(new Date("1880-01-01"));
    idlDates.push(new Date("1895-01-01"));
    idlDates.push(new Date("1968-01-01"));
    idlDates.push(new Date("1971-01-01"));

    var loader = new THREE.ColladaLoader();
    var idlPosition = new THREE.Vector3(1844025, 5175788, 192);
    var idlPosition2 = idlPosition.clone().sub(new THREE.Vector3(0,0,20));
    var offsetpos = new THREE.Vector3(-6526.33,-6788.71,-190);
    var amountToLoad = 8;
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
                // if all models have been loaded, dispatch the allModelsLoadedEvent
                window.dispatchEvent(allModelsLoadedEvent);
                allLoadedEventSent = true;
            }
        };
    };
    // event telling us that all models have been loaded
    var allModelsLoadedEvent = document.createEvent('Event');
    allModelsLoadedEvent.initEvent('allModelsLoaded', true, true);

    // load the models in the array and assign them a position and scale
    // use : loader.load(pathToModel, onModelLoad(array, index, position, scale)
    loader.load('Models/IDL/Etape0/IDL_Etape0.dae', onModelLoad(idlBuildings,0,idlPosition2,0.40) );
    loader.load('Models/IDL/Etape0bis/IDL_Etape0bis.dae', onModelLoad(idlBuildings,1,idlPosition2,0.40) );
    loader.load('Models/IDL/Etape1/IDL_Etape1.dae', onModelLoad(idlBuildings,2,idlPosition2,0.40) );
    loader.load('Models/IDL/Etape2/IDL_Etape2.dae', onModelLoad(idlBuildings,3,idlPosition2,0.40) );
    loader.load('Models/IDL/Etape3/IDL_Etape3.dae', onModelLoad(idlBuildings,4,idlPosition2,0.40) );
    loader.load('Models/IDL/Etape4/IDL_Etape4.dae', onModelLoad(idlBuildings,5,idlPosition2,0.40) );
    loader.load('Models/IDL/Etape5/IDL_Etape5.dae', onModelLoad(idlBuildings,6,idlPosition2,0.40) );
    loader.load('Models/IDL/Etape6/IDL_Etape6.dae', onModelLoad(idlBuildings,7,idlPosition.clone().add(offsetpos),1.0) );
    //============================================================================================
}
