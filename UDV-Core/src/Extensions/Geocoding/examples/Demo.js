let baseDemo = new udvcore.BaseDemo({
    iconFolder: '../../../../examples/data/icons',
    imageFolder: '../../../../examples/data/img'
});

baseDemo.appendTo(document.body);

baseDemo.loadConfigFile('../../../../examples/data/config/generalDemoConfig.json').then(() => {

    // Initialize iTowns 3D view
    baseDemo.init3DView();

    ////// REQUEST SERVICE
    const requestService = new udvcore.RequestService();

    ////// GEOCODING
    const geocodingService = new udvcore.GeocodingService(requestService, baseDemo.extent, baseDemo.config);
    const geocodingView = new udvcore.GeocodingView(geocodingService, baseDemo.controls, baseDemo.view);
    baseDemo.addModuleView('geocoding', geocodingView, {binding: 's', name: 'Address Search'});
});
