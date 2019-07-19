import { DocumentCommentsService } from "./services/DocumentCommentsService";
import { DocumentModule } from "../../Modules/Documents/DocumentModule";
import { RequestService } from "../../Utils/Request/RequestService";
import { DocumentCommentsWindow } from "./views/DocumentCommentsWindow";

/**
 * The class that represents the document comments module. It contains a
 * service that performs HTTP requests and a window that extends the interface
 * for documents.
 */
export class DocumentComments {
  /**
   * Creates the document comments module. Creates a service and a comments
   * window.
   * 
   * @param {DocumentModule} documentModule The document module.
   * @param {RequestService} requestService The request service.
   * @param {object} config The UDV config.
   * @param {object} config.server The server access config.
   * @param {string} config.server.url The server URL.
   * @param {string} config.server.document The route for documents.
   * @param {string} config.server.comment The route for comments.
   * @param {string} config.server.user The route for users.
   */
  constructor(documentModule, requestService, config) {
    this.service = new DocumentCommentsService(documentModule.provider, requestService, config);

    this.commentsWindow = new DocumentCommentsWindow(this.service);

    documentModule.addDocumentWindow(this.commentsWindow);
  }
}