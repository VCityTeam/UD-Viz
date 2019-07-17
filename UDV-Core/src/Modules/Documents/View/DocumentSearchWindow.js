import { DocumentProvider } from "../ViewModel/DocumentProvider";
import { Document } from "../Model/Document";
import { DocumentSearchFilter } from "../ViewModel/DocumentSearchFilter";
import { AbstractDocumentWindow } from "./AbstractDocumentWindow";

/**
 * Represents the search window for the documents. It contains the filters on
 * the fields of a document.
 */
export class DocumentSearchWindow extends AbstractDocumentWindow {
  /**
   * Creates a document search window.
   */
  constructor() {
    super('Search');

    /**
     * The filter corresponding to the research fields.
     * 
     * @type {DocumentSearchFilter}
     */
    this.searchFilter = new DocumentSearchFilter();
  }

  get innerContentHtml() {
    return /*html*/`
      <div class="box-section">
        <input type="checkbox" class="spoiler-check" id="doc-search-spoiler">
        <label for="doc-search-spoiler" class="section-title">Filters</label>
        <form class="search-form spoiler-box" id="${this.inputFormId}">
          <label for="${this.inputKeywordsId}">Keywords</label>
          <input type="text" id="${this.inputKeywordsId}">
          <label for="${this.inputSubjectId}">Subject</label>
          <select id="${this.inputSubjectId}">
            <option value="">All subjects</option>
            <option value="Architecture">Architecture</option>
            <option value="Tourism">Tourism</option>
            <option value="Urbanism">Urbanism</option>
          </select>
          <label for="${this.inputPubDateStartId}">Publication date</label>
          From <input type="date" id="${this.inputPubDateStartId}">
          To <input type="date" id="${this.inputPubDateEndId}">
          <label for="${this.inputRefDateStartId}">Refering date</label>
          From <input type="date" id="${this.inputRefDateStartId}">
          To <input type="date" id="${this.inputRefDateEndId}">
          <input type="submit" value="Filter">
          <button id="${this.clearButtonId}">Clear</button>
        </form>
      </div>
      <div class="box-section">
        <h3 class="section-title">
          <span id="${this.docCountId}"></span> Document(s)
        </h3>
        <div class="documents-list">
          <ul id="${this.documentListId}">

          </ul>
        </div>
      </div>
    `;
  }

  windowCreated() {
    this.window.style.width = '270px';
    this.window.style.top = '10px';
    this.window.style.left = '10px';

    this.inputFormElement.onsubmit = () => {
      this.search();
      return false;
    };
    this.clearButtonElement.onclick = () => {
      this.clear();
    };
  }

  documentWindowReady() {
    this.provider.addFilter(this.searchFilter);

    this.provider.addEventListener(DocumentProvider.EVENT_FILTERED_DOCS_UPDATED,
      (documents) => this.onFilteredDocumentsUpdate(documents));
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
    list.innerHTML = '';
    for (let doc of documents) {
      let item = document.createElement('li');
      item.innerHTML = doc.title;
      item.classList.add('clickable-text')
      item.onclick = () => {
        this.provider.setDisplayedDocument(doc);
      };
      list.appendChild(item);
    }
    this.docCountElement.innerHTML = documents.length;
  }


  ////////////////////////
  ///// SEARCH AND FILTERS
  
  /**
   * Event on the 'search' button click.
   */
  async search() {
    let keywords = this.inputKeywordsElement.value.split(/[ ,;]/)
      .filter((k) => k !== "").map((k) => k.toLowerCase());
    this.searchFilter.keywords = keywords;

    let subject = this.inputSubjectElement.value.toLowerCase();
    this.searchFilter.subject = (subject !== "") ? subject : undefined;

    let pubStartDate = this.inputPubDateStartElement.value;
    this.searchFilter.pubStartDate = (!!pubStartDate) ? new Date(pubStartDate)
      : undefined;

    let pubEndDate = this.inputPubDateEndElement.value;
    this.searchFilter.pubEndDate = (!!pubEndDate) ? new Date(pubEndDate)
      : undefined;

    let refStartDate = this.inputRefDateStartElement.value;
    this.searchFilter.refStartDate = (!!refStartDate) ? new Date(refStartDate)
      : undefined;

    let refEndDate = this.inputRefDateEndElement.value;
    this.searchFilter.refEndDate = (!!refEndDate) ? new Date(refEndDate)
      : undefined;

    this.provider.refreshDocumentList();
  }

  /**
   * Clears the research fields.
   */
  clear() {
    this.inputSubjectElement.value = '';
    this.inputKeywordsElement.value = '';
    this.inputRefDateEndElement.value = '';
    this.inputRefDateStartElement.value = '';
    this.inputPubDateEndElement.value = '';
    this.inputPubDateStartElement.value = '';
    this.provider.refreshDocumentList();
  }

  ////////////
  //// GETTERS

  get inputFormId() {
    return `${this.windowId}_form`;
  }

  get inputFormElement() {
    return document.getElementById(this.inputFormId);
  }

  get clearButtonId() {
    return `${this.windowId}_button_clear`;
  }

  get clearButtonElement() {
    return document.getElementById(this.clearButtonId);
  }

  get documentListId() {
    return `${this.windowId}_document_list`;
  }

  get documentListElement() {
    return document.getElementById(this.documentListId);
  }

  get inputKeywordsId() {
    return `${this.windowId}_input_Keywords`;
  }

  get inputKeywordsElement() {
    return document.getElementById(this.inputKeywordsId);
  }

  get inputSubjectId() {
    return `${this.windowId}_input_Subject`;
  }

  get inputSubjectElement() {
    return document.getElementById(this.inputSubjectId);
  }

  get inputPubDateStartId() {
    return `${this.windowId}_input_Publication`;
  }

  get inputPubDateStartElement() {
    return document.getElementById(this.inputPubDateStartId);
  }

  get inputPubDateEndId() {
    return `${this.windowId}_input_Publication_End`;
  }

  get inputPubDateEndElement() {
    return document.getElementById(this.inputPubDateEndId);
  }

  get inputRefDateStartId() {
    return `${this.windowId}_input_Reference`;
  }

  get inputRefDateStartElement() {
    return document.getElementById(this.inputRefDateStartId);
  }

  get inputRefDateEndId() {
    return `${this.windowId}_input_Reference_End`;
  }

  get inputRefDateEndElement() {
    return document.getElementById(this.inputRefDateEndId);
  }

  get docCountId() {
    return `${this.windowId}_doc_count`;
  }

  get docCountElement() {
    return document.getElementById(this.docCountId);
  }
}