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
    baseDemo.add3DTilesLayer('building');
    baseDemo.update3DView();

    ////// REQUEST SERVICE
    const requestService = new udvcore.RequestService();

    ////// DOCUMENTS MODULE
    const documentModule = new udvcore.DocumentModule(requestService,
        baseDemo.config)
    baseDemo.addModuleView('documents', documentModule.view);

    ////// DOCUMENTS VISUALIZER (to orient the document)
    const imageOrienter = new udvcore.DocumentVisualizerWindow(documentModule,
        baseDemo.view, baseDemo.controls);

    ////// GUIDED TOURS MODULE
    const guidedtour = new udvcore.GuidedTourController(documentModule,
        requestService, baseDemo.config);
    baseDemo.addModuleView('guidedTour', guidedtour, {name: 'Guided Tours'});
});
