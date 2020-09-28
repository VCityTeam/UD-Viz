
let baseDemo = new udvcore.BaseDemo({
    iconFolder: '../data/icons',
    imageFolder: '../data/img'
});

baseDemo.appendTo(document.body);

baseDemo.loadConfigFile('../data/config/generalDemoConfig.json').then(() => {

    // Initialize iTowns 3D view
    baseDemo.init3DView('lyon_all_districts');
    baseDemo.addLyonWMSLayer();
    const $3DTilesLayer = baseDemo.setup3DTilesLayer('lyon2009-2015');
    // DO SOME TEMPORAL MODULE RELATED STUFF
    baseDemo.add3DTilesLayer($3DTilesLayer);
    baseDemo.update3DView();

    ////// TEMPORAL MODULE
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

    // Select the window type:
    let layerConfig = null;
    switch (baseDemo.config['temporalModule']['view']) {
                case "SLIDERWINDOW" :
                    layerConfig = baseDemo.config['temporalModule']['3DTilesTemporalLayer_withoutVersion'];
                    break;
                case "GRAPHWINDOW" :
                    layerConfig = baseDemo.config['temporalModule']['3DTilesTemporalLayer_withVersion'];
                    break;
        }

    const temporalModule = new udvcore.TemporalModule(layerConfig, baseDemo.view, temporalOptions);
    baseDemo.addModuleView('temporal', temporalModule.temporalWindow, {
        name: 'Temporal Navigation'
    });

    // TODO: alignement des tilesManager entre celui du temporel et celui
    //  de baseDemo. Ceci vient du fait qu'avant il était initialisé par
    //  init3DView ou init4Dview dans baseDemo. Il est par contre utilisé
    //  par plusieurs modules. Pour plus de clarté, faire en sorte qu'il
    //  soit initialisé à un seul endroit canonique et passé aux modules
    //  ensuite. Dépendant de la structuration des modules 3D / 4D.
    baseDemo.tilesManager = temporalModule.tilesManager;

    ////// REQUEST SERVICE
    const requestService = new udvcore.RequestService();

    ////// ABOUT MODULE
    const about = new udvcore.AboutWindow();
    baseDemo.addModuleView('about', about);

    ////// HELP MODULE
    const help  = new udvcore.HelpWindow();
    baseDemo.addModuleView('help', help);

    ////// 3DTILES DEBUG
    const debug3dTilesWindow = new udvcore.Debug3DTilesWindow(baseDemo.tilesManager);
    baseDemo.addModuleView('3dtilesDebug', debug3dTilesWindow, {
        name: '3DTiles Debug'
    });

    ////// GEOCODING EXTENSION
    const geocodingService = new udvcore.GeocodingService(requestService,
        baseDemo.extent, baseDemo.config);
    const geocodingView = new udvcore.GeocodingView(geocodingService,
        baseDemo.controls, baseDemo.view);
    baseDemo.addModuleView('geocoding', geocodingView, {binding: 's',
        name: 'Address Search'});
});
