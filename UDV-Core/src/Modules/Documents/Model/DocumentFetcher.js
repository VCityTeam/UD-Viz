import { RequestService } from "../../../Utils/Request/RequestService";
import { Document } from "./Document";
import { imageToDataURI } from "../../../Utils/DataProcessing/DataProcessing";

/**
 * This class is responsible of fetching the documents from the server. It is
 * configured by an object containing the server URL and routes.
 */
export class DocumentFetcher {
  /**
   * Constructs a new document fetcher.
   * 
   * @param {RequestService} requestService The request service.
   * @param {object} config The configuration of UDV.
   * @param {object} config.server The server configuration.
   * @param {string} config.server.url The server url.
   * @param {string} config.server.document The base route for documents.
   * @param {string} config.server.file The route for document files.
   * @param {boolean} [config.server.authenticate] If authentication should be
   * used for the request.
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

    /**
     * The route to fetch the document images.
     * 
     * @type {string}
     */
    this.fileRoute;

    /**
     * If authentication should be used for the request.
     * 
     * @type {boolean}
     */
    this.authenticate;

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
   * @param {string} config.server.file The route for document files.
   * @param {boolean} [config.server.authenticate] If authentication should be
   * used for the request.
   */
  setConfig(config) {
    if (!!config && !!config.server && !!config.server.url &&
      !!config.server.document && !!config.server.file) {
      this.documentUrl = config.server.url;
      if (this.documentUrl.slice(-1) !== "/") {
        this.documentUrl += "/";
      }
      this.documentUrl += config.server.document;
      this.fileRoute = config.server.file;
      if (config.server.authenticate !== undefined) {
        this.authenticate = config.server.authenticate;
      } else {
        this.authenticate = false;
      }
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
      authenticate: this.authenticate
    });

    if (req.status !== 200) {
      throw 'Could not fetch the documents: ' + req.statusText;
    }

    this.documents = JSON.parse(req.responseText);

    return this.documents;
  }

  /**
   * Fetches the image corresponding to the given document.
   * 
   * @param {Document} doc The document to fetch the image.
   * 
   * @returns {string} The data string of the image.
   */
  async fetchDocumentImage(doc) {
    let imgUrl = this.documentUrl + '/' + doc.id + '/' + this.fileRoute;
    let req = await this.requestService.request('GET', imgUrl, {
      responseType: 'arraybuffer',
      authenticate: this.authenticate
    });
    if (req.status >= 200 && req.status < 300) {
      return imageToDataURI(req.response,
        req.getResponseHeader('Content-Type'));
    }
    throw 'Could not get the file';
  }
}