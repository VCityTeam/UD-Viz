import { RequestService } from "../../Utils/Request/RequestService";
import { DocumentFetcher, DocumentSource } from "./Model/DocumentFetcher";
import { DocumentProvider } from "./ViewModel/DocumentProvider";
import { DocumentView } from "./View/DocumentView";

/**
 * The entry point of the documents module.
 */
export class DocumentModule {
  /**
   * Creates a new documents module.
   * 
   * @param {RequestService} requestService The request service.
   * @param {object} config The configuration of UDV.
   * @param {object} config.server The server configuration.
   * @param {string} config.server.url The server url.
   * @param {string} config.server.document The base route for documents.
   * @param {string} config.server.file The route for document files.
   */
  constructor(requestService, config) {
    /**
     * The document fetcher holds the list of documents fetched from the
     * server.
     * 
     * @type {DocumentFetcher}
     */
    this.fetcher = new DocumentFetcher(requestService, config);

    /**
     * The document provider filters the list of documents.
     * 
     * @type {DocumentProvider}
     */
    this.provider = new DocumentProvider(this.fetcher);

    /**
     * The document view represents the user interface for the documents.
     * 
     * @type {DocumentView}
     */
    this.view = new DocumentView(this.provider);
  }

  ///////////////
  ///// EXTENSION

  /**
   * Adds a new window to display information about documents.
   * 
   * @param {AbstractDocumentWindow} newWindow The window to add.
   */
  addDocumentWindow(newWindow) {
    this.view.addDocumentWindow(newWindow);
  }
  
  /**
   * Creates a new extension for the document browser. An extension can be
   * either a command button or a panel. An extension should be identified by
   * a unique label.
   * 
   * @param {string} label The button label.
   * @param {object} options The extension options
   * @param {string} options.type The type of the option. Can be either `button`
   * or `panel`.
   * @param {(doc: Document) => string} options.html The inside HTML of the
   * extension. For a button, this will be the displayed text. For a panel, it
   * will be the inside HTML.
   * @param {(doc: Document) => any} [options.callback] The callback to call
   * for a button.
   */
  addBrowserExtension(label, options) {
    this.view.browserWindow.addDocumentExtension(label, options)
  }

  /**
   * Removes an existing extension in the browser window.
   * 
   * @param {string} label The extension label.
   */
  removeBrowserExtension(label) {
    this.view.browserWindow.removeDocumentExtension(label);
  }

  /**
   * Creates a new extension for the document search. An extension can be
   * either a command button or a panel. An extension should be identified by
   * a unique label.
   * 
   * @param {string} label The extension label.
   * @param {object} options The extension options
   * @param {string} options.type The type of the option. Can be either `button`
   * or `panel`.
   * @param {(doc: Document[]) => string} options.html The inside HTML of the
   * extension. For a button, this will be the displayed text. For a panel, it
   * will be the inside HTML.
   * @param {(doc: Document[]) => any} [options.callback] The callback to call
   * for a button.
   */
  addSearchWindowExtension(label, options) {
    this.view.searchWindow.addDocumentsExtension(label, options);
  }

  /**
   * Removes an existing extension in the search window.
   * 
   * @param {string} label The extension label.
   */
  removeSearchWindowExtension(label) {
    this.view.searchWindow.removeDocumentsExtension(label);
  }

  /**
   * Changes the document source (the object representing the server URLs
   * to fetch the documents).
   * 
   * @param {DocumentSource} newSource The new document source.
   * @param {boolean} [authenticate] Specifies wether authentication should be
   * used for the document fetch requests.
   * 
   * @returns {DocumentSource} The previous document source.
   */
  changeDocumentSource(newSource, authenticate) {
    return this.provider.fetcher.setSource(newSource, authenticate);
  }
}