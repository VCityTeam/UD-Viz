//************ Create globeView
    // Define the coordinates on wich the globe will be centered at the initialization
    var positionOnGlobe = {  longitude: 4.818, latitude: 45.7354, altitude: 3000 };
    var promises = [];
    
    var renderer;
    var exports = {};
            
    // `viewerDiv` will contain iTowns' rendering area (`<canvas>`)
    var viewerDiv = document.getElementById('viewerDiv');

    // Instanciate iTowns GlobeView*
    var globeView = new itowns.GlobeView(viewerDiv, positionOnGlobe, { renderer: renderer });
    // Add Imagery layer
    function addLayerToGlobe(layer) {
        return globeView.addLayer(layer);
    }
    
    
    //Definition of proj4 used by Itowns
    itowns.proj4.defs('EPSG:3946',
        '+proj=lcc +lat_1=45.25 +lat_2=46.75 +lat_0=46 +lon_0=3 +x_0=1700000 +y_0=5200000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
    itowns.proj4.defs('EPSG:2154',
                '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');

    // Add mesh to scene
    //Camera = longitude : 4.22, latitude : 44.844, altitude : 4000
    function addMeshToScene() {
    var geometry = new THREE.CylinderGeometry(0, 10, 60, 8);
    var material = new THREE.MeshBasicMaterial({ color: 0xff0000});
    var mesh = new THREE.Mesh(geometry, material);
    
    // get the position on the globe, from the camera target
    var cameraTargetPosition = globeView.controls.getCameraTargetGeoPosition();

    // position of the mesh
    var meshCoord = cameraTargetPosition;
    meshCoord.setAltitude(cameraTargetPosition.altitude() + 30);
    
    mesh.position.copy(meshCoord.as(globeView.referenceCrs).xyz());
    
     mesh.lookAt(new THREE.Vector3(0, 0, 0));
     mesh.rotateX(Math.PI / 2);
    
    // update coordinates of the mesh
    mesh.updateMatrixWorld();
    
    // add the mesh to the scene
    globeView.scene.add(mesh);
    }
        
        /* Other Exemple (Imagery Layer)

        var layer2 = {    update: itowns.updateLayeredMaterialNodeImagery,
        type: 'color',
        protocol: "wmtsc",
        id: "DARK",
        customUrl: "http://a.basemaps.cartocdn.com/light_all/%TILEMATRIX/%COL/%ROW.png",
        networkOptions: { crossOrigin: 'anonymous' },
        options: {
            attribution: {
                "name":"CARTO",
                "url": "https://carto.com/"
            },
            tileMatrixSet: "PM",
            mimetype: "image/png"
        },
    }

    globeView.addLayer(layer2);
    */
    
   //Add elements into promises
    promises.push(itowns.Fetcher.json('../examples/layers/JSONLayers/Ortho.json').then(addLayerToGlobe));
    promises.push(itowns.Fetcher.json('../examples/layers/JSONLayers/WORLD_DTM.json').then(addLayerToGlobe));
    promises.push(itowns.Fetcher.json('../examples/layers/JSONLayers/IGN_MNT_HIGHRES.json').then(addLayerToGlobe));
    
    /*/Données gpx
    promises.push(globeView.addLayer({
        type: 'color',
        url: 'https://raw.githubusercontent.com/iTowns/iTowns2-sample-data/master/ULTRA2009.gpx',
        protocol: 'rasterizer',
        id: 'Gpx',
    }));
    
    //Layer Geojson
    promises.push(globeView.addLayer({
        type: 'color',
        url: 'https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements/09-ariege/departement-09-ariege.geojson',
        protocol: 'rasterizer',
        id: 'ariege',
        style: {
            fill: 'orange',
            fillOpacity: 0.5,
            stroke: 'white',
        },
    }));
	*/
	promises.push(globeView.addLayer({
        type: 'color',
        url: 'https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements/09-ariege/departement-09-ariege.geojson',
        protocol: 'rasterizer',
        id: 'ariege',
        style: {
            fill: 'orange',
            fillOpacity: 0.5,
            stroke: 'white',
        },
    }));
    promises.push(globeView.addLayer({
        type: 'color',
        url: 'https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements/09-ariege/departement-09-ariege.geojson',
        protocol: 'rasterizer',
        id: 'ariege_red',
        style: {
            fill: 'red',
            fillOpacity: 0.5,
            stroke: 'white',
        },
    }));
    
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
     promises.push(globeView.addLayer({
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
    }, globeView.tileLayer));
    
    //********* Add vector Data
    //Check Camera  longitude : 3.5, latitude : 44, altitude : 1000000
    globeView.addLayer({
        type: 'color',
        url: 'https://raw.githubusercontent.com/iTowns/iTowns2-sample-data/master/croquis.kml',
        protocol: 'rasterizer',
        id: 'Kml',
    });

        
//Adding Menu to Application
	exports.view = globeView;
	exports.initialPosition = positionOnGlobe;
	
    var menuGlobe = new GuiTools('menuDiv');
    menuGlobe.view = globeView;

// Listen for globe full initialisation event
    globeView.addEventListener(itowns.GLOBE_VIEW_EVENTS.GLOBE_INITIALIZED, function () {
        console.info('Globe initialized');
        Promise.all(promises).then(function () {
			menuGlobe.addImageryLayersGUI(globeView.getLayers(function (l) { return l.type === 'color'; }));
			// Only First layer add into menuGlobe
			
            itowns.ColorLayersOrdering.moveLayerToIndex(globeView, 'Ortho', 0);
            //addMeshToScene();
            //globeView.controls.setTilt(60, true);
        });		 
    });
     
    //TEST

