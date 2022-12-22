import { DocumentModule } from '../Documents/DocumentModule';
import { RequestService } from '../Component/RequestService';
import { DocumentCreationWindow } from './View/DocumentCreationWindow';
import { DocumentUpdateWindow } from './View/DocumentUpdateWindow';
import { ContributeService } from './Service/ContributeService';
import { DocumentDeletionInterface } from './View/DocumentDeletionInterface';

/**
 * This module is used to manage the update, deletion and creation of documents.
 * It holds two windows that extend the document module, and creates a button
 * for the document deletion.
 */
export class ContributeModule {
  /**
   * Constructs a new contribute module.
   *
   * @param {DocumentModule} documentModule The document module.
   * @param {DocumentImageOrienter} documentImageOrienter The document image
   * orienter module.
   * @param {RequestService} requestService The request service.
   * @param {*} itownsView The iTowns view.
   * @param {*} cameraControls The planar camera controls.
   * @param {object} configServer The server configuration.
   * @param {string} configServer.url The server url.
   * @param {string} configServer.document The base route for documents.
   */
  constructor(
    documentModule,
    documentImageOrienter,
    requestService,
    itownsView,
    cameraControls,
    configServer
  ) {
    this.contributeService = new ContributeService(
      requestService,
      documentModule.provider,
      configServer
    );

    this.creationWindow = new DocumentCreationWindow(
      this.contributeService,
      itownsView,
      cameraControls,
      documentImageOrienter
    );
    this.updateWindow = new DocumentUpdateWindow(
      this.contributeService,
      documentModule
    );
    this.deletionWindow = new DocumentDeletionInterface(
      documentModule,
      this.contributeService
    );

    documentModule.addDocumentWindow(this.creationWindow);
    documentModule.addDocumentWindow(this.updateWindow);
  }
}
