import { Window } from "../../../Utils/GUI/js/Window";
import { DocumentProvider } from "../ViewModel/DocumentProvider";
import { Document } from "../Model/Document";
import { DocumentFilter } from "../ViewModel/DocumentFilter";

/**
 * Represents the search window for the documents. It contains the filters on
 * the fields of a document.
 */
export class DocumentSearchWindow extends Window {
  /**
   * Creates a document search window.
   * 
   * @param {DocumentProvider} provider The document provider.
   */
  constructor(provider) {
    super('document2-search', 'Document - Search', true);

    /**
     * The document provider.
     * 
     * @type {DocumentProvider}
     */
    this.provider = provider;

    this.provider.addFilter(new DocumentFilter(this.filterDocument.bind(this)));

    this.provider.addEventListener(DocumentProvider.DOCUMENT_LIST_UPDATED,
      (documents) => this.onFilteredDocumentsUpdate(documents));
  }

  get innerContentHtml() {
    return /*html*/`
      <div>
        <button id="${this.searchButtonId}">Filter</button>
      </div>
      <div>
        <h3>Documents</h3>
        <ul id="${this.documentListId}">

        </ul>
      </div>
    `;
  }

  windowCreated() {
    this.searchButtonElement.onclick = () => {
      this.search();
    };
  }

  //////////////////////////////
  ///// DOCUMENT UPDATE TRIGGERS

  /**
   * Callback triggered when the list of filtered documents changes.
   * 
   * @param {Array<Document>} documents The new array of filtered documents.
   */
  onFilteredDocumentsUpdate(documents) {
    let list = this.documentListElement;
    for (let doc of documents) {
      let item = document.createElement('li');
      item.innerHTML = doc.title;
      list.appendChild(item);
    }
  }


  ////////////////////////
  ///// SEARCH AND FILTERS
  
  /**
   * The filter function to use on the fetched documents, depending on the
   * fields.
   * 
   * @param {Document} doc The document to filter.
   */
  filterDocument(doc) {
    return doc.title.startsWith('P');
  }

  /**
   * Event on the 'search' button click.
   */
  async search() {
    this.provider.refreshDocumentList();
  }

  ////////////
  //// GETTERS

  get searchButtonId() {
    return `${this.windowId}_button_search`;
  }

  get searchButtonElement() {
    return document.getElementById(this.searchButtonId);
  }

  get documentListId() {
    return `${this.windowId}_document_list`;
  }

  get documentListElement() {
    return document.getElementById(this.documentListId);
  }
}