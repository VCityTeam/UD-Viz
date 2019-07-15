let baseDemo = new udvcore.BaseDemo({
    iconFolder: '../data/icons',
    imageFolder: '../data/img'
});

baseDemo.appendTo(document.body);

baseDemo.loadConfigFile('../data/config/generalDemoConfig.json').then(() => {

    // Initialize iTowns 3D view
    const initTime = 2009;
    baseDemo.init4DView(initTime);

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

    ////// TEMPORAL MODULE
    function updateLayerCurrentTime(newDate) {
        const numberDate = Number(newDate);
        const $3DTilesTemporalLayer = this.view.getLayerById(this.config['3DTilesTemporalLayerID']);
        $3DTilesTemporalLayer.currentTime = numberDate;
        this.view.notifyChange($3DTilesTemporalLayer);
    }

    const temporalCallback = updateLayerCurrentTime.bind(baseDemo);

    const temporalOptions = {
        minTime: 2009,
        maxTime: 2015,
        currentTime: initTime,
        timeStep: 1
    };
    const temporal = new udvcore.TemporalWindow(temporalCallback, temporalOptions);
    baseDemo.addModuleView('temporal', temporal, {
        name: 'Temporal Navigation'
    });

    ////// GEOCODING EXTENSION
    const geocodingService = new udvcore.GeocodingService(requestService,
        baseDemo.extent, baseDemo.config);
    const geocodingView = new udvcore.GeocodingView(geocodingService,
        baseDemo.controls, baseDemo.view);
    baseDemo.addModuleView('geocoding', geocodingView, {binding: 's',
        name: 'Address Search'});
});
