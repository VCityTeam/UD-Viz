import { BaseDemo } from '../../src/Utils/BaseDemo/js/BaseDemo.js'

let baseDemo = new BaseDemo();

baseDemo.appendTo(document.body);
baseDemo.loadConfigFile('./Config.json').then(() => {
    const config = baseDemo.config;

    ////// ABOUT MODULE
    const about = new udvcore.AboutWindow({active:true});
    baseDemo.addModule('About', 'about', about);

    const help  = new udvcore.HelpWindow({active:true});
});