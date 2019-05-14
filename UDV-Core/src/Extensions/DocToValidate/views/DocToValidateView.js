import "./DocToValidateStyle.css"
import { DocToValidateSearchWindow } from "./DocToValidateSearchWindow";
import { DocToValidateBrowserWindow } from "./DocToValidateBrowserWindow";
import { DocToValidateCommentWindow } from "./DocToValidateCommentWindow"

export function DocToValidateView(docToValidateService, documentController) {

    this.docToValidateService = docToValidateService;
    this.searchWindow;
    this.browserWindow;
    this.commentWindow;

    this.documentController = documentController;

    this.parentElement;

    this.onopen;
    this.onclose;

    this.initialize = function () {
        this.searchWindow = new DocToValidateSearchWindow(this, this.docToValidateService);
        this.browserWindow = new DocToValidateBrowserWindow(this, this.docToValidateService);
        this.commentWindow = new DocToValidateCommentWindow(this.docToValidateService);
    }

    this.appendToElement = function (htmlElement) {
        this.searchWindow.appendTo(htmlElement);
        this.browserWindow.appendTo(htmlElement);
        this.docToValidateService.search(new FormData());
        if (typeof this.onopen === 'function') {
            this.onopen();
        }
    }

    this.dispose = () => {
        this.searchWindow.dispose();
        this.browserWindow.dispose();
        this.commentWindow.dispose();
        if (typeof this.onclose === 'function') {
            this.onclose();
        }
    }

    this.isVisible = function () {
        return this.searchWindow.isVisible;
    }

    this.initialize();

    /////// MODULE MANAGEMENT FOR BASE DEMO

    this.enable = () => {
        this.appendToElement(this.parentElement);
        this.sendEvent('ENABLED');
    }

    this.disable = () => {
        this.dispose();
        this.sendEvent('DISABLED');
    }

    this.eventListeners = {};

    this.addEventListener = (event, action) => {
        if (this.eventListeners[event]) {
            this.eventListeners[event].push(action);
        } else {
            this.eventListeners[event] = [
                action
            ];
        }
    }

    this.sendEvent = (event) => {
        let listeners = this.eventListeners[event];
        if (listeners !== undefined && listeners !== null) {
            for (let listener of listeners) {
                listener();
            }
        }
    }
};
