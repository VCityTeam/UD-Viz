import "./DocToValidateStyle.css"
import { DocToValidateSearchWindow } from "./DocToValidateSearchWindow";
import { DocToValidateBrowserWindow } from "./DocToValidateBrowserWindow";
import { DocToValidateCommentWindow } from "./DocToValidateCommentWindow"

export function DocToValidateView(docToValidateService, documentController) {

    this.docToValidateService = docToValidateService;
    this.documentController = documentController;
    this.searchWindow;
    this.browserWindow;
    this.commentWindow;

    this.onopen;
    this.onclose;

    this.initialize = function () {
        this.searchWindow = new DocToValidateSearchWindow(this, this.docToValidateService);
        this.browserWindow = new DocToValidateBrowserWindow(this, this.docToValidateService);
        this.commentWindow = new DocToValidateCommentWindow(this.docToValidateService);
        this.docToValidateService.addObserver(this.browserWindow.update);
    }

    this.appendToElement = function (htmlElement) {
        this.searchWindow.appendTo(htmlElement);
        this.browserWindow.appendToElement(htmlElement);
        this.docToValidateService.search(new FormData());
        if (typeof this.onopen === 'function') {
            this.onopen();
        }
    }

    this.dispose = () => {
        console.log('dispose');
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
};
