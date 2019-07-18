import { AbstractDocumentWindow } from "../../../Modules/Documents/View/AbstractDocumentWindow";

export class DocumentCreationWindow extends AbstractDocumentWindow {
  /**
   * Creates a new document creation window.
   */
  constructor() {
    super('Creation');
  }

  get innerContentHtml() {
    return /*html*/`

    `;
  }

  windowCreated() {
    this.hide();
  }

  documentWindowReady() {
    this.view.browserWindow.addDocumentCommand('Create', () => {
      this.view.requestWindowDisplay(this, true);
    });
  }
}