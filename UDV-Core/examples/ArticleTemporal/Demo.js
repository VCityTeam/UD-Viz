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
    };
    const layerConfig = baseDemo.config['3DTilesTemporalLayer']['SmallTiles'];
    // const layerConfig = baseDemo.config['3DTilesTemporalLayer']['BigTiles'];
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
});
