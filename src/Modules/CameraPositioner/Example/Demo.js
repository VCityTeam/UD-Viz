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
    baseDemo.update3DView();

    const cameraPosition = new udvcore.CameraPositionerView(baseDemo.view,
        baseDemo.controls);
    baseDemo.addModuleView('cameraPositioner', cameraPosition);
});
