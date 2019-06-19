import { BaseDemo } from '../../../Utils/BaseDemo/js/BaseDemo.js'

let baseDemo = new BaseDemo({
    iconFolder: '../../../../examples/data/icons',
    imageFolder: '../../../../examples/data/img'
});

baseDemo.appendTo(document.body);

// Initialize iTowns 3D view
baseDemo.init3DView();

baseDemo.loadConfigFile(
    '../../../../examples/data/config/generalDemoConfig.json').then(() => {
    ////// REQUEST SERVICE
    const requestService = new udvcore.RequestService();

    ////// DOCUMENTS MODULE
    const documents = new udvcore.DocumentController(baseDemo.view,
        baseDemo.controls, {temporal: baseDemo.temporal, active: false},
        baseDemo.config);
    baseDemo.addModuleView('documents', documents);
});
