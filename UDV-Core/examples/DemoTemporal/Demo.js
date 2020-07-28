let baseDemo = new udvcore.BaseDemo({
    iconFolder: '../data/icons',
    imageFolder: '../data/img'
});

baseDemo.appendTo(document.body);

baseDemo.loadConfigFile('../data/config/generalDemoConfig.json').then(() => {

    // Initialize iTowns 3D view
    baseDemo.initView();

    ////// TEMPORAL MODULE
    // Might be renamed to 4D module ? Car c'est lui qui déclare le layer 3D
    // Tiles (car tmeporel interdépendant avec la partie 3D). + on devrait
    // créer un module 3D au lieu que l'init soit faite dans baseDemo pour
    // être cohérent. A rediscuter avec EBO sur le role des modules et sur
    // comment organiser ça.
    const temporalOptions = {
        minTime: 2009,
        maxTime: 2015,
        currentTime: 2009,
        timeStep: 1,
        graphOption: baseDemo.config['graphOption'] // la windows est gérer par le module temporel et non par basedemo
    };
    const layerConfig = baseDemo.config['3DTilesTemporalLayer'];
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
