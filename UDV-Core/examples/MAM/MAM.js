var extent;
var viewerDiv;
var view;
var meshes;
var p;

// Define projection that we will use (taken from https://epsg.io/3946, Proj4js section)
itowns.proj4.defs('EPSG:3946',
    '+proj=lcc +lat_1=45.25 +lat_2=46.75 +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');

// Define geographic extent: CRS, min/max X, min/max Y
extent = new itowns.Extent(
    'EPSG:3946',
    1837816.94334, 1847692.32501,
    5170036.4587, 5178412.82698);

// `viewerDiv` will contain iTowns' rendering area (`<canvas>`)
viewerDiv = document.getElementById('viewerDiv');

// Since the elevation layer use color textures, specify min/max z which is in
// gray scale. Normally a multiplicative factor should allow to get the data at
// the right scale but it is not done by the Open Data Grand Lyon
const config = {
    // materialOptions: {
    //     useColorTextureElevation: true,
    //     colorTextureElevationMinZ: 0,
    //     colorTextureElevationMaxZ: 255,
    // },
    disableSkirt: true,
};

// Instanciate PlanarView*
view = new itowns.PlanarView(viewerDiv, extent, config);

// Camera setting
const optionsRegularMode = {
    maxAltitude : 15000,
    rotateSpeed : 3.0,
    autoTravelTimeMin: 2,
    autoTravelTimeMax: 6,
};
const optionsEditMode= {
    maxAltitude : 17000,
    enableRotation: false,
    rotateSpeed : 1.5,
    zoomInFactor : 0.04,
    zoomOutFactor : 0.04,
    maxPanSpeed : 5.0,
    minPanSpeed : 0.01,
};

var useControlsForEditing = false;
//var positionOnGlobe = { longitude: 4.820, latitude: 45.7402, altitude: 2895};

var controls = new udvcore.itowns.PlanarControls(view, (useControlsForEditing)? optionsEditMode : optionsRegularMode);

// Add an WMS imagery layer (see WMSProvider* for valid options)
view.addLayer({
    type: 'color',
    id: 'WMS Image',
    transparent: false,
    source: {
        url: 'https://download.data.grandlyon.com/wms/grandlyon',
        networkOptions: { crossOrigin: 'anonymous' },
        protocol: 'wms',
        version: '1.3.0',
        name: 'Ortho2009_vue_ensemble_16cm_CC46',
        projection: 'EPSG:3946',
        extent: extent,
        format: 'image/jpeg',
    },
});

//longitude: 4.820, latitude: 45.7402, altitude: 2895
p = { coord: new itowns.Coordinates('EPSG:3946', 1840839, 5172718, 0), heading: 0, range: 2845, tilt: 90 };
itowns.CameraUtils.transformCameraToLookAtTarget(view, view.camera.camera3D, p);

// eslint-disable-next-line no-new
new itowns.PlanarControls(view, {});

// Request redraw
view.notifyChange();

function setMaterialLineWidth(result) {
    result.traverse(function _setLineWidth(mesh) {
        if (mesh.material) {
            mesh.material.linewidth = 5;
        }
    });
}

function colorLine(properties) {
    var rgb = properties.couleur.split(' ');
    return new itowns.THREE.Color(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255);
}

view.addLayer({
    id:'WFS Bus Lines',
    type: 'geometry',
    name: 'lyon_tcl_bus',
    update: itowns.FeatureProcessing.update,
    convert: itowns.Feature2Mesh.convert({
        color: colorLine,
      /*altitude: altitudeLine*/ }),
    onMeshCreated: setMaterialLineWidth,
    source: {
        url: 'https://download.data.grandlyon.com/wfs/rdata?',
        protocol: 'wfs',
        version: '2.0.0',
        id: 'tcl_bus',
        typeName: 'tcl_sytral.tcllignebus',
        projection: 'EPSG:3946',
        extent: {
            west: 1822174.60,
            east: 1868247.07,
            south: 5138876.75,
            north: 5205890.19,
        },
        zoom: { min: 2, max: 2 },
        format: 'geojson',
    },
});

function colorBuildings(properties) {
    if (properties.id.indexOf('bati_remarquable') === 0) {
        return new itowns.THREE.Color(0x5555ff);
    } else if (properties.id.indexOf('bati_industriel') === 0) {
        return new itowns.THREE.Color(0xff5555);
    }
    return new itowns.THREE.Color(0xeeeeee);
}

function extrudeBuildings(properties) {
    return properties.hauteur;
}

meshes = [];
function scaler(/* dt */) {
    var i;
    var mesh;
    if (meshes.length) {
        view.notifyChange();
    }
    for (i = 0; i < meshes.length; i++) {
        mesh = meshes[i];
        mesh.scale.z = Math.min(
            1.0, mesh.scale.z + 0.016);
        mesh.updateMatrixWorld(true);
    }
    meshes = meshes.filter(function filter(m) { return m.scale.z < 1; });
}

