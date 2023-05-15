import { DocumentProvider } from '../ViewModel/DocumentProvider';
import { DocumentNavigatorWindow } from './DocumentNavigatorWindow';
import { DocumentInspectorWindow } from './DocumentInspectorWindow';

import './DocumentWindow.css';

/**
 * The entry point of the document view. It holds the two main windows, inspector
 * and search. It also accepts instances of `AbstractDocumentWindow` as
 * extension windows.
 */
export class DocumentView {
  /**
   * Creates a document view.
   *
   * @param {DocumentProvider} provider The document provider.
   */
  constructor(provider) {
    /**
     * The search window.
     *
     * @type {DocumentNavigatorWindow}
     */
    this.navigatorWindow = new DocumentNavigatorWindow(provider);

    /**
     * The inspector window.
     *
     * @type {DocumentInspectorWindow}
     */
    this.inspectorWindow = new DocumentInspectorWindow(provider);

    /**
     * The document provider.
     *
     * @type {DocumentProvider}
     * @todo this ref is still relevant ?
     */
    this.provider = provider;
  }
}
