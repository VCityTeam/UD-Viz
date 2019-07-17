import { DocumentFilter } from "./DocumentFilter";
import { Document } from "../Model/Document";

export class DocumentSearchFilter extends DocumentFilter {
  constructor() {
    super((doc) => this.filterDocument(doc));

    /**
     * A list of keywords to search in the title or the description of the
     * document. These keywords should be in lowercase.
     * 
     * @type {Array<string>}
     */
    this.keywords = [];

    /**
     * A string representing the subject. Should be in lowercase.
     * 
     * @type {string}
     */
    this.subject = undefined;

    /**
     * The lower bound of the publication date.
     * 
     * @type {Date}
     */
    this.pubStartDate = undefined;

    /**
     * The upper bound of the publication date.
     * 
     * @type {Date}
     */
    this.pubEndDate = undefined;

    /**
     * The lower bound of the refering date.
     * 
     * @type {Date}
     */
    this.refStartDate = undefined;

    /**
     * The upper bound of the refering date.
     * 
     * @type {Date}
     */
    this.refEndDate = undefined;
  }

  /**
   * The function to filter the documents.
   * 
   * @param {Document} doc The document to filter.
   */
  filterDocument(doc) {
    if (this.keywords.length > 0) {
      for (let keyword of this.keywords) {
        if (!doc.title.toLowerCase().includes(keyword) &&
          !doc.description.toLowerCase().includes(keyword)) {
          return false;
        }
      }
    }

    if (!!this.subject && this.subject !== doc.subject.toLowerCase()) {
      return false;
    }

    if (!!this.pubStartDate && !(this.pubStartDate <= new Date(doc.publicationDate))) {
      return false;
    }

    if (!!this.pubEndDate && !(this.pubEndDate >= new Date(doc.publicationDate))) {
      return false;
    }

    if (!!this.refStartDate && !(this.refStartDate <= new Date(doc.refDate))) {
      return false;
    }

    if (!!this.refEndDate && !(this.refEndDate >= new Date(doc.refDate))) {
      return false;
    }
    
    return true;
  }

  /**
   * Clears the filter.
   */
  clear() {
    this.keywords = [];
    this.subject = undefined;
    this.pubStartDate = undefined;
    this.pubEndDate = undefined;
    this.refStartDate = undefined;
    this.refEndDate = undefined;
  }
}