import { RequestService } from '../../../../RequestService';
import { DocumentCommentsService } from './services/DocumentCommentsService';
import { DocumentCommentsWindow } from './views/DocumentCommentsWindow';
import { DocumentProvider } from '../Core/ViewModel/DocumentProvider';

/**
 * The class that represents the document comments module. It contains a
 * service that performs HTTP requests and a window that extends the interface
 * for documents.
 */
export class DocumentCommentsModule {
  /**
   * Creates the document comments module. Creates a service and a comments
   * window.
   *
   * @param {DocumentProvider} provider The document provider.
   * @param {RequestService} requestService The request service.
   * @param {object} configServer The server access config.
   * @param {string} configServer.url The server URL.
   * @param {string} configServer.document The route for documents.
   * @param {string} configServer.comment The route for comments.
   * @param {string} configServer.user The route for users.
   */
  constructor(provider, requestService, configServer) {
    this.service = new DocumentCommentsService(
      provider,
      requestService,
      configServer
    );

    this.commentsWindow = new DocumentCommentsWindow(this.service);

    provider.addEventListener(
      DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED,
      () => {
        this.commentsWindow.dispose();
      }
    );
  }
}
