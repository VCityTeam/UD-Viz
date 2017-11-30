const terrainAndElevationRequest = 'https://download.data.grandlyon.com/wms/grandlyon';

// or this line for local tileset
const buildingServerRequest = 'tileset.json';

// if true, replace regular controls by controls adapted to finding precise orientation for documents
// use false for regular controls (generic user)
var useControlsForEditing = false;

// global variables, initialized by the Setup3DScene() function below
// ====================
// THREE.js renderer
var renderer;
// itowns view (3d scene)
var view;
// itowns extent (city limits)
var extent;
// ====================

// this will initialize renderer, view and extent (UDV-Core/Setup3DScene.js)
[ view, extent ] =  udvcore.Setup3DScene(terrainAndElevationRequest,
                                         buildingServerRequest,
                                         true);

// global variables for Ilot du Lac (IDL), initialized by SetupIlotDuLac()
// ====================
// array of 3d objects (temporal versions)
var idlBuildings = [];
// array of dates (corresponding to the temporal versions)
var idlDates = [];
// ====================

// this will initialize idlBuildings and idlDates (SetupIDL.js)
//SetupIlotDuLac();

// camera starting position (south-west of the city, altitude 2000)
view.camera.setPosition(new udvcore.itowns.Coordinates('EPSG:3946', extent.west(), extent.south(), 2000));
// camera starting orientation (looking at city center)
view.camera.camera3D.lookAt(extent.center().xyz());


// PlanarControls (camera controller) options : regular mode (generic user) or edit mode
// edit mode is more precise but less ergonomic : used to determine precise orientation for documents
// see itowns/src/Renderer/ThreeExtended/PlanarControls.js for options parameters
const optionsRegularMode = {
    maxAltitude : 15000,
    rotateSpeed : 3.0,
    autoTravelTimeMin: 2,
    autoTravelTimeMax: 6,
};
const optionsEditMode= {
    maxAltitude : 17000,
    rotateSpeed : 1.5,
    zoomInFactor : 0.04,
    zoomOutFactor : 0.04,
    maxPanSpeed : 5.0,
    minPanSpeed : 0.01,
    maxZenithAngle: 88,
};

// instanciate PlanarControls (camera controller), from itowns/src/Renderer/ThreeExtended/PlanarControls.js
// we use optionsEditMode or optionsRegularMode according to the state of the boolean useControlsForEditing
var controls = new udvcore.itowns.PlanarControls(view, (useControlsForEditing)? optionsEditMode : optionsRegularMode);

// instanciate temporal controller
var temporal = new udvcore.TemporalController(view,{buildingVersions: idlBuildings, buildingDates: idlDates, dateDisplayLength : 4});

// instanciate document handler
var documents = new udvcore.DocumentsHandler(view,controls,'docs.csv',{temporal: temporal});

// instanciate guided tour controller
var guidedtour = new udvcore.GuidedTourController(documents,'visite.csv',{temporal: temporal, preventUserFromChangingTour : true});

// instanciate minimap controller
var minimap = new udvcore.MiniMapController(controls, extent, renderer);

// instanciate compass controller
var compass = new udvcore.CompassController(controls);
