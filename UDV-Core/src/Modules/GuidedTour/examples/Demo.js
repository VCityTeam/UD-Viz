import { BaseDemo } from '../../../Utils/BaseDemo/js/BaseDemo.js'

let baseDemo = new BaseDemo({
    iconFolder: '../../../../examples/data/icons',
    imageFolder: '../../../../examples/data/img'
});

baseDemo.appendTo(document.body);
baseDemo.loadConfigFile(
    '../../../../examples/data/config/generalDemoConfig.json').then(() => {
    ////// REQUEST SERVICE
    const requestService = new udvcore.RequestService();

    ////// DOCUMENTS MODULE
    const documents = new udvcore.DocumentController(baseDemo.view,
        baseDemo.controls, {temporal: baseDemo.temporal, active: false},
        baseDemo.config);
    //// We coule add it to the view but it is not necessary
    //baseDemo.addModuleView('documents', documents);

    ////// GUIDED TOURS MODULE
    const guidedtour = new udvcore.GuidedTourController(documents);
    baseDemo.addModuleView('guidedTour', guidedtour, {name: 'Guided Tours'});
});