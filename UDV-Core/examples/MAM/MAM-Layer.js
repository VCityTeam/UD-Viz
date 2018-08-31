/* global itowns, document, renderer */
// # Simple Globe viewer

// Define initial camera position
var positionOnGlobe = { longitude: 4.820, latitude: 45.7402, altitude: 2895};

var promises = [];
var meshes = [];
var linesBus = [];
var scaler;

var renderer;
var exports = {};

// Action if E is press (Debug Tool)
var keys = {
    E: 69,
};

var _handlerOnKeyDown = onKeyDown.bind(this);

this.addInputListeners = function () {
        this.domElement.addEventListener('keydown', _handlerOnKeyDown, true);
	}
	
function onKeyDown(event) {
	if (event.keyCode === keys.E) {
		console.log(globeView.controls.getCameraLocation());
		}
	}
// End of Action if E is press (Debug Tool)

// `viewerDiv` will contain iTowns' rendering area (`<canvas>`)
var viewerDiv = document.getElementById('viewerDiv');

// Instanciate iTowns GlobeView*
var globeView = new  itowns.GlobeView(viewerDiv, positionOnGlobe, { renderer: renderer });

function addLayerCb(layer) {
    return globeView.addLayer(layer);
}
//Le Top View et Zoom+Plus à refaire

//new itowns.PlanarControls(globeView, {});


// Define projection that we will use (taken from https://epsg.io/3946, Proj4js section)
itowns.proj4.defs('EPSG:3946',
    '+proj=lcc +lat_1=45.25 +lat_2=46.75 +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');

// Add one imagery layer to the scene
// This layer is defined in a json file but it could be defined as a plain js
// object. See Layer* for more info.
promises.push(itowns.Fetcher.json('../examples/layers/JSONLayers/Ortho.json').then(addLayerCb));

// Add two elevation layers.
// These will deform iTowns globe geometry to represent terrain elevation.
promises.push(itowns.Fetcher.json('../examples/layers/JSONLayers/WORLD_DTM.json').then(addLayerCb));
promises.push(itowns.Fetcher.json('../examples/layers/JSONLayers/IGN_MNT_HIGHRES.json').then(addLayerCb));

