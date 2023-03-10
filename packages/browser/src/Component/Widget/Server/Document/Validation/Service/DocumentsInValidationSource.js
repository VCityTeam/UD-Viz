import { DocumentSource } from '../../Documents/Model/DocumentService';

/**
 * The document source for documents in validation.
 */
export class DocumentsInValidationDocumentSource extends DocumentSource {
  /**
   * Creates the document source.
   *
   * @param {object} configServer The configuration for the server.
   * @param {string} configServer.url The base URL of the server.
   * @param {string} configServer.documentToValidate The route to fetch
   * documents to validate.
   * @param {string} configServer.document The route to fetch documents.
   * @param {string} configServer.file The route for document files.
   */
  constructor(configServer) {
    super();
    this.documentToValidateUrl = `${configServer.url}${configServer.documentToValidate}`;
    this.documentUrl = `${configServer.url}${configServer.document}`;
    this.fileRoute = configServer.file;
  }

  /**
   * Returns the URL of the document to validate
   *
   * @returns {string} The URL of the document
   */
  getDocumentUrl() {
    return this.documentToValidateUrl;
  }

  /**
   * Returns the URL of the image of the document
   *
   * @param {Document} doc The document
   * @returns {string} The URL of the image
   */
  getImageUrl(doc) {
    return this.documentUrl + '/' + doc.id + '/' + this.fileRoute;
  }
}
