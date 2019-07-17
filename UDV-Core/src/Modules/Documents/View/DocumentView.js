import { ModuleView } from "../../../Utils/ModuleView/ModuleView";
import { DocumentProvider } from "../ViewModel/DocumentProvider";
import { DocumentSearchWindow } from "./DocumentSearchWindow";
import { Document } from "../Model/Document";
import { DocumentBrowserWindow } from "./DocumentBrowserWindow";
import { Window } from "../../../Utils/GUI/js/Window";

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
    this.searchWindow = new DocumentSearchWindow(this.provider);

    /**
     * The browser window.
     * 
     * @type {DocumentBrowserWindow}
     */
    this.browserWindow = new DocumentBrowserWindow(this.provider);

    this.searchWindow.addEventListener(Window.EVENT_DISABLED, () => {
      this.disable();
    });
    this.browserWindow.addEventListener(Window.EVENT_DISABLED, () => {
      this.disable();
    });
  }

  /////////////////
  ///// MODULE VIEW

  enableView() {
    this.searchWindow.appendTo(this.parentElement);
    this.browserWindow.appendTo(this.parentElement);
    this.provider.refreshDocumentList();
  }

  disableView() {
    this.searchWindow.dispose();
    this.browserWindow.dispose();
  }
}