//Flux WFS = Ligne de bus de Lyon : Fonctions
    // Camera : longitude: 4.818, latitude: 45.7354, altitude: 3000
    function colorLine(properties) {
        var rgb = properties.couleur.split(' ');
        return new itowns.THREE.Color(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
    }
    
     function altitudeLine(properties, contour) {
        var altitudes = [];
        var i = 0;
        var alt = 0;
        if (contour.length && contour.length > 0) {
            for (; i < contour.length; i++) {
                alt = itowns.DEMUtils.getElevationValueAt(globeView.wgs84TileLayer, contour[i]).z + 2;
                altitudes.push(alt);
            }
            return altitudes;
        }
        return 0;
    }
    
    //Flux WFS = Ligne de bus de Lyon : Layer
    globeView.addLayer({
        type: 'geometry',
        update: itowns.FeatureProcessing.update,
        convert: itowns.Feature2Mesh.convert({
            color: colorLine,
            altitude: altitudeLine }),
        linewidth: 5,
        url: 'https://download.data.grandlyon.com/wfs/rdata?',
        protocol: 'wfs',
        version: '2.0.0',
        id: 'WFS Bus lines',
        typeName: 'tcl_sytral.tcllignebus',
        projection: 'EPSG:3946',
        extent: {
            west: 1822174.60,
            east: 1868247.07,
            south: 5138876.75,
            north: 5205890.19,
        },
        options: {
            mimetype: 'geojson',
        },
    }, globeView.tileLayer);
   
    //Flux WFS = borne de Velov : Function
    
    //function colorPoint(/* properties */) {
		/*return new itowns.THREE.Color(0xFF0000);
	}
	
	function altitudePoint(properties, contour) {
		if (contour.length && contour.length > 0) {
			return itowns.DEMUtils.getElevationValueAt(globeView.wgs84TileLayer, contour[0]).z + 5;
		}
		return 0;
	}
	
	//Flux WFS = borne de Velov : Layer
	
	globeView.addLayer({
    type: 'geometry',
    update: itowns.FeatureProcessing.update,
    convert: itowns.Feature2Mesh.convert({
        altitude: altitudePoint,
        color: colorPoint }),
    size: 5,
    onMeshCreated: configPointMaterial,
    url: 'https://download.data.grandlyon.com/wfs/ldata?',
    protocol: 'wfs',
    version: '2.0.0',
    id: 'WFS Velov Station',
    //typeName: 'velov.stations.1',
    projection: 'EPSG:3946',
        extent: {
            west: 1822174.60,
            east: 1868247.07,
            south: 5138876.75,
            north: 5205890.19,
        },
        options: {
            mimetype: 'geojson',
        },
}, globeView.tileLayer);
*/
    
    //Flux WFS = Batiments : Fonctions
    function colorBuildings(properties) {
        if (properties.id.indexOf('bati_remarquable') === 0) {
            return new itowns.THREE.Color(0x5555ff);
        } else if (properties.id.indexOf('bati_industriel') === 0) {
            return new itowns.THREE.Color(0xff5555);
        }
        return new itowns.THREE.Color(0xeeeeee);
    }
    
    function altitudeBuildings(properties) {
        return properties.z_min - properties.hauteur;
    }
    
    function extrudeBuildings(properties) {
        return properties.hauteur;
    }
    
    function acceptFeature(properties) {
        return !!properties.hauteur;
    }
	

	//Flux WFS = Batiments : Layer
     globeView.addLayer({
        type: 'geometry',
        update: itowns.FeatureProcessing.update,
        convert: itowns.Feature2Mesh.convert({
            color: colorBuildings,
            altitude: altitudeBuildings,
            extrude: extrudeBuildings }),
        filter: acceptFeature,
        url: 'http://wxs.ign.fr/72hpsel8j8nhb5qgdh07gcyp/geoportail/wfs?',
        networkOptions: { crossOrigin: 'anonymous' },
        protocol: 'wfs',
        version: '2.0.0',
        id: 'WFS Buildings',
        typeName: 'BDTOPO_BDD_WLD_WGS84G:bati_remarquable,BDTOPO_BDD_WLD_WGS84G:bati_indifferencie,BDTOPO_BDD_WLD_WGS84G:bati_industriel',
        level:14, 
        projection: 'EPSG:4326',
        ipr: 'IGN',
        options: {
            mimetype: 'json',
        },
    }, globeView.tileLayer);

exports.view = globeView;
exports.initialPosition = positionOnGlobe;

 /* global itowns, document, GuiTools, globeView, promises */
            var menuGlobe = new GuiTools('menuDiv');
            menuGlobe.view = globeView;
            // Listen for globe full initialisation event
            globeView.addEventListener(itowns.GLOBE_VIEW_EVENTS.GLOBE_INITIALIZED, function () {
                // eslint-disable-next-line no-console
                console.info('Globe initialized');
                Promise.all(promises).then(function () {
                    menuGlobe.addImageryLayersGUI(globeView.getLayers(function (l) { return l.type === 'color'; }));
                    menuGlobe.addElevationLayersGUI(globeView.getLayers(function (l) { return l.type === 'elevation'; }));
					globeView.controls.setHeading(-120,false);
					this.addInputListeners();
                });
            });
            
            const d = new debug.Debug(globeView, menuGlobe.gui);
            debug.createTileDebugUI(menuGlobe.gui, globeView, globeView.wgs84TileLayer, d);

            for (const layer of globeView.getLayers()) {
                if (layer.id === 'WFS Bus lines') {
                    layer.whenReady.then( function _(layer) {
                        var gui = debug.GeometryDebug.createGeometryDebugUI(menuGlobe.gui, globeView, layer);
                        debug.GeometryDebug.addMaterialLineWidth(gui, globeView, layer, 1, 10);
                    });
                }
                if (layer.id === 'WFS Buildings') {
                    layer.whenReady.then( function _(layer) {
                        var gui = debug.GeometryDebug.createGeometryDebugUI(menuGlobe.gui, globeView, layer);
                        debug.GeometryDebug.addWireFrameCheckbox(gui, globeView, layer);
                    });
                }
			}
			
			
function onKeyDown(event) {
	if (event.keyCode === keys.E) {
		console.log(globeView.controls.getCameraLocation());
		}
	}

