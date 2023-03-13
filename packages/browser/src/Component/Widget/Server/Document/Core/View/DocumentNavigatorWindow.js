import { DocumentProvider } from '../ViewModel/DocumentProvider';
import { Document } from '../Model/Document';
import { DocumentSearchFilter } from '../ViewModel/DocumentSearchFilter';
import { findChildByID } from '../../../../../HTMLUtil';

/**
 * @typedef {object} DocumentNavigatorExtension
 * @property {string} type 'panel | 'button'
 * @property {string} [container] The container
 * @property {string} id ID
 * @property {import('../DocumentModule').cbNavigatorOptionsExtension} callback Callback on extension options
 */
/**
 * @class Represents the navigator window for the documents. It contains the filters on
 * the fields of a document.
 */
export class DocumentNavigatorWindow {
  /**
   * Creates a document navigator window.
   */
  constructor(provider) {
    this.provider = provider;

    /** @type {HTMLElement} */
    this.rootHtml = document.createElement('div');
    this.rootHtml.innerHTML = this.innerContentHtml;

    /**
     * The filter corresponding to the research fields.
     *
     * @type {DocumentSearchFilter}
     */
    this.searchFilter = new DocumentSearchFilter();

    /**
     * Represents a list of extensions. An extension can either be a button or
     * a panel.
     *
     * @type {Object<string, DocumentNavigatorExtension>}
     */
    this.extensions = {};

    // Add extensions
    for (const extension of Object.values(this.extensions)) {
      this._createExtensionElement(extension);
    }

    // init callbacks
    this.inputFormElement.onsubmit = () => {
      this.search();
      return false;
    };
    this.clearButtonElement.onclick = () => {
      this.clear();
    };

    this.provider.addFilter(this.searchFilter);

    this.provider.addEventListener(
      DocumentProvider.EVENT_FILTERED_DOCS_UPDATED,
      (documents) => this._onFilteredDocumentsUpdate(documents)
    );
    this.provider.addEventListener(
      DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED,
      (doc) => this._onDisplayedDocumentChange(doc)
    );
  }

  html() {
    return this.rootHtml;
  }

  dispose() {
    this.rootHtml.remove();
  }

  get innerContentHtml() {
    return /* html*/ `
      <div class="box-section">
        <h3 class="section-title">
          <span id="${this.docCountId}"></span> Document(s)
        </h3>
        <div class="documents-list">
          <ul id="${this.documentListId}">

          </ul>
        </div>
        <div data-ext-container-default="button">

        </div>
      </div>
      <div class="box-section">
        <input type="checkbox" class="spoiler-check" id="doc-filters-spoiler">
        <label for="doc-filters-spoiler" class="section-title">Filters</label>
        <div class="spoiler-box" id="${this.inputFormId}">
          <div data-ext-container="filter">

          </div>
          <input type="checkbox" class="spoiler-check" id="doc-search-spoiler">
          <label for="doc-search-spoiler" class="subsection-title">Attributes</label>
          <form class="search-form spoiler-box" id="${this.inputFormId}">
            <label for="${this.inputKeywordsId}">Keywords</label>
            <input type="text" id="${this.inputKeywordsId}">
            <label for="${this.inputPubDateStartId}">Publication date</label>
            <div class="date-wrapper">
              <span>From</span><input type="date" id="${this.inputPubDateStartId}"><br>
              <span>To</span><input type="date" id="${this.inputPubDateEndId}">
            </div>
            <label for="${this.inputRefDateStartId}">Refering date</label>
            <div class="date-wrapper">
              <span>From</span><input type="date" id="${this.inputRefDateStartId}"><br>
              <span>To</span><input type="date" id="${this.inputRefDateEndId}">
            </div>
            <label for="${this.inputSourceId}">Source</label>
            <input type="text" id="${this.inputSourceId}">
            <label for="${this.inputRightsHolderId}">Rights holder</label>
            <input type="text" id="${this.inputRightsHolderId}">
            <hr>
            <input type="submit" value="Filter">
            <button id="${this.clearButtonId}">Clear</button>
          </form>
        </div>
      </div>
      <div data-ext-container="bottom" data-ext-container-default="div">
      
      </div>
    `;
  }

  // ////////////////////////////
  // /// DOCUMENT UPDATE TRIGGERS

  /**
   * Callback triggered when the list of filtered documents changes.
   *
   * @private
   * @param {Array<Document>} documents The new array of filtered documents.
   */
  _onFilteredDocumentsUpdate(documents) {
    const list = this.documentListElement;
    list.innerHTML = '';
    for (const doc of documents) {
      const item = document.createElement('li');
      item.innerHTML = /* html*/ `
        <div class='doc-title'>${doc.title}</div>
        <div class='doc-info'>Refering ${new Date(
          doc.refDate
        ).toLocaleDateString()}</div>
      `;
      item.classList.add('navigator-result-doc');
      item.onclick = () => {
        this.provider.setDisplayedDocument(doc);
      };
      list.appendChild(item);
    }
    this.docCountElement.innerHTML = documents.length;
  }

