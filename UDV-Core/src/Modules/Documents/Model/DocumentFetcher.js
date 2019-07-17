import { RequestService } from "../../../Utils/Request/RequestService";
import { Document } from "./Document";

export class DocumentFetcher {
  /**
   * Constructs a new document fetcher.
   * 
   * @param {RequestService} requestService The request service.
   * @param {object} config The configuration of UDV.
   * @param {object} config.server The server configuration.
   * @param {string} config.server.url The server url.
   * @param {string} config.server.document The base route for documents.
   */
  constructor(requestService, config) {
    /**
     * The request service.
     * 
     * @type {RequestService}
     */
    this.requestService = requestService;
    
    /**
     * The URL to fetch the documents.
     * 
     * @type {string}
     */
    this.documentUrl;
    this.setConfig(config);

    /**
     * The list of documents.
     * 
     * @type {Array<Document>}
     */
    this.documents = [];
  }

  /**
   * Sets the configuration of the documents source.
   * 
   * @param {object} config The configuration of UDV.
   * @param {object} config.server The server configuration.
   * @param {string} config.server.url The server url.
   * @param {string} config.server.document The base route for documents.
   */
  setConfig(config) {
    if (!!config && !!config.server && !!config.server.url &&
      !!config.server.document) {
      this.documentUrl = config.server.url;
      if (this.documentUrl.slice(-1) !== "/") {
        this.documentUrl += "/";
      }
      this.documentUrl += config.server.document;
    } else {
      throw 'The given configuration is incorrect.';
    }
  }

  /**
   * Fetches the documents from the server and return them in an array.
   * 
   * @async
   * 
   * @returns {Promise<Array<Document>>}
   */
  async fetchDocuments() {
    if (this.documentUrl === undefined) {
      console.warn('Cannot fetch documents if the config has not been set.');
      return;
    }

    let req = await this.requestService.request('GET', this.documentUrl, {
      authenticate: false
    });

    if (req.status !== 200) {
      throw 'Could not fetch the documents: ' + req.statusText;
    }

    this.documents = JSON.parse(req.responseText);

    return this.documents;
  }
}