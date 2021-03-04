import { BaseDemo } from '../../src/Utils/BaseDemo/js/BaseDemo.js';

let baseDemo = new BaseDemo({
    iconFolder: '../data/icons',
    imageFolder: '../data/img',
    logos: ['logo-liris.png','logo-univ-lyon.png']
});

baseDemo.appendTo(document.body);

baseDemo.loadConfigFile('../data/config/generalDemoConfig.json').then(() => {
    baseDemo.addLogos();
    // Initialize iTowns 3D view
    baseDemo.init3DView('lyon_1_2_5');
    baseDemo.setupAndAdd3DTilesLayer('building_1_2_5');
    baseDemo.setupAndAdd3DTilesLayer('relief');
    baseDemo.setupAndAdd3DTilesLayer('water');
    baseDemo.update3DView();

    ////// ABOUT MODULE
    const about = new udvcore.AboutWindow();
    baseDemo.addModuleView('about', about);

    ////// HELP MODULE
    const help  = new udvcore.HelpWindow();
    baseDemo.addModuleView('help', help);

    ////// LAYER CHOICE
    const layerChoice = new udvcore.LayerChoice(baseDemo.view);
    baseDemo.addModuleView('layerChoice', layerChoice, {
        name: 'layerChoice'
    });
});
