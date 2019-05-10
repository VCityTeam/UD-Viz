import { dragElement } from './Draggable.js';

// Documentation is on the Wiki
// URL : https://github.com/MEPP-team/UDV/wiki/Window-Framework
// You can see an example in UDV-Core/examples/DemoWindow
export class Window {
    constructor(uniqueName, title, hideOnClose = true) {
        this.name = uniqueName;
        this.title = title;
        this.hideOnClose = hideOnClose;
        this.parentElement;
        this.listeners = []
    }

    //////////// Methods to override
    ////////////////////////////////

    // HTML string representing the inner content of the window
    get innerContentHtml() {
        return null;
    };

    // Method called when the window is created during the call and after, all HTML properties are not null
    windowCreated() {

    };

    // Method called when the window is destroyed
    windowDestroyed() {

    };

    //////////// Do NOT override these methods
    //////////////////////////////////////////

    appendTo(htmlElement) {
        if (!this.isCreated) {
            this.parentElement = htmlElement;
            let windowDiv = document.createElement('div');
            windowDiv.innerHTML = this.html;
            windowDiv.id = this.windowId;
            windowDiv.className = "window";
            htmlElement.appendChild(windowDiv);
            dragElement(windowDiv, this.header);

            if (this.hideOnClose) {
                this.headerCloseButton.onclick = this.hide.bind(this);
            } else {
                this.headerCloseButton.onclick = this.dispose.bind(this);
            }

            this.windowCreated();
            this.notifyListener(Window.EVENT_CREATED);
            this.notifyListener(Window.EVENT_SHOWED);
        }
    }

    dispose() {
        if (this.isCreated) {
            this.parentElement.removeChild(this.window);

            this.windowDestroyed();
            this.notifyListener(Window.EVENT_DESTROYED);
        }
    }

    show() {
        if (this.isCreated && !this.isVisible) {
            this.window.style.setProperty('display', 'grid');
            this.notifyListener(Window.EVENT_SHOWED);
        }
    }

    hide() {
        if (this.isVisible) {
            this.window.style.setProperty('display', 'none');
            this.notifyListener(Window.EVENT_HIDDEN);
        }
    }

    get html() {
        return `
            <div class="window-header" id="${this.headerId}">
                <h1 class="window-title" id="${this.headerTitleId}">${this.title}</h1>
                <button class="window-close-button" id="${this.headerCloseButtonId}">CLOSE</button>
            </div>
            <div class="window-content" id="${this.contentId}">
                <div class="window-inner-content" id="${this.innerContentId}">
                    ${this.innerContentHtml}
                </div>
            </div>
        `;
    }

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

    addListener(listenerFunc) {
        this.listeners.push(listenerFunc);
    }

    notifyListener(event) {
        for (let listener of this.listeners) {
            listener(event);
        }
    }

    static get EVENT_CREATED() {
        return 'EVENT_CREATED';
    }
    static get EVENT_DESTROYED() { 
        return 'EVENT_DESTROYED'; 
    }
    static get EVENT_HIDDEN() { 
        return 'EVENT_HIDDEN'; 
    }
    static get EVENT_SHOWED() { 
        return 'EVENT_SHOWED'; 
    }
}