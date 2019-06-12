import { dragElement } from './Draggable.js';
import { ModuleView } from '../../ModuleView/ModuleView.js';
import { windowManager } from "./WindowManager";

// Documentation is on the Wiki
// URL : https://github.com/MEPP-team/UDV/wiki/Window-Framework
// You can see an example in UDV-Core/examples/DemoWindow
/**
 * A simple GUI class to represent a window.
 * 
 * @extends ModuleView
 */
export class Window extends ModuleView {
    /**
     * Creates a window.
     * 
     * @param {string} uniqueName The name used to generate HTML ids.
     * @param {string} title The title of the window.
     * @param {boolean} hideOnClose Specifies the behaviour of the window when
     * the 'close' button is hit. If set to true, the window will `hide`. If set
     * to false, the window will `dispose`.
     */
    constructor(uniqueName, title, hideOnClose = true) {
        super();

        /**
         * Name of the window. Used to generate unique ids.
         * 
         * @member {string}
         */
        this.name = uniqueName;
        /**
         * Title displayed on the window.
         * 
         * @member {string}
         */
        this.title = title;
        /**
         * Behaviour of the window when the 'close' button is hit. If set to
         * true, the window will `hide`. If set to false, the window will
         * `dispose`.
         * 
         * @member {boolean}
         */
        this.hideOnClose = hideOnClose;

        this.registerEvent(Window.EVENT_CREATED);
        this.registerEvent(Window.EVENT_DESTROYED);
        this.registerEvent(Window.EVENT_SHOWN);
        this.registerEvent(Window.EVENT_HIDDEN);

        windowManager.registerWindow(this);
    }

    //////////// Methods to override
    ////////////////////////////////

    /**
     * HTML string representing the inner content of the window.
     * 
     * @abstract
     */
    get innerContentHtml() {
        return null;
    };

    /** 
     * Method called when the window is created. During and after the call,
     * all HTML properties are not null.
     * 
     * @abstract
     */
    windowCreated() {

    };

    /**
     * Method called when the window is destroyed.
     * 
     * @abstract
     */
    windowDestroyed() {

    };

    //////////// Do NOT override these methods
    //////////////////////////////////////////

    /**
     * Creates the HTML elements of the window and add them to the given parent
     * node. Calls the `windowCreated` hook method and sends two events,
     * `EVENT_CREATED` and `EVENT_SHOWN`.
     * 
     * @param {HTMLElement} htmlElement 
     */
    appendTo(htmlElement) {
        if (!this.isCreated) {
            this.parentElement = htmlElement;
            let windowDiv = document.createElement('div');
            windowDiv.innerHTML = this.html;
            windowDiv.id = this.windowId;
            windowDiv.className = "window";
            htmlElement.appendChild(windowDiv);
            dragElement(windowDiv, this.header);

            this.headerCloseButton.onclick = this.disable.bind(this);

            this.windowCreated();
            this.sendEvent(Window.EVENT_CREATED);
            this.sendEvent(Window.EVENT_SHOWN);
        }
    }

    /**
     * Destroys the window. Calls the `windowDestroyed` hook method and sends an
     * `EVENT_DESTROYED` event.
     */
    dispose() {
        if (this.isCreated) {
            this.parentElement.removeChild(this.window);

            this.windowDestroyed();
            this.sendEvent(Window.EVENT_DESTROYED);
        }
    }

    /**
     * Shows the window. Sends an `EVENT_SHOWN` event.
     */
    show() {
        if (this.isCreated && !this.isVisible) {
            this.window.style.setProperty('display', 'grid');
            this.sendEvent(Window.EVENT_SHOWN);
        }
    }

    /**
     * Hides the window. Sends an `EVENT_DESTROYED` event.
     */
    hide() {
        if (this.isVisible) {
            this.window.style.setProperty('display', 'none');
            this.sendEvent(Window.EVENT_HIDDEN);
        }
    }

    get html() {
        return `
            <div class="window-header" id="${this.headerId}">
                <h1 class="window-title" id="${this.headerTitleId}">${this.title}</h1>
                <button class="window-close-button" id="${this.headerCloseButtonId}">&#10799;</button>
            </div>
            <div class="window-content" id="${this.contentId}">
                <div class="window-inner-content" id="${this.innerContentId}">
                    ${this.innerContentHtml}
                </div>
            </div>
        `;
    }

    //////////// Module view overrides
    //////////////////////////////////

    /**
     * Creates and show the window.
     * 
     * @override
     */
    async enableView() {
        this.appendTo(this.parentElement);
        this.show();
    }

    /**
     * If `hideOnClose` is `true`, hides the window. Else, destroys it.
     * 
     * @override
     */
    async disableView() {
        if (this.hideOnClose) {
            this.hide();
        } else {
            this.dispose();
        }
    }

    //////////// IDs, HTML and other getters
    ////////////////////////////////////////

    get isCreated() {
        let windowDiv = this.window;
        return windowDiv !== null && windowDiv !== undefined;
    }

    get isVisible() {
        return this.isCreated && window.getComputedStyle(this.window).getPropertyValue('display') === 'grid';
    }

    get windowId() {
        return `_window_${this.name}`;
    }

    get window() {
        return document.getElementById(this.windowId);
    }

    get headerId() {
        return `_window_header_${this.name}`;
    }

    get header() {
        return document.getElementById(this.headerId);
    }

    get headerTitleId() {
        return `_window_header_title_${this.name}`;
    }

    get headerTitle() {
        return document.getElementById(this.headerTitleId);
    }

    get headerCloseButtonId() {
        return `_window_header_close_button_${this.name}`;
    }

    get headerCloseButton() {
        return document.getElementById(this.headerCloseButtonId);
    }

    get contentId() {
        return `_window_content_${this.name}`;
    }

    get content() {
        return document.getElementById(this.contentId);
    }

    get innerContentId() {
        return `_window_inner_content_${this.name}`;
    }

    get innerContent() {
        return document.getElementById(this.innerContentId);
    }

    //////////// Events
    ///////////////////

    static get EVENT_CREATED() {
        return 'WINDOW_CREATED';
    }
    static get EVENT_DESTROYED() { 
        return 'WINDOW_DESTROYED'; 
    }
    static get EVENT_HIDDEN() { 
        return 'WINDOW_HIDDEN'; 
    }
    static get EVENT_SHOWN() { 
        return 'WINDOW_SHOWN'; 
    }
}