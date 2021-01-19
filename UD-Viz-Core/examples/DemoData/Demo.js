import { BaseDemo } from '../../src/Utils/DataViewer/js/BaseDemo.js';

let baseDemo = new BaseDemo({
    iconFolder: '../data/icons',
    imageFolder: '../data/img',
});

baseDemo.appendTo(document.body);

baseDemo.loadConfigFile('./DemoConfigData.json').then(() => {
    // Initialize iTowns 3D view
    baseDemo.init3DView('lyon_part_dieu');
    baseDemo.addLyonWMSLayer();
    baseDemo.addLyonImageryLayers();
    baseDemo.addLyonGeometryLayers();
    baseDemo.setupAndAdd3DTilesLayer('building');
    baseDemo.update3DView();

    ////// REQUEST SERVICE
    const requestService = new udvcore.RequestService();

    ////// ABOUT MODULE
    const about = new udvcore.AboutWindow();
    baseDemo.addModuleView('about', about);

    ////// HELP MODULE
    const help  = new udvcore.HelpWindow();
    baseDemo.addModuleView('help', help);

    baseDemo.config.server = baseDemo.config.servers["lyon"];   

    ////// CAMERA POSITIONER
    const cameraPosition = new udvcore.CameraPositionerView(baseDemo.view,
        baseDemo.controls);
    baseDemo.addModuleView('cameraPositioner', cameraPosition);

    ////// LAYER CHOICE
    const layerChoice = new udvcore.LayerChoice(baseDemo.layerManager);
    baseDemo.addModuleView('layerChoice', layerChoice, {
        name: 'layerChoice'
    });
});
