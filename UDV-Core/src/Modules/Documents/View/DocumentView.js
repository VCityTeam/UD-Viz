import { ModuleView } from "../../../Utils/ModuleView/ModuleView";
import { DocumentProvider } from "../ViewModel/DocumentProvider";
import { DocumentSearchWindow } from "./DocumentSearchWindow";
import { Document } from "../Model/Document";

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
  }

  /////////////////
  ///// MODULE VIEW

  enableView() {
    this.searchWindow.appendTo(this.parentElement);
    this.provider.refreshDocumentList();
  }

  disableView() {
    this.searchWindow.dispose();
  }
}