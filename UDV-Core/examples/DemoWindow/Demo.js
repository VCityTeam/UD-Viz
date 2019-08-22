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

    w.addExtension('test1', {
        type: 'div',
        html: 'test1',
        container: 'top',
        oncreated: () => console.log('test1'),
        callback: () => console.log('jamais')
    });
    
    w.addExtension('test2', {
        type: 'div',
        html: '<em>test2</em>',
    });

    w.addExtension('test3', {
        type: 'div',
        html: 'test3',
        container: 'bottom',
    });

    w.addExtension('bouton', {
        type: 'button',
        html: '[bouton]',
        container: 'bottom',
        callback: () => console.log('test bouton')
    })
}

main();