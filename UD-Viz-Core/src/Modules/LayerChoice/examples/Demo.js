import { BaseDemo } from '../../../Utils/BaseDemo/js/BaseDemo.js'

let baseDemo = new BaseDemo({
    iconFolder: '../../../../examples/data/icons',
    imageFolder: '../../../../examples/data/img'
});

baseDemo.appendTo(document.body);

baseDemo.loadConfigFile('../../../../examples/data/config/generalDemoConfig.json').then(() => {
    // Initialize iTowns 3D view
    baseDemo.init3DView('lyon_villeurbanne_bron');
    baseDemo.addLyonWMSLayer();
    baseDemo.add3DTilesLayer('building');
    baseDemo.add3DTilesLayer('building_1_2_5');
    baseDemo.update3DView();

    ////// LAYER CHOICE
    const layerChoice = new udvcore.LayerChoice(baseDemo.view);
    baseDemo.addModuleView('layerChoice', layerChoice, {
        name: 'layerChoice'
    });
});
