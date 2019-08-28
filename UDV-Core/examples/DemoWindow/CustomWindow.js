import { Window } from '../../src/Utils/GUI/js/Window.js';

export class CustomWindow extends Window {

    constructor () {
        super('custom', 'Ma fenêtre', false);
    }

    get innerContentHtml () {
        return /*html*/`
            <div data-ext-container="div-top" data-ext-container-default="div">
            </div>
            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <div data-ext-container="bottom" data-ext-class="box-section">
            </div>
        `;
    }

    windowCreated () {
        console.log('created');
    }

    windowDestroyed () {
        console.log('destroyed');
    }
}