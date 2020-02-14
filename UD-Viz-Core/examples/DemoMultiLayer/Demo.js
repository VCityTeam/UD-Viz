import { BaseDemo } from '../../src/Utils/BaseDemo/js/BaseDemo.js';

let baseDemo = new BaseDemo({
    iconFolder: '../data/icons',
    imageFolder: '../data/img',
});

baseDemo.appendTo(document.body);

baseDemo.loadConfigFile('../data/config/generalDemoConfig.json').then(() => {
    // Initialize iTowns 3D view
    baseDemo.init3DView('lyon_1_2_5');
    baseDemo.add3DTilesLayer('building_1_2_5');
    baseDemo.add3DTilesLayer('relief');
    baseDemo.add3DTilesLayer('water');
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
