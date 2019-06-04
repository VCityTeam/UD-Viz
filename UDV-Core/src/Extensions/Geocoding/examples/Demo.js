import { BaseDemo } from '../../../Utils/BaseDemo/js/BaseDemo.js'

let baseDemo = new BaseDemo({
    iconFolder: '../../../../examples/data/icons',
    imageFolder: '../../../../examples/data/img'
});

baseDemo.appendTo(document.body);
baseDemo.loadConfigFile('../../../../examples/data/config/generalDemoConfig.json').then(() => {
    ////// REQUEST SERVICE
    const requestService = new udvcore.RequestService();

    ////// GEOCODING
    const geocodingService = new udvcore.GeocodingService(requestService);
    const geocodingView = new udvcore.GeocodingView(geocodingService, baseDemo.controls, baseDemo.view);
    baseDemo.addModuleView('geocoding', geocodingView)
});