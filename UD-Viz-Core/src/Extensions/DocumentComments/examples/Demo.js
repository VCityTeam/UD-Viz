import { BaseDemo } from '../../../Utils/BaseDemo/js/BaseDemo.js'

let baseDemo = new BaseDemo({
    iconFolder: '../../../../examples/data/icons',
    imageFolder: '../../../../examples/data/img'
});

baseDemo.appendTo(document.body);

baseDemo.loadConfigFile(
    '../../../../examples/data/config/generalDemoConfig.json').then(() => {

    // Initialize iTowns 3D view
    baseDemo.init3DView('lyon_villeurbanne_bron');
    baseDemo.addLyonWMSLayer();
    baseDemo.setupAndAdd3DTilesLayer('building');
    baseDemo.update3DView();

    ////// REQUEST SERVICE
    const requestService = new udvcore.RequestService();

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

    ////// DOCUMENT COMMENTS
    const documentComments = new udvcore.DocumentCommentsModule(documentModule,
        requestService, baseDemo.config);
});
