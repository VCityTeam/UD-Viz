import { DocumentProvider } from '../ViewModel/DocumentProvider';
import { Document } from '../Model/Document';
import { DocumentSearchFilter } from '../ViewModel/DocumentSearchFilter';
import {
  createDateIntervalInput,
  createDisplayable,
  createLabelInput,
} from '../../../../../HTMLUtil';

/**
 * @class Represents the navigator window for the documents. It contains the filters on
 * the fields of a document.
 */
export class DocumentNavigatorWindow {
  constructor(provider) {
    this.provider = provider;

    /** @type {HTMLElement} */
    this.rootHtml = null;

    /** @type {HTMLElement} */
    this.documentListContainer = null;

    /** @type {HTMLElement} */
    this.docCountElement = null;

    /** @type {HTMLElement} */
    this.documentListElement = null;

    /** @type {HTMLElement} */
    this.displayableFiltersContainer = null;

    /** @type {HTMLElement} */
    this.inputFormElement = null;

    /** @type {HTMLElement} */
    this.inputKeywordsElement = null;

    /** @type {HTMLElement} */
    this.inputPubDateStartElement = null;

    /** @type {HTMLElement} */
    this.inputPubDateEndElement = null;

    /** @type {HTMLElement} */
    this.inputRefDateStartElement = null;

    /** @type {HTMLElement} */
    this.inputRefDateEndElement = null;

    /** @type {HTMLElement} */
    this.inputSourceElement = null;

    /** @type {HTMLElement} */
    this.inputRightsHolderElement = null;

    /** @type {HTMLElement} */
    this.clearButtonElement = null;

    this.initHtml();

    /**
     * The filter corresponding to the research fields.
     *
     * @type {DocumentSearchFilter}
     */
    this.searchFilter = new DocumentSearchFilter();

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

  initHtml() {
    this.rootHtml = document.createElement('div');
    this.rootHtml.classList.add('root-document-navigator');

    {
      // document list container
      this.documentListContainer = document.createElement('div');
      this.rootHtml.appendChild(this.documentListContainer);
      {
        // label document count
        const labelDocCount = document.createElement('h3');
        labelDocCount.innerText = 'Document(s)';
        this.documentListContainer.appendChild(labelDocCount);
        {
          this.docCountElement = document.createElement('span');
          labelDocCount.appendChild(this.docCountElement);
        }

        // list
        const listContainer = document.createElement('div');
        listContainer.classList.add('documents-list');
        this.documentListContainer.appendChild(listContainer);
        {
          this.documentListElement = document.createElement('ul');
          listContainer.appendChild(this.documentListElement);
        }
      }

      // filter displayable element
      const displayableFilters = createDisplayable('Filters');
      this.rootHtml.appendChild(displayableFilters.parent);
      this.displayableFiltersContainer = displayableFilters.container;
      {
        const displayableAttributes = createDisplayable('Attributes');
        this.displayableFiltersContainer.appendChild(
          displayableAttributes.parent
        );
        this.inputFormElement = displayableAttributes.container;

        {
          // keywords
          const labelInputKeywords = createLabelInput('Keywords', 'text');
          displayableAttributes.container.appendChild(
            labelInputKeywords.parent
          );
          this.inputKeywordsElement = labelInputKeywords.input;

          // publication date
          const dateIntervalInputPub =
            createDateIntervalInput('Publication Date');
          displayableAttributes.container.appendChild(
            dateIntervalInputPub.parent
          );
          this.inputPubDateStartElement = dateIntervalInputPub.inputStartDate;
          this.inputPubDateEndElement = dateIntervalInputPub.inputEndDate;

          // ref date
          const dateIntervalInputRef = createDateIntervalInput('Refering Date');
          displayableAttributes.container.appendChild(
            dateIntervalInputRef.parent
          );
          this.inputRefDateStartElement = dateIntervalInputRef.inputStartDate;
          this.inputRefDateEndElement = dateIntervalInputRef.inputEndDate;

          // source
          const labelInputSource = createLabelInput('Source', 'text');
          displayableAttributes.container.appendChild(labelInputSource.parent);
          this.inputSourceElement = labelInputSource.input;

          // right holder
          const labelInputRightsHolder = createLabelInput(
            'Rights holder',
            'text'
          );
          displayableAttributes.container.appendChild(
            labelInputRightsHolder.parent
          );
          this.inputRightsHolderElement = labelInputRightsHolder.input;

          // clear button
          this.clearButtonElement = document.createElement('button');
        }
      }
    }
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
}
