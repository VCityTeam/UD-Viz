import { BaseDemo } from '../../src/Utils/BaseDemo/js/BaseDemo.js';

let baseDemo = new BaseDemo({
    iconFolder: '../../../../examples/data/icons',
    imageFolder: '../../../../examples/data/img',
});

baseDemo.appendTo(document.body);

baseDemo.loadConfigFile('../../../../examples/data/config/generalDemoConfig.json').then(() => {
    // Initialize iTowns 3D view
    baseDemo.init3DView('lyon_villeurbanne_bron');
    baseDemo.addLyonWMSLayer();
    baseDemo.setupAndAdd3DTilesLayer('building');
    baseDemo.update3DView();

    ////// 3DTILES DEBUG
    const debug3dTilesWindow = new udvcore.Debug3DTilesWindow(baseDemo.layerManager);
    baseDemo.addModuleView('3dtilesDebug', debug3dTilesWindow, {
        name: '3DTiles Debug'
    });
});
