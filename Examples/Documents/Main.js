
// This is a simple example app with only documents

// we use THREE.js provided by itowns
THREE = itowns.THREE;

const terrainAndElevationRequest = 'https://download.data.grandlyon.com/wms/grandlyon';

// use this line for local building server
// const buildingServerRequest = 'http://localhost:9090/getCity?city=lyon';

// or this line for distant server
const buildingServerRequest = 'http://rict.liris.cnrs.fr:9090/getCity?city=lyon';

// if true, show building geometry sent by building-server (LYON 6)
var showBuildings = true;

// global variables
// ====================
// THREE.js renderer
var renderer;
// itowns view (3d scene)
var view;
// itowns extent (city limits)
var extent;
// ====================

// this will initialize renderer, view and extent (UDV-Core/Setup3DScene.js)
Setup3DScene(terrainAndElevationRequest,buildingServerRequest);

// camera starting position and orientation
view.camera.setPosition(new itowns.Coordinates('EPSG:3946', extent.west(), extent.south(), 2000));
view.camera.camera3D.lookAt(extent.center().xyz());

// instanciate controls
var controls = new itowns.PlanarControls(view, {maxAltitude : 15000, rotateSpeed : 2.5, autoTravelTimeMin: 1.5, autoTravelTimeMax: 5});

// instanciate document handler
var documents = new DocumentsHandler(view,controls,"docs.csv",{docBrowserWindowStartActive : true});
