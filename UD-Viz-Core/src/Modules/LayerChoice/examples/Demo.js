import { BaseDemo } from '../../../Utils/BaseDemo/js/BaseDemo.js'

let baseDemo = new BaseDemo({
    iconFolder: '../../../../examples/data/icons',
    imageFolder: '../../../../examples/data/img',
    logos: ['logo-liris.png','logo-univ-lyon.png']
});

baseDemo.appendTo(document.body);

baseDemo.loadConfigFile('../../../../examples/data/config/generalDemoConfig.json').then(() => {
    baseDemo.addLogos();
    // Initialize iTowns 3D view
    baseDemo.init3DView('lyon_villeurbanne_bron');
    baseDemo.addBaseMapLayer();
    baseDemo.addElevationLayer();
    baseDemo.setupAndAdd3DTilesLayer('building');
    baseDemo.setupAndAdd3DTilesLayer('building_1_2_5');
    baseDemo.update3DView();

    ////// LAYER CHOICE
    const layerChoice = new udvcore.LayerChoice(baseDemo.view);
    baseDemo.addModuleView('layerChoice', layerChoice, {
        name: 'layerChoice'
    });
});
