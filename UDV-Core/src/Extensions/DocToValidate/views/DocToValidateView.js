import "./DocToValidateStyle.css"
import { DocToValidateSearchWindow } from "./DocToValidateSearchWindow";
import { DocToValidateBrowserWindow } from "./DocToValidateBrowserWindow";

export function DocToValidateView(docToValidateService) {

    this.docToValidateService = docToValidateService;
    this.searchWindow;
    this.browserWindow;

    this.onopen;
    this.onclose;

    this.initialize = function () {
        this.searchWindow = new DocToValidateSearchWindow(this, this.docToValidateService);
        this.browserWindow = new DocToValidateBrowserWindow(this, this.docToValidateService);
        this.docToValidateService.addObserver(this.browserWindow.update);
    }

    this.appendToElement = function (htmlElement) {
        this.searchWindow.appendToElement(htmlElement);
        this.browserWindow.appendToElement(htmlElement);
        if (typeof this.onopen === 'function') {
            this.onopen();
        }
    }

    this.dispose = () => {
        console.log('dispose');
        this.searchWindow.dispose();
        this.browserWindow.dispose();
        if (typeof this.onclose === 'function') {
            this.onclose();
        }
    }

    this.isVisible = function () {
        return this.searchWindow.isVisible();
    }

    this.initialize();
};