const terrainAndElevationRequest = 'https://download.data.grandlyon.com/wms/grandlyon';

// use this line for distant building server
const buildingServerRequest = 'http://rict.liris.cnrs.fr/TemporalDemo/Data/tileset.json';

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
                                        false );

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

//////////// Temporal controller section

// Definition of the callback that is in charge of triggering a refresh
// of the displayed layer when its (the layer) associated date has changed.
function refreshDisplayLayerOnDate( date ) {
  view.notifyChange(true);
}

// Instanciate a temporal controller
var temporal = new udvcore.TemporalController(
                            refreshDisplayLayerOnDate,
                            {   // Various available constructor options
                                minTime:   new moment( "1700-01-01" ),
                                maxTime:   new moment( "2020-01-01" ),
                                startTime: new moment().subtract(10, 'years'),
                                endTime:   new moment().add(10, 'years'),
                                timeStep:  new moment.duration( 1, 'years'),
                                // or "YYYY-MMM" for Years followed months
                                timeFormat: "YYYY",
                                active:true
                              });

var about = new udvcore.AboutWindow({active:true});
var help  = new udvcore.HelpWindow({active:true});


//the following lines are in charge of loading configuration files used to setup
// different views of consultDoc module (research, browser).

//loading configuration files
var documentModel;
$.ajax({
  type: "GET",
  url: "DocumentModel.json",
  datatype: "json",
  async: false,
  success: function(data){
    documentModel = data;
  }
});

var researchModel;
$.ajax({
  type: "GET",
  url: "schemaFilters.json",
  datatype: "json",
  async: false,
  success: function(data){
    researchModel = data;
  }
});

var optionsResearch;
$.ajax({
  type: "GET",
  url: "optionsFilter.json",
  datatype: "json",
  async: false,
  success: function(data){
    optionsResearch = data;
  }
});


//The documentcontroller is in charge of handling the views (research, browser)
// based on the parameter documentModel, it builds the browser view (what attribute does
// a document have, what attributes do we want to display and how...)
// The researchModel and optionsResearch parameters are used to build / paramatrize
// the research view
var controller = new udvcore.DocumentController(view, controls, {temporal: temporal}, documentModel, researchModel, optionsResearch);

//the contributeController is in charge of handling the views of the contribute module,
//that is to say: update, creation and delete
var contributeController = new udvcore.ContributeController(controller);
///////////////////////////////////////////////////////////////////////////////
//// Create and configure the layout controller

// An html container is required in order to control the placement of the
// dat.GUI object within the page.
var datDotGUIDiv = document.createElement("div");
datDotGUIDiv.id = 'datDotGUIDiv';
document.body.appendChild(datDotGUIDiv);

// Associate the stylesheet for layout configuration
var link = document.createElement('link');
link.setAttribute('rel', 'stylesheet');
link.setAttribute('type', 'text/css');
link.setAttribute('href', './Demo.css');
document.getElementsByTagName('head')[0].appendChild(link);

// Proceed with the creation of the dat.GUI with the above positionning
var datDotGUI = new dat.GUI({ autoPlace: false });
datDotGUI.domElement.id = 'datDotGUI';
var datDotGUIContainer = document.getElementById('datDotGUIDiv');
datDotGUIContainer.appendChild( datDotGUI.domElement );

// About subwindow
aboutController = datDotGUI.add( about, 'windowIsActive'
                               ).name( "About" ).listen();
aboutController.onFinishChange( function(value) { about.refresh(); } );

// About subwindow
helpController = datDotGUI.add( help, 'windowIsActive'
                              ).name( "Help" ).listen();
helpController.onFinishChange( function(value) { help.refresh(); });


var temporalActiveCtrl = datDotGUI.add( temporal, 'temporalIsActive'
                                       ).name( "Active" ).listen();
temporalActiveCtrl.onFinishChange(function(value) {
  temporal.refresh();
});

//Document uses a folder
var documentFolder = datDotGUI.addFolder("Documents");
var docResearch = documentFolder.add( controller.documentResearch, 'windowIsActive'
                                        ).name("Research").listen();
docResearch.onFinishChange(function(value){
  controller.documentResearch.refresh();
});

var browserOption = documentFolder.add( controller.documentBrowser, 'windowIsActive'
                                       ).name("Browser").listen();
browserOption.onFinishChange(function(value){
  controller.documentBrowser.refresh();
});

datDotGUI.close();     // By default the dat.GUI controls are rolled up

// FIXME instanciate guided tour controller
// var guidedtour = new GuidedTourController(documents,'visite.csv',{temporal: temporal, preventUserFromChangingTour : true});

// instanciate minimap controller
var minimap = new udvcore.MiniMapController(controls, extent, renderer);

// instanciate compass controller
var compass = new udvcore.CompassController(controls);
