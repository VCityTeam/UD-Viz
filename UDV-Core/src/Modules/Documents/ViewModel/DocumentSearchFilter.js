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
    this.subject = undefined;
    this.pubStartDate = undefined;
    this.pubEndDate = undefined;
    this.refStartDate = undefined;
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