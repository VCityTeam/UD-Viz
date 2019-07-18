import { DocumentProvider } from "../../../Modules/Documents/ViewModel/DocumentProvider";
import { RequestService } from "../../../Utils/Request/RequestService";
import { Document } from "../../../Modules/Documents/Model/Document";

/**
 * This class performs the requests on the server to update and create
 * documents.
 */
export class ContributeService {
  /**
   * Creates a contribute service.
   * 
   * @param {RequestService} requestService The request service.
   * @param {DocumentProvider} provider The document provider.
   * @param {object} config The UDV config.
   * @param {object} config.server The server configuration.
   * @param {string} config.server.url The server url.
   * @param {string} config.server.document The base route for documents.
   */
  constructor(requestService, provider, config) {
    /**
     * The request service.
     * 
     * @type {RequestService}
     */
    this.requestService = requestService;

    /**
     * The document provider.
     * 
     * @type {DocumentProvider}
     */
    this.provider = provider;

    /**
     * The UDV configuration.
     * 
     * @type {{
     *  server: {
     *    url: string,
     *    document: string
     *  }
     * }}
     */
    this.config = config;

    /**
     * The base URL for documents.
     * 
     * @type {string}
     */
    this.documentUrl = this.config.server.url;
    if (!this.documentUrl.endsWith('/')) {
      this.documentUrl += '/';
    }
    this.documentUrl += this.config.server.document;
  }

  /**
   * Sends the request to update the document.
   * 
   * @param {FormData} updatedData The updated document data.
   * 
   * @returns {Document} The updated document.
   */
  async updateDocument(updatedData) {
    //get current doc data and id
    let currentDoc = this.provider.getDisplayedDocument();
    let id = currentDoc.id;

    let url = this.documentUrl + '/' + id;

    let response = await this.requestService.request('PUT', url, {
      body: updatedData
    });

    if (response.status >= 200 && response.status < 300) {
      let updated = JSON.parse(response.responseText);
      await this.provider.refreshDocumentList();
      this.provider.setDisplayedDocument(updated);
    }
  }
}