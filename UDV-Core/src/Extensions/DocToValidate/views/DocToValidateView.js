import "./DocToValidateStyle.css"
import { DocToValidateSearchWindow } from "./DocToValidateSearchWindow";
import { DocToValidateBrowserWindow } from "./DocToValidateBrowserWindow";

export function DocToValidateView(docToValidateService) {

    this.docToValidateService = docToValidateService;
    this.searchWindow;
    this.browserWindow;

    this.initialize = function () {
        this.searchWindow = new DocToValidateSearchWindow(this, this.docToValidateService);
        this.browserWindow = new DocToValidateBrowserWindow(this, this.docToValidateService);
        this.docToValidateService.addObserver(this.browserWindow.update);
    }

    this.appendToElement = function (htmlElement) {
        this.searchWindow.appendToElement(htmlElement);
        this.browserWindow.appendToElement(htmlElement);
    }

    this.dispose = () => {
        console.log('dispose');
        this.searchWindow.dispose();
        this.browserWindow.dispose();
    }

    this.isVisible = function () {
        return this.searchWindow.isVisible();
    }

    this.initialize();
};