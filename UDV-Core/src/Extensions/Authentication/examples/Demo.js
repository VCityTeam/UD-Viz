import { BaseDemo } from '../../../Utils/BaseDemo/js/BaseDemo.js'

let baseDemo = new BaseDemo({
    iconFolder: '../../../../examples/data/icons',
    imageFolder: '../../../../examples/data/img'
});

baseDemo.appendTo(document.body);

// Initialize iTowns 3D view
baseDemo.init3DView();

baseDemo.loadConfigFile(
    '../../../../examples/data/config/generalDemoConfig.json').then(() => {
    ////// REQUEST SERVICE
    const requestService = new udvcore.RequestService();

    ////// AUTHENTICATION MODULE
    const authenticationService =
        new udvcore.AuthenticationService(requestService, baseDemo.config);
    const authenticationView =
        new udvcore.AuthenticationView(authenticationService);
    baseDemo.addModuleView('authentication', authenticationView,
        {type: BaseDemo.AUTHENTICATION_MODULE});
});
