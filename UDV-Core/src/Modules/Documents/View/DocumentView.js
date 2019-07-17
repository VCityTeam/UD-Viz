import { ModuleView } from "../../../Utils/ModuleView/ModuleView";
import { DocumentProvider } from "../ViewModel/DocumentProvider";
import { DocumentSearchWindow } from "./DocumentSearchWindow";
import { Document } from "../Model/Document";
import { DocumentBrowserWindow } from "./DocumentBrowserWindow";
import { Window } from "../../../Utils/GUI/js/Window";
import { AbstractDocumentWindow } from "./AbstractDocumentWindow";

/**
 * The entry point of the document view. It holds the two main windows, browser
 * and search.
 */
export class DocumentView extends ModuleView {
  /**
   * Creates a document view.
   * 
   * @param {DocumentProvider} provider The document provider.
   */
  constructor(provider) {
    super();

    /**
     * The document provider.
     * 
     * @type {DocumentProvider}
     */
    this.provider = provider;

    /**
     * The search window.
     * 
     * @type {DocumentSearchWindow}
     */
    this.searchWindow = new DocumentSearchWindow();

    /**
     * The browser window.
     * 
     * @type {DocumentBrowserWindow}
     */
    this.browserWindow = new DocumentBrowserWindow();

    /**
     * The different windows of the view.
     * 
     * @type {Array<AbstractDocumentWindow>}
     */
    this.windows = []

    this.addDocumentWindow(this.searchWindow);
    this.addDocumentWindow(this.browserWindow);
  }

  addDocumentWindow(newWindow) {
    if (! (newWindow instanceof AbstractDocumentWindow)) {
      throw 'Only instances of AbstractDocumentWindow can be added to the ' +
        'document view';
    }

    this.windows.push(newWindow);
    newWindow.setDocumentProvider(this.provider);
    newWindow.addEventListener(Window.EVENT_DISABLED, () => {
      this.disable();
    });
  }

  /////////////////
  ///// MODULE VIEW

  enableView() {
    for (let window of this.windows) {
      window.appendTo(this.parentElement);
    }
    this.provider.refreshDocumentList();
  }

  disableView() {
    for (let window of this.windows) {
      window.dispose();
    }
  }
}