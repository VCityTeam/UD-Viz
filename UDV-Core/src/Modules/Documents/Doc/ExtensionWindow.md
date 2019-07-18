# Creating an extension window for documents

> This documentation is still being written !!

Below is a base code for a document window extension :

```js
export class DocumentExtension extends AbstractDocumentWindow {
  /**
   * Creates a new document extension.
   * 
   * @param {DocumentModule} documentModule The document module.
   */
  constructor(documentModule) {
    super('Extension Name');

    // Add the image orienter as a document window
    documentModule.addDocumentWindow(this);

    // Create a command (button) to display the window
    documentModule.addDisplayedDocumentCommand('My Extension', () => {
      this.view.requestWindowDisplay(this);
    });
  }

  get html() {
    return /*html*/`

    `;
  }

  windowCreated() {
    this.hide();
  }

  documentWindowReady() {
    // Add listeners for document changes
    this.provider.addEventListener(DocumentProvider.EVENT_FILTERED_DOCS_UPDATED,
      (docs) => {});
    this.provider.addEventListener(DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED,
      (doc) => {});
  }
}
```