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

    w.addExtension('blabla', {
        type: 'div',
        html: 'blabla',
        container: 'top',
        oncreated: () => console.log('blabla'),
        callback: () => console.log('jamais')
    });
    
    w.addExtension('bloblo', {
        type: 'div',
        html: '<em>HELLO</em>',
    });

    w.addExtension('blibli', {
        type: 'div',
        html: 'blibli',
        container: 'bottom',
    });

    w.addExtension('bouton', {
        type: 'button',
        html: 'bouton !!',
        container: 'bottom',
        callback: () => console.log('O=BO=OIJDFQJ')
    })
}

main();