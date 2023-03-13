import { RequestService } from '../../../../RequestService';
import { DocumentService, DocumentSource } from './Model/DocumentService';
import { DocumentProvider } from './ViewModel/DocumentProvider';
import { DocumentView } from './View/DocumentView';

/**
 * The entry point of the documents module.
 */
export class DocumentModule {
  /**
   * Creates a new documents module.
   *
   * @param {RequestService} requestService The request service.
   * @param {object} config The configuration of UD-Viz.
   * @param {object} config.server The server configuration.
   * @param {string} config.server.url The server url.
   * @param {string} config.server.document The base route for documents.
   * @param {string} config.server.file The route for document files.
   */
  constructor(requestService, config) {
    /**
     * The document service holds the list of documents fetched from the
     * server.
     *
     * @type {DocumentService}
     */
    this.service = new DocumentService(requestService, config);

    /**
     * The document provider filters the list of documents.
     *
     * @type {DocumentProvider}
     */
    this.provider = new DocumentProvider(this.service);

    /**
     * The document view represents the user interface for the documents.
     *
     * @type {DocumentView}
     */
    this.view = new DocumentView(this.provider);
  }

  /**
   * Changes the document source (the object representing the server URLs
   * to fetch the documents).
   *
   * @param {DocumentSource} newSource The new document source.
   * @param {boolean} [authenticate] Specifies wether authentication should be
   * used for the document fetch requests.
   * @returns {DocumentSource} The previous document source.
   */
  changeDocumentSource(newSource, authenticate) {
    return this.provider.service.setSource(newSource, authenticate);
  }

  /**
   * Adds a filter to the filtering pipeline.
   *
   * @param {import('./ViewModel/DocumentFilter').DocumentFilter} filter The new filter to add.
   */
  addFilter(filter) {
    this.provider.addFilter(filter);
  }

  /**
   * @callback cbAction
   * @param {any} data
   * @returns {any}
   */
  /**
   * Adds an event listener to the document provider. There are two types
   * of events :
   * - `DocumentModule.EVENT_FILTERED_DOCUMENTS_UPDATED` fires when the list
   * of filtered documents changes
   * - `DocumentModule.EVENT_DISPLAYED_DOC_CHANGED` fires when the displayed
   * document changes.
   *
   * @param {string} event The event to register. Can only be
   * `DocumentModule.EVENT_FILTERED_DOCS_UPDATED` or
   * `DocumentModule.EVENT_DISPLAYED_DOC_CHANGED`
   * @param {cbAction} action The listener.
   */
  addEventListener(event, action) {
    this.provider.addEventListener(event, action);
  }

  /**
   * Removes an event listener from the document provider.
   *
   * @param {cbAction} action The listener to remove.
   */
  removeEventListener(action) {
    this.provider.removeEventListener(action);
  }

  static get EVENT_FILTERED_DOCS_UPDATED() {
    return DocumentProvider.EVENT_FILTERED_DOCS_UPDATED;
  }

  static get EVENT_DISPLAYED_DOC_CHANGED() {
    return DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED;
  }

  /**
   * Updates the filtered documents list by fetching them from the
   * `DocumentService` and applying the successive filters. Triggers the
   * `DOCUMENT_LIST_UPDATED` and then the `DISPLAYED_DOCUMENT_CHANGED` events.
   */
  async refreshDocumentList() {
    await this.provider.refreshDocumentList();
  }
}
