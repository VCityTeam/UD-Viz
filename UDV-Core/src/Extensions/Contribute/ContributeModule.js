import { DocumentModule } from "../../Modules/Documents/DocumentModule";
import { DocumentCreationWindow } from "./View/DocumentCreationWindow";
import { DocumentUpdateWindow } from "./View/DocumentUpdateWindow";
import { ContributeService } from "./Service/ContributeService";
import { RequestService } from "../../Utils/Request/RequestService";

/**
 * This module is used to manage the update and creation of documents. It holds
 * two windows that extend the document module.
 */
export class ContributeModule {
  /**
   * Constructs a new contribute module.
   * 
   * @param {DocumentModule} documentModule The document module.
   * @param {RequestService} requestService The request service.
   * @param {object} config The UDV config.
   * @param {object} config.server The server configuration.
   * @param {string} config.server.url The server url.
   * @param {string} config.server.document The base route for documents.
   */
  constructor(documentModule, requestService, config) {
    this.contributeService = new ContributeService(requestService,
      documentModule.provider, config)

    this.creationWindow = new DocumentCreationWindow(this.contributeService);
    this.updateWindow = new DocumentUpdateWindow(this.contributeService);

    documentModule.addDocumentWindow(this.creationWindow);
    documentModule.addDocumentWindow(this.updateWindow);
  }
}