import { DocumentSource } from '../../Core/Model/DocumentService';
import { ValidationService } from '../Service/ValidationService';
import { DocumentsInValidationDocumentSource } from '../Service/DocumentsInValidationSource';

import { findChildByID } from '../../../../../HTMLUtil';

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
   * @param {object} provider The document module.
   * @param {ValidationService} validationService The validation service.
   * @param {DocumentsInValidationDocumentSource} validationSource The source
   * for documents in validation
   * @param {HTMLElement} parentElementValidateButton Where to add the validate button
   */
  constructor(
    provider,
    validationService,
    validationSource,
    parentElementValidateButton
  ) {
    this.domElement = document.createElement('div');
    this.domElement.innerHTML = `
        <label for="${this.switchId}">Validation status : </label>
        <select id="${this.switchId}">
          <option value="validated">Validated documents</option>
          <option value="in-validation">Documents in validation</option>
        </select>
      `;

    this.parentElementValidateButton = parentElementValidateButton;

    this.validateButton = null;

    this.provider = provider;

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

    this.switchElement.value = 'validated';
    this._toggleValidation();
    this.switchElement.onchange = () => {
      this._toggleValidation();
    };
  }

  // /////////////////////////////////////
  // /// METHODS FOR TRIGERRING VALIDATION

  /**
   * Toggles the visualization of documents in validation, then refreshes the
   * document list with the new source. If the refresh fails (probably because
   * the user isn't logged in), reverts back to displaying validated documents.
   *
   * @private
   */
  _toggleValidation() {
    this.displayingDocumentsToValidate =
      this.switchElement.value === 'in-validation';
    if (this.displayingDocumentsToValidate) {
      this._showDocumentsInValidation();
    } else {
      this._showValidatedDocuments();
    }

    this.provider.refreshDocumentList().then(
      () => {},
      (reason) => {
        this._showValidatedDocuments();
        this.displayingDocumentsToValidate = false;
        this.switchElement.value = 'validated';
        alert(reason);
      }
    );
  }

  /**
   * Sets the document source to be documents in validation, and adds a
   * 'Validate' button in the browser.
   *
   * @private
   */
  _showDocumentsInValidation() {
    // Change the document source
    this.previousDocumentSource = this.provider.service.setSource(
      this.validationSource,
      true
    );

    this.validateButton = document.createElement('button');
    this.validateButton.innerHTML = 'Validate';
    this.validateButton.onclick = () => this._validateDocument();
    this.parentElementValidateButton.appendChild(this.validateButton);
  }

  /**
   * Sets to document source to validated documents, and removes the 'Validate'
   * button in the browser.
   *
   * @private
   */
  _showValidatedDocuments() {
    if (!this.previousDocumentSource) {
      return;
    }

    this.provider.service.setSource(this.previousDocumentSource, false);

    try {
      // this.documentModule.removeBrowserExtension('Validate');
      this.validateButton.remove();
    } catch (_) {
      // Validate does not exist
    }
  }

  /**
   * Validates the document.
   *
   * @private
   */
  _validateDocument() {
    if (
      !confirm(
        'Are you sure do validate this document ? ' +
          'This operation is irreversible.'
      )
    ) {
      return;
    }
    this.validationService
      .validate(this.provider.getDisplayedDocument())
      .catch((reason) => {
        alert(reason.statusText);
      })
      .then(() => {
        this.provider.refreshDocumentList();
      });
  }

  // ///////////
  // /// GETTERS

  get switchId() {
    return 'document-validation-view-switch';
  }

  get switchElement() {
    return findChildByID(this.domElement, this.switchId);
  }
}
