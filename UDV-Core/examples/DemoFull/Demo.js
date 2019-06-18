import { BaseDemo } from '../../src/Utils/BaseDemo/js/BaseDemo.js'

let baseDemo = new BaseDemo({
    iconFolder: '../data/icons',
    imageFolder: '../data/img'
});

baseDemo.appendTo(document.body);
baseDemo.loadConfigFile('../data/config/generalDemoConfig.json').then(() => {
    ////// REQUEST SERVICE
    const requestService = new udvcore.RequestService();

    ////// ABOUT MODULE
    const about = new udvcore.AboutWindow();
    baseDemo.addModuleView('about', about);

    ////// HELP MODULE
    const help  = new udvcore.HelpWindow();
    baseDemo.addModuleView('help', help);

    ////// MINIMAP MODULE
    const minimap = new udvcore.MiniMapController(baseDemo.controls,
        baseDemo.extent, baseDemo.renderer);

    ////// COMPASS MODULE
    const compass = new udvcore.CompassController(baseDemo.controls);

    ////// DOCUMENTS MODULE
    const documents = new udvcore.DocumentController(baseDemo.view,
        baseDemo.controls, {temporal: baseDemo.temporal, active: false},
        baseDemo.config);
    baseDemo.addModuleView('documents', documents, {
        binding: 'd'
    });

    ////// GUIDED TOURS MODULE
    const guidedtour = new udvcore.GuidedTourController(documents);
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
});