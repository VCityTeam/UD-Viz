// This is a simple example app with only documents
const terrainAndElevationRequest = 'https://download.data.grandlyon.com/wms/grandlyon';

// FIXME for this demo of the widget we don't need buildings !
const buildingServerRequest = 'http://rict.liris.cnrs.fr:9091/getCity?city=citydb_temporal';

// itowns view (3d scene)
var view;
// itowns extent (city limits)
var extent;
// ====================

// Initialization of the renderer, view and extent
[ view, extent ] = udvcore.Setup3DScene(terrainAndElevationRequest,
                                        buildingServerRequest,
                                        true );

// camera starting position (south-west of the city, altitude 2000)
view.camera.setPosition(new udvcore.itowns.Coordinates('EPSG:3946', extent.west(), extent.south(), 2000));
// camera starting orientation (looking at city center)
view.camera.camera3D.lookAt(extent.center().xyz());

const optionsRegularMode = {
    maxAltitude : 15000,
    rotateSpeed : 3.0,
    autoTravelTimeMin: 2,
    autoTravelTimeMax: 6,
};

var controls = new udvcore.itowns.PlanarControls(view,
                                                 optionsRegularMode);

// FIXME: this can not work currently because Document.initialize
// currently hardwires the load from "docImageSourceHD = Vilo3D/Docs/"
//var documents =
//  new udvcore.DocumentsHandler(view,controls,'docs.csv');
