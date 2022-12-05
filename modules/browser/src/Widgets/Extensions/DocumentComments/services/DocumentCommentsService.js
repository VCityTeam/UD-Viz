

// Components
import { RequestService } from '../../../../Components/Request/RequestService';

import { DocumentProvider } from '../../../Documents/ViewModel/DocumentProvider';

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
   * @param {object} config The UD-Viz config.
   * @param {object} config.server The server access config.
   * @param {string} config.server.url The server URL.
   * @param {string} config.server.document The route for documents.
   * @param {string} config.server.comment The route for comments.
   * @param {string} config.server.user The route for users.
   */
  constructor(documentProvider, requestService, config) {
    this.documentProvider = documentProvider;

    this.requestService = requestService;

    this.documentUrl = `${config.server.url}${config.server.document}`;
    this.commentRoute = config.server.comment;
    this.authorUrl = `${config.server.url}${config.server.user}`;
  }

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
