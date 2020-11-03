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

    const cityObjects = new udvcore.CityObjectModule(baseDemo.layerManager, baseDemo.config);
    baseDemo.addModuleView('cityObjects', cityObjects.view);
});
