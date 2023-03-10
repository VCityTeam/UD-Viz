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
    /** @type {HTMLElement} */
    this.rootHtml = document.createElement('div');

    /**
     * The search window.
     *
     * @type {DocumentNavigatorWindow}
     */
    this.navigatorWindow = new DocumentNavigatorWindow(provider);
    this.rootHtml.appendChild(this.navigatorWindow.html());

    /**
     * The inspector window.
     *
     * @type {DocumentInspectorWindow}
     */
    this.inspectorWindow = new DocumentInspectorWindow(provider);
    this.rootHtml.appendChild(this.inspectorWindow.html());

    /**
     * The document provider.
     *
     * @type {DocumentProvider}
     */
    this.provider = provider;
    this.provider.refreshDocumentList();
  }

  html() {
    return this.rootHtml;
  }

  dispose() {
    this.rootHtml.remove();
  }

  /**
   * Adds a new window to display information about documents. The document
   * provider is passed as parameter in this function.
   *
   * @param {AbstractDocumentWindow} newWindow The window to add.
   */
  addDocumentWindow(newWindow) {
    console.error('DEPRECATED');
    if (!(newWindow instanceof AbstractDocumentWindow)) {
      throw (
        'Only instances of AbstractDocumentWindow can be added to the ' +
        'document view'
      );
    }

    this.windows.push(newWindow);
    newWindow.setupDocumentWindow(this, this.provider);
  }

  /**
   * Request to show a specific document window.
   *
   * @param {AbstractDocumentWindow} windowToDisplay The window to show.
   * @param {boolean} [hideOtherWindows] Set to `true` to hide other document
   * windows.
   */
  requestWindowDisplay(windowToDisplay, hideOtherWindows = false) {
    console.error('DEPRECATED');
    const found =
      this.windows.findIndex((w) => w.windowId === windowToDisplay.windowId) >=
      0;
    if (!found) {
      throw 'Window must be registered first';
    }

    if (hideOtherWindows) {
      for (const window of this.windows) {
        if (window.isVisible) {
          this.hiddenWindows.push(window);
          window.hide();
        }
      }

      const listener = () => {
        windowToDisplay.removeEventListener(listener);
        for (const window of this.hiddenWindows) {
          window.show();
        }
        this.hiddenWindows = [];
      };

      windowToDisplay.addEventListener(Window.EVENT_DISABLED, listener);
    }

    windowToDisplay.show();
  }

  // ///////////////
  // /// MODULE VIEW

  // enableView() {
  //   for (const window of this.windows) {
  //     window.appendTo(this.parentElement);
  //   }
  //   this.provider.refreshDocumentList();
  // }

  // disableView() {
  //   this.hiddenWindows = [];
  //   for (const window of this.windows) {
  //     window.dispose();
  //   }
  // }
}
