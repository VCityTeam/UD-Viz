import { BaseDemo } from '../../src/Utils/BaseDemo/js/BaseDemo.js';

let baseDemo = new BaseDemo({
    iconFolder: '../data/icons',
    imageFolder: './img',
    logos: ['logo-univ-lyon.png','logo-liris.png','logo-grand-lyon.png']
});

baseDemo.appendTo(document.body);

baseDemo.loadConfigFile('./DemoConfigData.json').then(() => {
    // Initialize iTowns 3D view
    baseDemo.addLogos();
    baseDemo.init3DView('lyon_part_dieu');
    baseDemo.addBaseMapLayer();
    baseDemo.addElevationLayer();
    baseDemo.setupAndAdd3DTilesLayer('building');

    let wmsPolutedGroundSource = new itowns.WMSSource({
        extent: baseDemo.extent,
        name: 'SSP_CLASSIFICATION',
        url: ' https://www.georisques.gouv.fr/services',
        version: '1.3.0',
        projection: 'EPSG:4326',
        format: 'image/png',
    });

    let wmsPolutedGroundLayer = new itowns.ColorLayer('wms_Ground_Polution', {
        updateStrategy: {
            type: itowns.STRATEGY_DICHOTOMY,
            options: {},
            altitude: 1,

        },
        source: wmsPolutedGroundSource,
    });

    baseDemo.view.addLayer(wmsPolutedGroundLayer);

    var color = new itowns.THREE.Color();

    function colorLineRoads() {
        return color.set(0xffff00);
    }

    function colorLineRails() {
        return color.set(0xff0000);
    }

    function colorEVAArtif(properties) {
        return color.set(0x0000ff);
    }

    function colorEVAVegetation(properties) {
        if (properties.strate == 1 ) 
        {
            return color.set(0x005500);
        }
        else
        if(properties.strate == 2 )
        {
            return color.set(0x00b000);
        }
        else
        return color.set(0x00ff00);
    }

    function colorSurfaceBatiments() {
        return color.set(0x00ffff);
    }

    ////---DataGrandLyon Layers---////

    var BatimentsSource = new itowns.WFSSource({
        url: 'https://download.data.grandlyon.com/wfs/grandlyon?',
        protocol: 'wfs',
        version: '2.0.0',
        id: 'batiments',
        typeName: 'cad_cadastre.cadbatiment',
        projection: 'EPSG:3946',
        extent: baseDemo.extent,
        format: 'geojson',
    });
    
    var BatimentsLayer = new itowns.GeometryLayer('Batiments', new itowns.THREE.Group(), {
        update: itowns.FeatureProcessing.update,
        convert: itowns.Feature2Mesh.convert({
            altitude: 170.1,
            color: colorSurfaceBatiments,
        }),
        source: BatimentsSource,
    });

    baseDemo.view.addLayer(BatimentsLayer);
 
    ////---GeoServer layers---////

    let wfsRoadsSource = new itowns.WFSSource({
        url: 'http://localhost:8080/geoserver/cite/ows?',
        protocol: 'wfs',
        version: '1.0.0',
        id: 'Roads',
        typeName: 'cite:Voirie',
        projection: 'EPSG:3946',
        extent: baseDemo.extent,
        format: 'application/json',
    });

    var wfsRoadsLayer = new itowns.GeometryLayer('Chaussee_Trottoirs', new itowns.THREE.Group(), {
        update: itowns.FeatureProcessing.update,
        convert: itowns.Feature2Mesh.convert(
            {
                altitude : 170.1,
                color: colorLineRoads,
            }
        ),
        source: wfsRoadsSource,
    });

    baseDemo.view.addLayer(wfsRoadsLayer);

    let wfsRailsSource = new itowns.WFSSource({
        url: 'http://localhost:8080/geoserver/cite/ows?',
        protocol: 'wfs',
        version: '1.0.0',
        id: 'Rails',
        typeName: '	cite:Voies_Ferrees',
        projection: 'EPSG:3946',
        extent: baseDemo.extent,
        format: 'application/json',
    });

    var wfsRailsLayer = new itowns.GeometryLayer('Voies_Ferrées', new itowns.THREE.Group(), {
        update: itowns.FeatureProcessing.update,
        convert: itowns.Feature2Mesh.convert(
            {
                altitude : 170.4,
                color: colorLineRails,
            }
        ),
        source: wfsRailsSource,
    });

    baseDemo.view.addLayer(wfsRailsLayer);

    let wfsEVA_STRSource = new itowns.WFSSource({
        url: 'http://localhost:8080/geoserver/cite/ows?',
        protocol: 'wfs',
        version: '1.0.0',
        id: 'wfs_EVA_STR',
        typeName: '	cite:EVA2015_Vegetation',
        projection: 'EPSG:3946',
        extent: baseDemo.extent,
        format: 'application/json',
    });

    var wfsEVA_STRLayer = new itowns.GeometryLayer('EVA_Vegetation', new itowns.THREE.Group(), {
        update: itowns.FeatureProcessing.update,
        convert: itowns.Feature2Mesh.convert(
            {
                altitude : 170.2,
                color: colorEVAVegetation,
            }
        ),
        source: wfsEVA_STRSource,
    });

    baseDemo.view.addLayer(wfsEVA_STRLayer);
    
    let wfsEVA_ArtifSource = new itowns.WFSSource({
        url: 'http://localhost:8080/geoserver/cite/ows?',
        protocol: 'wfs',
        version: '1.0.0',
        id: 'wfs_EVA_Artif',
        typeName: '	cite:EVA2015_Artif_Sols',
        projection: 'EPSG:3946',
        extent: baseDemo.extent,
        format: 'application/json',
    });

    var wfsEVA_ArtifLayer = new itowns.GeometryLayer('EVA_Artif_Sols_Nus', new itowns.THREE.Group(), {
        update: itowns.FeatureProcessing.update,
        convert: itowns.Feature2Mesh.convert(
            {
                altitude : 170,
                color: colorEVAArtif,
            }
        ),
        source: wfsEVA_ArtifSource,
    });

    baseDemo.view.addLayer(wfsEVA_ArtifLayer);

    ////---Masks---////
    let wfsMaskASource = new itowns.WFSSource({
        url: 'http://localhost:8080/geoserver/cite/ows?',
        protocol: 'wfs',
        version: '1.0.0',
        id: 'MaskA',
        typeName: 'cite:A=Difference_EVA_Artificialise-Routes',
        projection: 'EPSG:3946',
        extent: baseDemo.extent,
        format: 'application/json',
    });

    var wfsMaskALayer = new itowns.GeometryLayer('MaskA', new itowns.THREE.Group(), {
        update: itowns.FeatureProcessing.update,
        convert: itowns.Feature2Mesh.convert(
            {
                altitude : 170,
                color: colorEVAArtif,
            }
        ),
        source: wfsMaskASource,
    });

    baseDemo.view.addLayer(wfsMaskALayer);

    let wfsMaskBSource = new itowns.WFSSource({
        url: 'http://localhost:8080/geoserver/cite/ows?',
        protocol: 'wfs',
        version: '1.0.0',
        id: 'MaskB',
        typeName: 'cite:B=A-Voies_ferree',
        projection: 'EPSG:3946',
        extent: baseDemo.extent,
        format: 'application/json',
    });

    var wfsMaskBLayer = new itowns.GeometryLayer('MaskB', new itowns.THREE.Group(), {
        update: itowns.FeatureProcessing.update,
        convert: itowns.Feature2Mesh.convert(
            {
                altitude : 170,
                color: colorEVAArtif,
            }
        ),
        source: wfsMaskBSource,
    });

    baseDemo.view.addLayer(wfsMaskBLayer);

    let wfsMaskCSource = new itowns.WFSSource({
        url: 'http://localhost:8080/geoserver/cite/ows?',
        protocol: 'wfs',
        version: '1.0.0',
        id: 'MaskC',
        typeName: 'cite:C=B-Batiments',
        projection: 'EPSG:3946',
        extent: baseDemo.extent,
        format: 'application/json',
    });

    var wfsMaskCLayer = new itowns.GeometryLayer('MaskC', new itowns.THREE.Group(), {
        update: itowns.FeatureProcessing.update,
        convert: itowns.Feature2Mesh.convert(
            {
                altitude : 170,
                color: colorEVAArtif,
            }
        ),
        source: wfsMaskCSource,
    });

    baseDemo.view.addLayer(wfsMaskCLayer);


    baseDemo.update3DView();

    ////// REQUEST SERVICE
    const requestService = new udvcore.RequestService();

    ////// ABOUT MODULE
    const about = new udvcore.AboutWindow();
    baseDemo.addModuleView('about', about);

    ////// HELP MODULE
    const help  = new udvcore.HelpWindow();
    baseDemo.addModuleView('help', help);

    baseDemo.config.server = baseDemo.config.servers["lyon"];   

    ////// CAMERA POSITIONER
    const cameraPosition = new udvcore.CameraPositionerView(baseDemo.view,
        baseDemo.controls);
    baseDemo.addModuleView('cameraPositioner', cameraPosition);

    ////// LAYER CHOICE
    const layerChoice = new udvcore.LayerChoice(baseDemo.layerManager);
    baseDemo.addModuleView('layerChoice', layerChoice, {
        name: 'layerChoice'
    });
});
