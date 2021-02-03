import { BaseDemo } from '../../src/Utils/BaseDemo/js/BaseDemo.js';

let baseDemo = new BaseDemo({
    iconFolder: '../data/icons',
    imageFolder: '../data/img',
    logos: ['logo-liris.png','logo-univ-lyon.png']
});

baseDemo.appendTo(document.body);

baseDemo.loadConfigFile('../data/config/generalDemoConfig.json').then(() => {
    baseDemo.addLogos();
    // Initialize iTowns 3D view
    baseDemo.init3DView('lyon_1');
    baseDemo.addBaseMapLayer();
    baseDemo.addElevationLayer();
    const [$3DTilesLayer, $3DTilesManager] = baseDemo.setup3DTilesLayer('lyon2009-2015');
    
    // Set up the temporal module which needs to register events to the 3D 
    // Tiles Layer before it is added to the itowns view
    const temporalModule = new udvcore.TemporalModule($3DTilesManager, baseDemo.config['temporalModule']);
    ///// TEMPORAL MODULE VIEW
    baseDemo.addModuleView('temporal', temporalModule.view, {
        name: 'Temporal Navigation'
    });

    // Add the 3D Tiles layer to itowns view and update the view
    baseDemo.add3DTilesLayer($3DTilesLayer);
    baseDemo.update3DView();

    ////// REQUEST SERVICE
    const requestService = new udvcore.RequestService();

    ////// ABOUT MODULE
    const about = new udvcore.AboutWindow();
    baseDemo.addModuleView('about', about);

    ////// HELP MODULE
    const help  = new udvcore.HelpWindow();
    baseDemo.addModuleView('help', help);

    ////// GEOCODING EXTENSION
    const geocodingService = new udvcore.GeocodingService(requestService,
        baseDemo.extent, baseDemo.config);
    const geocodingView = new udvcore.GeocodingView(geocodingService,
        baseDemo.controls, baseDemo.view);
    baseDemo.addModuleView('geocoding', geocodingView, {binding: 's',
                                name: 'Address Search'});

    ////// CITY OBJECTS MODULE
    const cityObjectModule = new udvcore.CityObjectModule(baseDemo.layerManager, baseDemo.config);
    baseDemo.addModuleView('cityObjects', cityObjectModule.view);

    ////// 3DTILES DEBUG
    const debug3dTilesWindow = new udvcore.Debug3DTilesWindow(baseDemo.layerManager);
    baseDemo.addModuleView('3dtilesDebug', debug3dTilesWindow, {
        name: '3DTiles Debug'
    });
});
