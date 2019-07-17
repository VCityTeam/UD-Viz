import { RequestService } from "../../Utils/Request/RequestService";
import { DocumentFetcher } from "./Model/DocumentFetcher";
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
}