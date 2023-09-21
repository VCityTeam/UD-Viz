import { Document } from '../Model/Document';

/**
 * A filter for documents. It is essentially a function that determines if a
 * document is acceptable or not.
 */

/**
 * @callback cbAccepts
 * @param {Document} document
 * @returns {boolean} True if accepted
 */

/**
 * @class
 */
export class DocumentFilter {
  /**
   * Constructs a new document filter, from an acceptation function.
   *
   * @param {cbAccepts} accepts The function responsible to filter
   * the documents. It must evaluate wether a document is acceptable according
   * to the filter.
   */
  constructor(accepts) {
    /**
     * The function responsible to filter the documents. It must evaluate wether
     * a document is acceptable according to the filter.
     *
     * @type {cbAccepts}
     */
    this.accepts = accepts;
  }

  /**
   * Applies the filter to the documents.
   *
   * @param {Array<Document>} documents The documents to filter.
   * @returns {Array<Document>} An array of filtered documents
   */
  apply(documents) {
    const filtered = documents.filter(this.accepts);
    return filtered;
  }
}
