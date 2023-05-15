import { RequestService } from '../../../../RequestService';
import { DocumentCreationWindow } from './View/DocumentCreationWindow';
import { DocumentUpdateWindow } from './View/DocumentUpdateWindow';
import { ContributeService } from './Service/ContributeService';
import { DocumentVisualizerWindow } from '../Visualizer/View/DocumentVisualizerWindow';

/**
 * This module is used to manage the update, deletion and creation of documents.
 * It holds two windows that extend the document module, and creates a button
 * for the document deletion.
 */
export class ContributeModule {
  /**
   * Constructs a new contribute module.
   *
   * @param {object} provider The document provider.
   * @param {DocumentVisualizerWindow} documentVisualizer The document image
   * orienter module.
   * @param {RequestService} requestService The request service.
   * @param {*} itownsView The iTowns view.
   * @param {*} cameraControls The planar camera controls.
   * @param {object} configServer The server configuration.
   * @param {string} configServer.url The server url.
   * @param {string} configServer.document The base route for documents.
   * @param {HTMLElement} parentElementVisualizer - parent element of the visualizer html
   */
  constructor(
    provider,
    documentVisualizer,
    requestService,
    itownsView,
    cameraControls,
    configServer,
    parentElementVisualizer
  ) {
    this.contributeService = new ContributeService(
      requestService,
      provider,
      configServer
    );

    this.creationWindow = new DocumentCreationWindow(
      this.contributeService,
      itownsView,
      cameraControls,
      documentVisualizer,
      parentElementVisualizer
    );

    this.updateWindow = new DocumentUpdateWindow(
      this.contributeService,
      provider
    );
  }
}
