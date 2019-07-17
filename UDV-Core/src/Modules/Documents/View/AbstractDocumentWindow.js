import { Window } from "../../../Utils/GUI/js/Window";
import { DocumentProvider } from "../ViewModel/DocumentProvider";

export class AbstractDocumentWindow extends Window {
  constructor(name) {
    super(`document2-${name}`, `Document - ${name}`, true);

    /**
     * The document provider.
     * 
     * @type {DocumentProvider}
     */
    this.provider = undefined;
  }

  /**
   * Function called when the document provider has been passed by the view.
   * Operations on documents can be performed in this function.
   * 
   * @override
   */
  documentProviderReady() {

  }

  /**
   * Sets the document provider. Should be called by `DocumentView`. Calls the
   * method `
   * 
   * @param {DocumentProvider} provider The document provider.
   */
  setDocumentProvider(provider) {
    this.provider = provider;

    this.documentProviderReady();
  }
}