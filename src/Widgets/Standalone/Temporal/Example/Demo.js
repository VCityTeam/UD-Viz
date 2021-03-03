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
    baseDemo.init3DView('lyon_1');
    baseDemo.addBaseMapLayer();
    baseDemo.addElevationLayer();
    const [$3DTilesLayer, $3DTilesManager] = baseDemo.setup3DTilesLayer('lyon2009-2015');
    
    // Set up the temporal module which needs to register events to the 3D 
    // Tiles Layer before it is added to the itowns view
    const temporalModule = new udvcore.TemporalModule($3DTilesManager, baseDemo.config['temporalModule']);
    ///// TEMPORAL MODULE VIEW
    baseDemo.addModuleView('temporal', temporalModule.view, {
        name: 'Temporal Navigation'
    });

    // Add the 3D Tiles layer to itowns view and update the view
    baseDemo.add3DTilesLayer($3DTilesLayer);
    baseDemo.update3DView();
});
