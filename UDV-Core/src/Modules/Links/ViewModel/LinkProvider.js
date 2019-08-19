import { LinkService } from "../Model/LinkService";
import { DocumentProvider } from "../../Documents/ViewModel/DocumentProvider";
import { CityObjectProvider } from "../../CityObjects/ViewModel/CityObjectProvider";
import { Link } from "../Model/Link";
import { Document } from "../../Documents/Model/Document";
import { CityObject } from "../../../Utils/3DTiles/Model/CityObject";
import { LinkCountFilter, LinkedWithDisplayedDocumentFilter, LinkedWithFilteredDocumentsFilter } from "./CityObjectLinkFilters";
import { EventSender } from "../../../Utils/Events/EventSender";
import { DocumentFilter } from "../../Documents/ViewModel/DocumentFilter";

export class LinkProvider extends EventSender {
  /**
   * Constructs the link provider.
   * 
   * @param {DocumentProvider} documentProvider
   * @param {CityObjectProvider} cityObjectProvider
   * @param {LinkService} linkService The link service.
   * @param {object} config
   */
  constructor(documentProvider, cityObjectProvider, linkService, config) {
    super();

    this.linkService = linkService;
    this.documentProvider = documentProvider;
    this.cityObjectProvider = cityObjectProvider;

    this.linkCountFilter = new LinkCountFilter(this);
    this.cityObjectProvider.addFilter(this.linkCountFilter);

    this.linkedWithDisplayedDocFilter = new LinkedWithDisplayedDocumentFilter(this);
    this.cityObjectProvider.addFilter(this.linkedWithDisplayedDocFilter);

    this.linkDisplayedDocumentStyle = config.cityObjects.styles.linkedWithDisplayedDocument;

    this.linkedWithFilteredDocsFilter = new LinkedWithFilteredDocumentsFilter(this);
    this.cityObjectProvider.addFilter(this.linkedWithFilteredDocsFilter);

    this.shouldFilterLinkedDocuments = false;
    this.documentProvider.addFilter(new DocumentFilter((doc) => {
      return !this.shouldFilterLinkedDocuments || this.selectedCityObjectLinks.find(link => link.source_id === doc.id);
    }));

    this.documentProvider.refreshDocumentList();

    /**
     * The cached list of links.
     * 
     * @type {Array<Link>}
     */
    this.links = [];

    /**
     * 
     * 
     * @type {Document}
     */
    this.displayedDocument = undefined;

    /**
     * 
     * 
     * @type {Array<Link>}
     */
    this.displayedDocumentLinks = [];

    /**
     * 
     * 
     * @type {Array<Document>}
     */
    this.filteredDocuments = [];

    /**
     * 
     * 
     * @type {Array<Link>}
     */
    this.filteredDocumentsLinks = [];

    /**
     * 
     * 
     * @type {CityObject}
     */
    this.selectedCityObject = undefined;

    /**
     * 
     * 
     * @type {Array<Link>}
     */
    this.selectedCityObjectLinks = [];

    this.registerEvent(DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED);
    this.registerEvent(DocumentProvider.EVENT_FILTERED_DOCS_UPDATED);
    this.registerEvent(CityObjectProvider.EVENT_CITY_OBJECT_SELECTED);

    this.documentProvider.addEventListener(DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED,
      (doc) => this._onDisplayedDocumentChange(doc));

    this.documentProvider.addEventListener(DocumentProvider.EVENT_FILTERED_DOCS_UPDATED,
      (docs) => this._onFilteredDocumentsUpdate(docs));

    this.cityObjectProvider.addEventListener(CityObjectProvider.EVENT_CITY_OBJECT_SELECTED,
      (co) => this._onCityObjectSelection(co));
  }

  _onDisplayedDocumentChange(doc) {
    this.displayedDocument = doc;
    this.displayedDocumentLinks = doc ? this.getLinksFromDocuments([doc]) : [];
    this.cityObjectProvider.applyStyles();
    this.sendEvent(DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED, doc);
  }

  _onFilteredDocumentsUpdate(docs) {
    this.filteredDocuments = docs;
    this.filteredDocumentsLinks = this.getLinksFromDocuments(docs);
    this.cityObjectProvider.applyStyles();
    this.sendEvent(DocumentProvider.EVENT_FILTERED_DOCS_UPDATED, docs);
  }

  _onCityObjectSelection(co) {
    this.selectedCityObject = co;
    this.selectedCityObjectLinks = co ? this.getLinksFromCityObject(co) : [];
    if (this.shouldFilterLinkedDocuments) {
      this.documentProvider.refreshDocumentList();
    }
    this.sendEvent(CityObjectProvider.EVENT_CITY_OBJECT_SELECTED, co);
  }

  async fetchLinks() {
    this.links = await this.linkService.getLinks('city_object');
    this._onDisplayedDocumentChange(this.displayedDocument);
    this._onFilteredDocumentsUpdate(this.filteredDocuments);
    this._onCityObjectSelection(this.selectedCityObject);
  }

  async deleteLink(link) {
    await this.linkService.deleteLink('city_object', link.id);
    await this.fetchLinks();
  }

  /**
   * 
   * @param {Link} link 
   */
  async createLink(link) {
    let formData = new FormData();
    formData.append('source_id', link.source_id);
    formData.append('target_id', link.target_id);
    formData.append('centroid_x', link.centroid_x);
    formData.append('centroid_y', link.centroid_y);
    formData.append('centroid_z', link.centroid_z);
    await this.linkService.createLink('city_object', formData);
    await this.fetchLinks();
  }

  getLinks() {
    return this.links;
  }

  /**
   * 
   * @param {Array<Document>} docs 
   */
  getLinksFromDocuments(docs) {
    return this.links.filter((link) =>
      docs.find((doc) => doc.id == link.source_id) !== undefined);
  }

  /**
   * 
   * @param {CityObject} cityObject 
   */
  getLinksFromCityObject(cityObject) {
    return this.links.filter((link) =>
      link.target_id == cityObject.props['cityobject.database_id']);
  }

  /**
   * @returns {Array<Link>}
   */
  getDisplayedDocumentLinks() {
    return this.displayedDocumentLinks;
  }

  /**
   * @returns {Array<Link>}
   */
  getFilteredDocumentsLinks() {
    return this.filteredDocumentsLinks;
  }

  /**
   * @returns {Array<Link>}
   */
  getSelectedCityObjectLinks() {
    return this.selectedCityObjectLinks;
  }

  getSelectedCityObjectLinkedDocuments() {
    let allDocuments = this.documentProvider.getAllDocuments().slice();
    let docIdsToFind = this.selectedCityObjectLinks.map(link => link.source_id);
    return allDocuments.filter(doc => docIdsToFind.includes(doc.id));
  }

  /**
   * 
   * @param {Boolean} [toggle] 
   */
  toggleLinkedDocumentsFilter(toggle) {
    if (toggle === null || toggle === undefined) {
      toggle = !this.shouldFilterLinkedDocuments;
    }
    this.shouldFilterLinkedDocuments = toggle;
    this.documentProvider.refreshDocumentList();
  }

  highlightDisplayedDocumentLinks() {
    this.cityObjectProvider.setLayer('linkDisplayedDoc', this.linkDisplayedDocumentStyle);
  }

  highlightFilteredDocumentsLinks() {
    this.cityObjectProvider.setLayer('linkFilteredDocs', {materialProps: {color: 'blue'}});
  }
}