view.addFrameRequester(itowns.MAIN_LOOP_EVENTS.BEFORE_RENDER, scaler);
view.addLayer({
    id: 'WFS Buildings',
    type: 'geometry',
    update: itowns.FeatureProcessing.update,
    convert: itowns.Feature2Mesh.convert({
        color: colorBuildings,
        extrude: extrudeBuildings }),
    onMeshCreated: function scaleZ(mesh) {
        mesh.scale.z = 0.01;
        meshes.push(mesh);
    },
    projection: 'EPSG:3946',
    source: {
        url: 'http://wxs.ign.fr/72hpsel8j8nhb5qgdh07gcyp/geoportail/wfs?',
        protocol: 'wfs',
        version: '2.0.0',
        typeName: 'BDTOPO_BDD_WLD_WGS84G:bati_remarquable,BDTOPO_BDD_WLD_WGS84G:bati_indifferencie,BDTOPO_BDD_WLD_WGS84G:bati_industriel',
        projection: 'EPSG:4326',
        ipr: 'IGN',
        format: 'application/json',
        zoom: { min: 5, max: 25 },
        extent: {
            west: 4.568,
            east: 5.18,
            south: 45.437,
            north: 46.03,
        },
    },
});

view.addLayer({
	type: 'color',
	id: 'WMS Pollution Air',
	transparent: false,
	opacity : 0.33,
	source: {
		url: 'http://sig.atmo-auvergnerhonealpes.fr/geoserver/wms',
		networkOptions: { crossOrigin: 'anonymous' },
		protocol: 'wms',
		version: '1.3.0',
		name: 'moyan_no2_2017_3857_aura_gs',
		projection: 'EPSG:3946',
		extent: extent,
		format: 'image/jpeg',
	},
});

var about = new udvcore.AboutWindow({active:true});
var help  = new udvcore.HelpWindow({active:true});

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

for (const layer of view.getLayers()) {
	if (layer.id === 'WFS Bus Lines') {
		layer.whenReady.then( function _(layer) {
			var gui = debug.GeometryDebug.createGeometryDebugUI(datDotGUI, view, layer);
			debug.GeometryDebug.addMaterialLineWidth(gui, view, layer, 1, 10);
		});
	}
	if (layer.id === 'WFS Buildings') {
		layer.whenReady.then( function _(layer) {
			var gui = debug.GeometryDebug.createGeometryDebugUI(datDotGUI, view, layer);
			debug.GeometryDebug.addWireFrameCheckbox(gui, view, layer);
		});
	}

	if (layer.id === 'wms_imagery') {
		layer.whenReady.then( function _(layer) {
			var gui = debug.GeometryDebug.createGeometryDebugUI(datDotGUI, view, layer);
			debug.GeometryDebug.addMaterialLineWidth(gui, view, layer, 1, 10);
		});
	}

	if (layer.id === 'WMS Pollution Air') {
		layer.whenReady.then( function _(layer) {
			var gui = debug.GeometryDebug.createGeometryDebugUI(datDotGUI, view, layer);
			debug.GeometryDebug.addMaterialLineWidth(gui, view, layer, 1, 10);
		});
	}
}

document.addEventListener('keydown', (event) => {
  if (event.key === '1') {
	  //Switch the 3D building Layer visibility
	  for (const layer of view.getLayers()) {
		  if (layer.id === 'WFS Bus Lines') {
			console.log(event.key);
			layer.visible = !layer.visible;
			//Request redraw
			view.notifyChange();
		}
	}
    return;
  }

  if (event.key === '2') {
	  //Switch the BusLine Layer visibility
	  for (const layer of view.getLayers()) {
		  if (layer.id === 'WFS Buildings') {
			  console.log(event.key);
			  layer.visible = !layer.visible;
			//Request redraw
			view.notifyChange();
		}
	}
    return;
  }

  if (event.key === '3') {
	  //Switch the BusLine Layer visibility
	  for (const layer of view.getLayers()) {
		  if (layer.id === 'WMS Pollution Air') {
			  console.log(event.key);
			  layer.visible = !layer.visible;
			//Request redraw
			view.notifyChange();
		}
	}
    return;
  }

  if (event.key === 'a') {
	  //Advanced controller (etiding option)
    if (confirm('Do you want to switch controller option ?\n Current Option '+((useControlsForEditing)? "Edit Setting" : "Regular Setting"))) {
		useControlsForEditing = !useControlsForEditing; //Change Option
    alert((useControlsForEditing)? "Edit Setting" : "Regular Setting");//Inform about new setting
    } else {
    // Do nothing!
    }
  }
  if (event.key === '5') {
	  //Advanced controller (etiding option)
	  console.log(itowns.CameraUtils.getTransformCameraLookingAtTarget(view, view.camera.camera3D));
  }
}, false);
