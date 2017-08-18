
THREE = itowns.THREE;

var showBuildings = false;

// # Planar (EPSG:3946) viewer

document.getElementById("info").innerHTML = "UDV v0.2";


// Define projection that we will use (taken from https://epsg.io/3946, Proj4js section)
itowns.proj4.defs('EPSG:3946',
'+proj=lcc +lat_1=45.25 +lat_2=46.75 +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');

// Define geographic extent: CRS, min/max X, min/max Y
const extent = new itowns.Extent(
  'EPSG:3946',
  1837816.94334, 1847692.32501,
  5170036.4587, 5178412.82698);

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

  // Create a new Layer 3d-tiles For DiscreteLOD
  // -------------------------------------------
  var $3dTilesLayerDiscreteLOD = new itowns.GeometryLayer('3d-tiles-discrete-lod', view.scene);

  $3dTilesLayerDiscreteLOD.preUpdate = preUpdateGeo;
  $3dTilesLayerDiscreteLOD.update = itowns.process3dTilesNode(
    itowns.$3dTilesCulling,
    itowns.$3dTilesSubdivisionControl
  );
  $3dTilesLayerDiscreteLOD.name = 'DiscreteLOD';
  $3dTilesLayerDiscreteLOD.url = 'http://localhost:9090/getCity?city=lyon';
  $3dTilesLayerDiscreteLOD.protocol = '3d-tiles'
  $3dTilesLayerDiscreteLOD.overrideMaterials = true;  // custom cesium shaders are not functional
  $3dTilesLayerDiscreteLOD.type = 'geometry';
  $3dTilesLayerDiscreteLOD.visible = true;
  $3dTilesLayerDiscreteLOD.lighting = {
    enable: true,
    position: { x: -0.5, y: 0.0, z: 1000.0 }
  };

  if(showBuildings){itowns.View.prototype.addLayer.call(view, $3dTilesLayerDiscreteLOD);}

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
  $3dTilesLayerRequestVolume.overrideMaterials = true;  // custom cesium shaders are not functional
  $3dTilesLayerRequestVolume.type = 'geometry';
  $3dTilesLayerRequestVolume.visible = true;

  if(showBuildings){itowns.View.prototype.addLayer.call(view, $3dTilesLayerRequestVolume);}

  //var light = new THREE.DirectionalLight(0xffffff,0.5);
  //view.scene.add(light);
  var light = new THREE.HemisphereLight( 0x0000ff, 0xff0000, 1 );
  view.scene.add( light );

  var center = extent.center().xyz();
  var offset1 = new THREE.Vector3(1000,1000,200);
  var offset2 = new THREE.Vector3(-3000,-3000,3000);
  var offset3 = new THREE.Vector3(000,000,1000);

  var target = extent.center().xyz().add(offset1);
  var startpos = extent.center().xyz().add(offset2);

  var controls = new CameraController(viewerDiv,view,center,{debug: true});

  var documents = new DocumentsHandler(viewerDiv,view,controls);

  documents.addDocument(
    1,
    'test1.png',
    target,
    new THREE.Vector3(1844789,5173976,628),
    new THREE.Quaternion(0.625,0.105,0.128,0.762),
    'doc 1 data'
  );

  documents.addDocument(
    2,
    'test2.png',
    target.add(new THREE.Vector3(300,000,0)),
    new THREE.Vector3(1844789,5172976,628),
    new THREE.Quaternion(0.625,0.105,0.128,0.762),
    'doc 2 data'
  );

  documents.addDocument(
    3,
    'test3.png',
    target.add(new THREE.Vector3(000,300,0)),
    new THREE.Vector3(1842789,5173976,628),
    new THREE.Quaternion(0.625,0.105,0.128,0.762),
    'doc 3 data'
  );

  //view.addFrameRequester(controls);



  //
  //control.update();
