import "./DocToValidateStyle.css"
import { DocToValidateSearchWindow } from "./DocToValidateSearchWindow";
import { DocToValidateBrowserWindow } from "./DocToValidateBrowserWindow";
import { DocToValidateCommentWindow } from "./DocToValidateCommentWindow"
import { ModuleView } from "../../../Utils/ModuleView/ModuleView";

export class DocToValidateView extends ModuleView{

    constructor(docToValidateService, documentController) {
        super();
        this.docToValidateService = docToValidateService;
        this.searchWindow;
        this.browserWindow;
        this.commentWindow;

        this.documentController = documentController;

        this.parentElement;

        this.onopen;
        this.onclose;

        this.initialize();
    }

    initialize() {
        this.searchWindow = new DocToValidateSearchWindow(this, this.docToValidateService);
        this.browserWindow = new DocToValidateBrowserWindow(this, this.docToValidateService);
        this.commentWindow = new DocToValidateCommentWindow(this.docToValidateService);
    }

    appendToElement(htmlElement) {
        this.searchWindow.appendTo(htmlElement);
        this.browserWindow.appendTo(htmlElement);
        this.docToValidateService.search(new FormData());
        if (typeof this.onopen === 'function') {
            this.onopen();
        }
    }

    dispose() {
        this.searchWindow.dispose();
        this.browserWindow.dispose();
        this.commentWindow.dispose();
        if (typeof this.onclose === 'function') {
            this.onclose();
        }
    }

    isVisible() {
        return this.searchWindow.isVisible;
    }

    /////// MODULE MANAGEMENT FOR BASE DEMO

    enableView() {
        this.appendToElement(this.parentElement);
    }

    disableView() {
        this.dispose();
    }
}
