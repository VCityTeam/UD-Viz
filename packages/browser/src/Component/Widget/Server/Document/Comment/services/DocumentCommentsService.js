import { RequestService } from '../../../../../RequestService';
import { DocumentProvider } from '../../Core/ViewModel/DocumentProvider';

/**
 * The service that performs the requests for document comments. This include
 * retrieve and create operations.
 */
export class DocumentCommentsService {
  /**
   * Creates a document comments service.
   *
   * @param {DocumentProvider} documentProvider The document provider.
   * @param {RequestService} requestService The request service.
   * @param {object} configServer The server access config.
   * @param {string} configServer.url The server URL.
   * @param {string} configServer.document The route for documents.
   * @param {string} configServer.comment The route for comments.
   * @param {string} configServer.user The route for users.
   */
  constructor(documentProvider, requestService, configServer) {
    this.documentProvider = documentProvider;

    this.requestService = requestService;

    this.documentUrl = `${configServer.url}${configServer.document}`;
    this.commentRoute = configServer.comment;
    this.authorUrl = `${configServer.url}${configServer.user}`;
  }

  /**
   * Get the comments as JSON object
   *
   * @returns {object} Comment as JSON object
   */
  async getComments() {
    const currentDocument = this.documentProvider.getDisplayedDocument();
    if (currentDocument !== null && currentDocument !== undefined) {
      const url =
        this.documentUrl + '/' + currentDocument.id + '/' + this.commentRoute;
      const response = (
        await this.requestService.request('GET', url, { authenticate: 'auto' })
      ).response;
      const jsonResponse = JSON.parse(response);
      for (const element of jsonResponse) {
        const url = this.authorUrl + '/' + element.user_id;
        const responseAuthor = (
          await this.requestService.request('GET', url, {
            authenticate: 'auto',
          })
        ).response;
        element.author = JSON.parse(responseAuthor);
      }
      return jsonResponse;
    }
    return [];
  }

  /**
   * Publish the comments
   *
   * @param {FormData} formData The form data containing the comments
   */
  async publishComment(formData) {
    const currentDocument = this.documentProvider.getDisplayedDocument();
    if (currentDocument !== null && currentDocument !== undefined) {
      const url =
        this.documentUrl + '/' + currentDocument.id + '/' + this.commentRoute;
      // eslint-disable-next-line no-unused-vars
      const response = (await this.requestService.send('POST', url, formData))
        .response;
    }
  }
}
