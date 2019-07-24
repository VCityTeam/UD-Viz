import { BaseDemo } from '../../src/Utils/BaseDemo/js/BaseDemo.js'

let baseDemo = new BaseDemo({
    iconFolder: '../data/icons',
    imageFolder: '../data/img'
});

baseDemo.appendTo(document.body);

baseDemo.loadConfigFile('../data/config/generalDemoConfig.json').then(() => {

    // Initialize iTowns 3D view
    baseDemo.init3DView();
    
    ////// REQUEST SERVICE
    const requestService = new udvcore.RequestService();

    ////// ABOUT MODULE
    const about = new udvcore.AboutWindow();
    baseDemo.addModuleView('about', about);

    ////// HELP MODULE
    const help  = new udvcore.HelpWindow();
    baseDemo.addModuleView('help', help);

    ////// AUTHENTICATION MODULE
    const authenticationService =
        new udvcore.AuthenticationService(requestService, baseDemo.config);
    const authenticationView =
        new udvcore.AuthenticationView(authenticationService);
    baseDemo.addModuleView('authentication', authenticationView,
        {type: BaseDemo.AUTHENTICATION_MODULE});

    ////// DOCUMENTS MODULE
    const documentModule = new udvcore.DocumentModule(requestService,
        baseDemo.config)
    baseDemo.addModuleView('documents', documentModule.view);

    ////// DOCUMENTS VISUALIZER (to orient the document)
    const imageOrienter = new udvcore.DocumentVisualizerWindow(documentModule,
        baseDemo.view, baseDemo.controls);

    ////// CONTRIBUTE EXTENSION
    const contribute = new udvcore.ContributeModule(documentModule, imageOrienter,
        requestService, baseDemo.view, baseDemo.controls, baseDemo.config);

    ////// VALIDATION EXTENSION
    const validation = new udvcore.DocumentValidationModule(documentModule, requestService,
        baseDemo.config);

    ////// LINKS MODULES
    const linkModule = new udvcore.LinkModule(documentModule, requestService,
        baseDemo.tilesManager, baseDemo.view, baseDemo.controls,
        baseDemo.config);
    
    ////// DOCUMENT COMMENTS
    const documentComments = new udvcore.DocumentCommentsModule(documentModule,
        requestService, baseDemo.config);

    ////// GUIDED TOURS MODULE
    const guidedtour = new udvcore.GuidedTourController(documentModule,
        requestService, baseDemo.config);
    baseDemo.addModuleView('guidedTour', guidedtour, {name: 'Guided Tours'});

    ////// GEOCODING EXTENSION
    const geocodingService = new udvcore.GeocodingService(requestService,
        baseDemo.extent, baseDemo.config);
    const geocodingView = new udvcore.GeocodingView(geocodingService,
        baseDemo.controls, baseDemo.view);
    baseDemo.addModuleView('geocoding', geocodingView, {binding: 's',
                                name: 'Address Search'});

    ////// 3DTILES DEBUG
    const debug3dTilesWindow = new udvcore.Debug3DTilesWindow(baseDemo.tilesManager);
    baseDemo.addModuleView('3dtilesDebug', debug3dTilesWindow, {
        name: '3DTiles Debug'
    });

    ////// CAMERA POSITIONER
    const cameraPosition = new udvcore.CameraPositionerView(baseDemo.view,
        baseDemo.controls);
    baseDemo.addModuleView('cameraPositioner', cameraPosition);
});
