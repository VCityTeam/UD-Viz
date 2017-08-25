
THREE = itowns.THREE;

var showBuildings = true;

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
  $3dTilesLayerRequestVolume.overrideMaterials = false;  // custom cesium shaders are not functional
  $3dTilesLayerRequestVolume.type = 'geometry';
  $3dTilesLayerRequestVolume.visible = true;

  if(showBuildings){itowns.View.prototype.addLayer.call(view, $3dTilesLayerRequestVolume);}

  //var light = new THREE.DirectionalLight(0xffffff,0.5);
  //view.scene.add(light);
  var light = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.75 );
  view.scene.add( light );

  var center = extent.center().xyz();
  var offset1 = new THREE.Vector3(1000,1000,200);
  var offset2 = new THREE.Vector3(-3000,-3000,3000);
  var offset3 = new THREE.Vector3(000,000,1000);

  var target = center.add(offset1);
  var startpos = new THREE.Vector3(1845341,5174897,800);
  var startlook = new THREE.Vector3(1843670,5175604,180);


/*
  var controls = new CameraController(viewerDiv,view,extent,
    {
      debug: true,
      startPos: startpos,
      startLook: startlook
    }
  );
  */

  var controls = new PlanarControls(view, {});

  var documents = new DocumentsHandler(view,controls);

  var temporal = new TemporalController(view,controls,"2017-09-15");

  documents.addDocument(
    1,
    'test1.png',
    target.add(new THREE.Vector3(200,-200,0)),
    new THREE.Vector3(1844763,5174252,620),
    new THREE.Quaternion(0.6081,0.10868,0.13836,0.77414),
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

  documents.addDocument(
    4,
    'test4.png',
    target.add(new THREE.Vector3(-600,-300,0)),
    new THREE.Vector3(1844018,5175759,1908),
    new THREE.Quaternion(0.000,0.0000,0.0800,1.0),
    'doc 4 data'
  );

  //view.addFrameRequester(controls);



  document.getElementById("guidedTourText").innerHTML = "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis augue velit, egestas eu posuere faucibus, aliquet sed eros. Donec vel dictum lorem. Sed sed commodo turpis.Vestibulum ornare sapien et purus sollicitudin egestas. Nunc rutrum ac dolor eu imperdiet. Cras lacinia, odio sitamet scelerisque porttitor, nisi mi pharetra tellus, non sagittis est lorem finibus nisi. Aliquam sed dolor quis esttempus finibus quis uturna.Aeneacommodoat sapien quis eleifend. Sed blandit nisi eu nisl dapibus, in efficitur mauris accumsan. Suspendisse potenti. Aenean lacus ex, aliquet at mauris a, vulputate tincidunt nibh. Interdum et malesuada fames ac ante ipsum primis in faucibus. Sed ut massa sed nibh mollis scelerisque.</p>";
  document.getElementById("docBrowserText").innerHTML = "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis augue velit, egestas eu posuere faucibus, aliquet sed eros. Donec vel dictum lorem. Sed sed commodo turpis.Vestibulum ornare sapien et purus sollicitudin egestas. Nunc rutrum ac dolor eu imperdiet. Cras lacinia, odio sitamet scelerisque porttitor, nisi mi pharetra tellus, non sagittis est lorem finibus nisi. Aliquam sed dolor quis esttempus finibus quis uturna.Aeneacommodoat sapien quis eleifend. Sed blandit nisi eu nisl dapibus, in efficitur mauris accumsan. Suspendisse potenti. Aenean lacus ex, aliquet at mauris a, vulputate tincidunt nibh. Interdum et malesuada fames ac ante ipsum primis in faucibus. Sed ut massa sed nibh mollis scelerisque.</p>";


  //
  //control.update();
