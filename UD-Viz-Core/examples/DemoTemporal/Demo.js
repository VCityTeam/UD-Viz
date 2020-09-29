import { BaseDemo } from '../../src/Utils/BaseDemo/js/BaseDemo.js';

let baseDemo = new BaseDemo({
    iconFolder: '../data/icons',
    imageFolder: '../data/img',
});

baseDemo.appendTo(document.body);

baseDemo.loadConfigFile('../data/config/generalDemoConfig.json').then(() => {

    // Initialize iTowns 3D view
    baseDemo.init3DView('lyon_all_districts');
    baseDemo.addLyonWMSLayer();
    const [$3DTilesLayer, $3DTilesManager] = baseDemo.setup3DTilesLayer('lyon2009-2015');
    
    // Set up the temporal module which needs to register events to the 3D 
    // Tiles Layer before it is added to the itowns view
    // Passer "baseDemo.config["temporalModule"]" plutot
    const temporalOptions = {
        minTime: baseDemo.config['temporalModule'].minTime,
        maxTime: baseDemo.config['temporalModule'].maxTime,
        currentTime: baseDemo.config['temporalModule'].currentTime,
        timeStep: baseDemo.config['temporalModule'].timeStep,
        temporalWindow : {
            name: baseDemo.config['temporalModule']['view'],
            option: baseDemo.config['temporalModule']['graphOption'], // the window is encapsulate by TemporalModule so we need to pass by it for the graphic options
            getAsynchronousData: null
        }
    };
    
    const temporalModule = new udvcore.TemporalModule($3DTilesLayer, $3DTilesManager, temporalOptions);

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

    ///// TEMPORAL MODULE VIEW
    baseDemo.addModuleView('temporal', temporalModule.temporalWindow, {
        name: 'Temporal Navigation'
    });

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
