// This code is inspired from iTowns exemple : WFS data with reprojection
// Which is available from this link.
// http://www.itowns-project.org/itowns/examples/wfs.html

var extent;
var viewerDiv;
var view;
var meshes;
var p;

//Both Projection and Extent used to generate the map required Itwons
//There is an issue when proj4 is import whitout itwons
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
  disableSkirt: true,
};

// Instanciate PlanarView*
view = new itowns.PlanarView(viewerDiv, extent, config);

var renderer = view.scene;

// Camera setting
const optionsRegularMode = {
  maxAltitude : 15000,
  rotateSpeed : 3.0,
  zoomInFactor : 0.03,
  zoomOutFactor : 0.03,
  maxZenithAngle : 90,
  minZenithAngle : 0,
};
//option to assist the calibration
const optionsEditMode= {
  maxAltitude : 5000,
  rotateSpeed : 1.5,
  zoomInFactor : 0.015,
  zoomOutFactor : 0.015,
  maxPanSpeed : 2.5,
  minPanSpeed : 0.005,
  maxZenithAngle : 0.001,
  minZenithAngle : 0,
};

// If True then the setting are adapt to calibration
var useControlsForEditing = true;

var controls = new itowns.PlanarControls(view, (useControlsForEditing)? optionsEditMode : optionsRegularMode);

p = { coord: new itowns.Coordinates('EPSG:3946', 1840839, 5172718, 0), heading: 0, range: 2845, tilt: 90 };
itowns.CameraUtils.transformCameraToLookAtTarget(view, view.camera.camera3D, p);

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

//Add a WMS imagery layer represent the air pollution
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
  }),
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
    zoom: { min: 2, max: 5 },
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
    zoom: { min: 2, max: 5 },
    extent: {
      west: 4.568,
      east: 5.18,
      south: 45.437,
      north: 46.03,
    },
  },
});

// UI required Udvcore, on this exemple only to cast subwindow, however it should be used to make a time cortroller
// An html container is required in order to control the placement of the
// dat.GUI object within the page.

var datDotGUIDiv = document.createElement("div");
datDotGUIDiv.id = 'datDotGUIDiv';
document.body.appendChild(datDotGUIDiv);

// Associate the stylesheet for layout configuration
var link = document.createElement('link');
link.setAttribute('rel', 'stylesheet');
link.setAttribute('type', 'text/css');
link.setAttribute('href', './MAM.css');
document.getElementsByTagName('head')[0].appendChild(link);

// Proceed with the creation of the dat.GUI with the above positionning
var datDotGUI = new dat.GUI({ autoPlace: false });
datDotGUI.domElement.id = 'datDotGUI';
var datDotGUIContainer = document.getElementById('datDotGUIDiv');
datDotGUIContainer.appendChild( datDotGUI.domElement );

//

for (const layer of view.getLayers()) {
  if (layer.id != "planar"){
    layer.whenReady.then( function _(layer) {
      var gui = datDotGUI.add( layer, 'visible').name( layer.id).listen();
      gui.onFinishChange( function(value) {

        layer.visible = value;

        //WMS Pollution Air isn't an opaque layer, it's opacity is linked to WMS Image
        for (const l of view.getLayers()) {
          if (l.id === 'WMS Pollution Air' && layer.id === 'WMS Image') {
            if (layer.visible){
              l.opacity = 0.33;
            }else{
              l.opacity = 0.66;
            }
          }
        }

        //Actualize the view with or without the layer
        view.notifyChange(layer);
      });
    });
  }
}

// Keyboard Controller
document.addEventListener('keydown', (event) => {
  if (event.key === '1') {
  //Switch the BusLine Layer visibility
    for (const layer of view.getLayers()) {
      if (layer.id === 'WFS Bus Lines') {
        layer.visible = !layer.visible;
        //Request redraw
        view.notifyChange(layer);
      }
    }
    return;
  }

  if (event.key === '2') {
    //Switch the 3D building Layer visibility
    for (const layer of view.getLayers()) {
      if (layer.id === 'WFS Buildings') {
        layer.visible = !layer.visible;
        //Request redraw
        view.notifyChange(layer);
      }
    }
    return;
  }

  if (event.key === '3') {
    //Switch the Pollution Air Layer visibility
    for (const layer of view.getLayers()) {
      if (layer.id === 'WMS Pollution Air') {
        layer.visible = !layer.visible;
        //Request redraw
        view.notifyChange(layer);
      }
    }
    return;
  }

  if (event.key === '4') {
    //Switch the Pollution Air Layer visibility
    for (const layer of view.getLayers()) {
      if (layer.id === 'WMS Image') {
        layer.visible = !layer.visible;
        for (const l of view.getLayers()) {
          if (l.id === 'WMS Pollution Air') {
            if (layer.visible){
              l.opacity = 0.33;
            }else{
              l.opacity = 0.66;
            }
          }
        }
        //Request redraw
        view.notifyChange(layer);
      }
    }
    return;
  }

  }
  if (event.key ==='a'){
    //currentCoordinate
    view.camera.camera3D.position.set(1841655.7645,5172858.86615,2718.8415);
    view.camera.camera3D.quaternion.set(0,0,-0.8630883,0.5050519);
  }
}, false);
