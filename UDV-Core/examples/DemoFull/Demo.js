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

    ////// DOCUMENTS MODULE
    const documents = new udvcore.DocumentController(baseDemo.view,
        baseDemo.controls, {temporal: baseDemo.temporal, active: false},
        baseDemo.config, requestService);
    baseDemo.addModuleView('documents', documents, {
        binding: 'd'
    });

    ////// GUIDED TOURS MODULE
    const guidedtour = new udvcore.GuidedTourController(documents,
        requestService);
    baseDemo.addModuleView('guidedTour', guidedtour, {name: 'Guided tours'});

    ////// CONTRIBUTE EXTENSION
    const contributeController = new udvcore.ContributeController(documents,
        requestService);

    ////// AUTHENTICATION MODULE
    const authenticationService =
        new udvcore.AuthenticationService(requestService, baseDemo.config);
    const authenticationView =
        new udvcore.AuthenticationView(authenticationService);
    baseDemo.addModuleView('authentication', authenticationView,
        {type: BaseDemo.AUTHENTICATION_MODULE});

    ////// DOCUMENTS TO VALIDATE
    const docToValidateService =
        new udvcore.DocToValidateService(requestService, baseDemo.config);
    const docToValidateView =
        new udvcore.DocToValidateView(docToValidateService, documents);
    baseDemo.addModuleView('docToValidate', docToValidateView,
        {name: 'Documents in validation', requireAuth: true, binding: 'v'});

    ////// DOCUMENTS COMMENTS EXTENSION
    const docCommentsService = new udvcore.DocumentCommentsService(documents,
        requestService, baseDemo.config);
    const docCommentsWindow = new udvcore.DocumentCommentsWindow(documents,
        docCommentsService);

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

    ////// DOCUMENT LINK EXTENSION
    const linkService = new udvcore.LinkService(requestService, baseDemo.config);
    const documentLinkWindow = new udvcore.DocumentLinkWindow(
        linkService, documents, baseDemo.view, baseDemo.controls);
});
