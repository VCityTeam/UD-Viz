import { BaseDemo } from '../../../Utils/BaseDemo/js/BaseDemo.js'

let baseDemo = new BaseDemo({
    iconFolder: '../../../../examples/data/icons',
    imageFolder: '../../../../examples/data/img'
});

baseDemo.appendTo(document.body);

// Initialize iTowns 3D view
baseDemo.init3DView();

baseDemo.loadConfigFile('../../../../examples/data/config/generalDemoConfig.json').then(() => {
    ////// REQUEST SERVICE
    const requestService = new udvcore.RequestService();

    ////// LINK VISU
    const linkVisualizationService = new udvcore.LinkVisualizationService(requestService, baseDemo.config);
    const linkVisualizationWindow = new udvcore.LinkVisualizationWindow(linkVisualizationService);
    baseDemo.addModuleView('linkVisualization', linkVisualizationWindow);
});
