import { DocumentModule } from "../../../Modules/Documents/DocumentModule";
import { ValidationService } from "../Service/ValidationService";
import { DocumentSource } from "../../../Modules/Documents/Model/DocumentFetcher";
import { DocumentsInValidationDocumentSource } from "../Service/DocumentsInValidationSource";
import { Document } from "../../../Modules/Documents/Model/Document";

/**
 * This class represents the visual elements and their logic for the
 * validation module :
 * 
 * - Button "See documents in validation" to change the document source
 * - Panel "Currently seing ..." to inform the user that he/she is consulting
 * documents in validation or validated documents
 * - Button "Validate" to validate a document
 */
export class ValidationView {
  /**
   * Creates the view.
   * 
   * @param {DocumentModule} documentModule The document module.
   * @param {ValidationService} validationService The validation service.
   * @param {DocumentsInValidationDocumentSource} validationSource The source
   * for documents in validation
   */
  constructor(documentModule, validationService, validationSource) {
    this.documentModule = documentModule;
    this.validationService = validationService;

    /**
     * Defines wether the interface displays documents to validate (`true`) or
     * validated documents (`false`).
     * 
     * @type {boolean}
     */
    this.displayingDocumentsToValidate = false;

    /**
     * Stores the previous document source to restore it (the source for
     * validated documents).
     * 
     * @type {DocumentSource}
     */
    this.previousDocumentSource = undefined;

    /**
     * The validation source.
     * 
     * @type {DocumentsInValidationDocumentSource}
     */
    this.validationSource = validationSource;

    // Adds a panel to inform the user about the documents he/she is currently
    // viewing.
    documentModule.addSearchWindowExtension('Validation State', {
      type: 'panel',
      html: `Currently seing:
        <span id="${this.validationStateId}">validated documents</span>`
    });

    // Adds a button to display the documents in validation
    documentModule.addSearchWindowExtension('Toggle Validation', {
      type: 'button',
      html: `Show
        <span id="${this.validateToggleId}">documents in validation</span>`,
      callback: () => this._toggleValidation()
    });
  }

  ///////////////////////////////////////
  ///// METHODS FOR TRIGERRING VALIDATION

  /**
   * Toggles the visualization of documents in validation, then refreshes the
   * document list with the new source. If the refresh fails (probably because
   * the user isn't logged in), reverts back to displaying validated documents.
   * 
   * @private
   */
  _toggleValidation() {
    this.displayingDocumentsToValidate = !this.displayingDocumentsToValidate;
    if (this.displayingDocumentsToValidate) {
      this._showDocumentsInValidation();
    } else {
      this._showValidatedDocuments()
    }

    this.documentModule.refreshDocumentList().then(() => {
    }, (reason) => {
      this._showValidatedDocuments();
      this.displayingDocumentsToValidate = !this.displayingDocumentsToValidate;
      alert(reason);
    });
  }

  /**
   * Sets the document source to be documents in validation, and adds a
   * 'Validate' button in the browser.
   * 
   * @private
   */
  _showDocumentsInValidation() {
    // Change the document source
    this.previousDocumentSource = this.documentModule
      .changeDocumentSource(this.validationSource, true);
    
    // Adds the validate button
    this.documentModule.addBrowserExtension('Validate', {
      type: 'button',
      html: 'Validate',
      callback: (doc) => this._validateDocument(doc)
    });

    this.validationToggleElement.innerText = 'validated documents';
    this.validateStateElement.innerText = 'documents in validation';
  }

  /**
   * Sets to document source to validated documents, and removes the 'Validate'
   * button in the browser.
   * 
   * @private
   */
  _showValidatedDocuments() {
    this.documentModule.changeDocumentSource(this.previousDocumentSource,
      false);

    this.documentModule.removeBrowserExtension('Validate');

    this.validationToggleElement.innerText = 'documents in validation';
    this.validateStateElement.innerText = 'validated documents';
  }

  /**
   * Validates the document.
   * 
   * @private
   * 
   * @param {Document} doc The document to validate.
   */
  _validateDocument(doc) {
    if (!confirm('Are you sure do validate this document ? ' +
      'This operation is irreversible.')) {
      return;
    }
    this.validationService.validate(doc).catch((reason) => {
      alert(reason.statusText);
    }).then(() => {
      this.documentModule.refreshDocumentList();
    });
  }

  /////////////
  ///// GETTERS

  get validationStateId() {
    return 'document-validation-view-state';
  }
  
  get validateStateElement() {
    return document.getElementById(this.validationStateId);
  }

  get validateToggleId() {
    return 'document-validation-view-toggle';
  }
  
  get validationToggleElement() {
    return document.getElementById(this.validateToggleId);
  }
}