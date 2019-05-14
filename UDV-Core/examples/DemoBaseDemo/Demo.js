import { BaseDemo } from '../../src/Utils/BaseDemo/js/BaseDemo.js'

let baseDemo = new BaseDemo();

const requestService = new udvcore.RequestService();

baseDemo.appendTo(document.body);
baseDemo.loadConfigFile('./Config.json').then(() => { 
    ////// ABOUT MODULE
    const about = new udvcore.AboutWindow();
    baseDemo.addModule('About', 'about', about);

    ////// HELP MODULE
    const help  = new udvcore.HelpWindow();
    baseDemo.addModule('Help', 'help', help);

    ////// MINIMAP MODULE
    const minimap = new udvcore.MiniMapController(baseDemo.controls, baseDemo.extent, baseDemo.renderer);

    ////// COMPASS MODULE
    const compass = new udvcore.CompassController(baseDemo.controls);

    ////// DOCUMENTS MODULE
    const documents = new udvcore.DocumentController(baseDemo.view, baseDemo.controls, {temporal: baseDemo.temporal, active: false}, baseDemo.config);
    baseDemo.addModule('Documents', 'documents', documents);

    ////// GUIDED TOURS MODULE
    const guidedtour = new udvcore.GuidedTourController(documents);
    baseDemo.addModule('Guided Tours', 'guidedTours', guidedtour);

    ////// CONTRIBUTE EXTENSION
    const contributeController = new udvcore.ContributeController(documents, requestService);

    ////// AUTHENTICATION MODULE
    const authenticationService = new udvcore.AuthenticationService(requestService, baseDemo.config);
    const authenticationView= new udvcore.LoginRegistrationWindow(authenticationService);
    baseDemo.addModule('Authentication', 'authentication', authenticationView, BaseDemo.AUTHENTICATION_MODULE);

    ////// DOCUMENTS TO VALIDATE
    const docToValidateService = new udvcore.DocToValidateService(requestService, baseDemo.config);
    const docToValidateView = new udvcore.DocToValidateView(docToValidateService, documents);
    baseDemo.addModule('Documents in Validation', 'docToValidate', docToValidateView);

    ////// DOCUMENTS COMMENTS EXTENSION
    const docCommentsService = new udvcore.DocumentCommentsService(documents, requestService, baseDemo.config);
    const docCommentsWindow = new udvcore.DocumentCommentsWindow(documents, docCommentsService);
});