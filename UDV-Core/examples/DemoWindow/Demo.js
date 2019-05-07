import { CustomWindow } from './CustomWindow.js';

function main () {
    console.log('start');

    let w = new CustomWindow();
    w.addListener((event) => {
        console.log(event);
    });
    
    document.getElementById('create').onclick = () => {
        console.log('create...');
        w.appendTo(document.body);
    };
    document.getElementById('dispose').onclick = () => {
        console.log('dispose...');
        w.dispose(); 
    };
    document.getElementById('hide').onclick = () => {
        console.log('hide...');
        w.hide();
    };
    document.getElementById('show').onclick = () => {
        console.log('show...');
        w.show();
    };
}

main();