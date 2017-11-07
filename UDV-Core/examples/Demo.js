const terrainAndElevationRequest = 'https://download.data.grandlyon.com/wms/grandlyon';

// use this line for local building server
// const buildingServerRequest = 'http://localhost:9090/getCity?city=citydb_temporal';

// use this line for distant building server
const buildingServerRequest = 'http://rict.liris.cnrs.fr:9090/getCity?city=lyon';

// or this line for local tileset
// const buildingServerRequest = 'tileset.json';

// if true, replace regular controls by controls adapted to finding precise orientation for documents
// use false for regular controls (generic user)
var useControlsForEditing = false;

// itowns view (3d scene)
var view;
// itowns extent (city limits)
var extent;
// ====================

// Initialization of the renderer, view and extent
[ view, extent ] = udvcore.Setup3DScene(terrainAndElevationRequest,
                                        buildingServerRequest,
                                        true );

// The renderer provided by THREE.js as handled over by itowns
var renderer = view.scene;

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

// itowns' PlanarControls (camera controller) uses optionsEditMode or
// optionsRegularMode depending on the value useControlsForEditing (boolean)
var controls = new udvcore.itowns.PlanarControls(view, (useControlsForEditing)? optionsEditMode : optionsRegularMode);

// instanciate temporal controller
var options = {
    startDate: new Date(1700,1,1),
    endDate: new Date(2049,12,31),
}
var temporal = new udvcore.TemporalController(view, options);

// FIXME: clean up the following or make the example more complete ?
// var temporal = new TemporalController(view,{buildingVersions: idlBuildings, buildingDates: idlDates, dateDisplayLength : 4});

// instanciate document handler
// var documents = new DocumentsHandler(view,controls,'docs.csv',{temporal: temporal});

// instanciate guided tour controller
// var guidedtour = new GuidedTourController(documents,'visite.csv',{temporal: temporal, preventUserFromChangingTour : true});

// instanciate minimap controller
var minimap = new udvcore.MiniMapController(controls, extent, renderer);

// instanciate compass controller
var compass = new udvcore.CompassController(controls);