  /**
   * Callback triggered when the displayed document changes.
   *
   * @private
   * @param {Document} document The new displayed documents.
   */
  _onDisplayedDocumentChange(document) {
    const previouslySelected =
      this.documentListElement.querySelector('.document-selected');
    if (previouslySelected) {
      previouslySelected.classList.remove('document-selected');
    }
    if (document) {
      const newIndex = this.provider.getDisplayedDocumentIndex();
      const newSelected = this.documentListElement.querySelector(
        `li:nth-child(${newIndex + 1})`
      );
      newSelected.classList.add('document-selected');
    }
  }

  // //////////////////////
  // /// SEARCH AND FILTERS

  /**
   * Event on the 'search' button click.
   */
  async search() {
    const keywords = this.inputKeywordsElement.value
      .split(/[ ,;]/)
      .filter((k) => k !== '')
      .map((k) => k.toLowerCase());
    this.searchFilter.keywords = keywords;

    const source = this.inputSourceElement.value.toLowerCase();
    this.searchFilter.source = source !== '' ? source : undefined;

    const rightsHolder = this.inputRightsHolderElement.value.toLowerCase();
    this.searchFilter.rightsHolder =
      rightsHolder !== '' ? rightsHolder : undefined;

    const pubStartDate = this.inputPubDateStartElement.value;
    this.searchFilter.pubStartDate = pubStartDate
      ? new Date(pubStartDate)
      : undefined;

    const pubEndDate = this.inputPubDateEndElement.value;
    this.searchFilter.pubEndDate = pubEndDate
      ? new Date(pubEndDate)
      : undefined;

    const refStartDate = this.inputRefDateStartElement.value;
    this.searchFilter.refStartDate = refStartDate
      ? new Date(refStartDate)
      : undefined;

    const refEndDate = this.inputRefDateEndElement.value;
    this.searchFilter.refEndDate = refEndDate
      ? new Date(refEndDate)
      : undefined;

    this.provider.refreshDocumentList();
  }

  /**
   * Clears the research fields.
   */
  clear() {
    this.inputSourceElement.value = '';
    this.inputRightsHolderElement.value = '';
    this.inputKeywordsElement.value = '';
    this.inputRefDateEndElement.value = '';
    this.inputRefDateStartElement.value = '';
    this.inputPubDateEndElement.value = '';
    this.inputPubDateStartElement.value = '';
    this.provider.refreshDocumentList();
  }

  // //////////
  // // GETTERS

  get inputFormId() {
    return `document_navigator_form`;
  }

  get inputFormElement() {
    return findChildByID(this.rootHtml, this.inputFormId);
  }

  get clearButtonId() {
    return `document_navigator_button_clear`;
  }

  get clearButtonElement() {
    return findChildByID(this.rootHtml, this.clearButtonId);
  }

  get documentListId() {
    return `document_navigator_document_list`;
  }

  get documentListElement() {
    return findChildByID(this.rootHtml, this.documentListId);
  }

  get inputKeywordsId() {
    return `document_navigator_input_Keywords`;
  }

  get inputKeywordsElement() {
    return findChildByID(this.rootHtml, this.inputKeywordsId);
  }

  get inputSourceId() {
    return `document_navigator_input_Source`;
  }

  get inputSourceElement() {
    return findChildByID(this.rootHtml, this.inputSourceId);
  }

  get inputRightsHolderId() {
    return `document_navigator_rights_holder`;
  }

  get inputRightsHolderElement() {
    return findChildByID(this.rootHtml, this.inputRightsHolderId);
  }

  get inputPubDateStartId() {
    return `document_navigator_input_Publication`;
  }

  get inputPubDateStartElement() {
    return findChildByID(this.rootHtml, this.inputPubDateStartId);
  }

  get inputPubDateEndId() {
    return `document_navigator_input_Publication_End`;
  }

  get inputPubDateEndElement() {
    return findChildByID(this.rootHtml, this.inputPubDateEndId);
  }

  get inputRefDateStartId() {
    return `document_navigator_input_Reference`;
  }

  get inputRefDateStartElement() {
    return findChildByID(this.rootHtml, this.inputRefDateStartId);
  }

  get inputRefDateEndId() {
    return `document_navigator_input_Reference_End`;
  }

  get inputRefDateEndElement() {
    return findChildByID(this.rootHtml, this.inputRefDateEndId);
  }

  get docCountId() {
    return `document_navigator_doc_count`;
  }

  get docCountElement() {
    return findChildByID(this.rootHtml, this.docCountId);
  }
}
