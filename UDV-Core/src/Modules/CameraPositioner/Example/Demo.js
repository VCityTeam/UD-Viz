import { BaseDemo } from '../../../Utils/BaseDemo/js/BaseDemo.js'

let baseDemo = new BaseDemo({
    iconFolder: '../../../../examples/data/icons',
    imageFolder: '../../../../examples/data/img'
});

baseDemo.appendTo(document.body);

baseDemo.loadConfigFile(
    '../../../../examples/data/config/generalDemoConfig.json').then(() => {

    // Initialize iTowns 3D view
    baseDemo.init3DView();
    
    const cameraPosition = new udvcore.CameraPositionerView(baseDemo.view,
        baseDemo.controls);
    baseDemo.addModuleView('cameraPositioner', cameraPosition);
});
