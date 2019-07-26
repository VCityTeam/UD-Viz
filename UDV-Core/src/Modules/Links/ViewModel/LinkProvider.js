import { LinkService } from "../Model/LinkService";
import { DocumentProvider } from "../../Documents/ViewModel/DocumentProvider";
import { CityObjectProvider } from "../../CityObjects/ViewModel/CityObjectProvider";
import { Link } from "../Model/Link";
import { Document } from "../../Documents/Model/Document";
import { CityObject } from "../../../Utils/3DTiles/Model/CityObject";
import { LinkCountFilter, LinkedWithDisplayedDocumentFilter, LinkedWithFilteredDocumentsFilter } from "./CityObjectLinkFilters";
import { EventSender } from "../../../Utils/Events/EventSender";

export class LinkProvider extends EventSender {
  /**
   * Constructs the link provider.
   * 
   * @param {DocumentProvider} documentProvider
   * @param {CityObjectProvider} cityObjectProvider
   * @param {LinkService} linkService The link service.
   */
  constructor(documentProvider, cityObjectProvider, linkService) {
    super();

    this.linkService = linkService;
    this.documentProvider = documentProvider;
    this.cityObjectProvider = cityObjectProvider;

    this.linkCountFilter = new LinkCountFilter(this);
    this.cityObjectProvider.addFilter(this.linkCountFilter);

    this.linkedWithDisplayedDocFilter = new LinkedWithDisplayedDocumentFilter(this);
    this.cityObjectProvider.addFilter(this.linkedWithDisplayedDocFilter);

    this.linkedWithFilteredDocsFilter = new LinkedWithFilteredDocumentsFilter(this);
    this.cityObjectProvider.addFilter(this.linkedWithFilteredDocsFilter);

    /**
     * The cached list of links.
     * 
     * @type {Array<Link>}
     */
    this.links = [];

    /**
     * 
     * 
     * @type {Array<Link>}
     */
    this.displayedDocumentLinks = [];

    /**
     * 
     * 
     * @type {Array<Link>}
     */
    this.filteredDocumentsLinks = [];

    /**
     * 
     * 
     * @type {Array<Link>}
     */
    this.selectedCityObjectLinks = [];

    this.registerEvent(DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED);
    this.registerEvent(DocumentProvider.EVENT_FILTERED_DOCS_UPDATED);
    this.registerEvent(CityObjectProvider.EVENT_CITY_OBJECT_SELECTED);

    this.documentProvider.addEventListener(DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED, (doc) => {
      this.displayedDocumentLinks = doc ? this.getLinksFromDocuments([doc]) : [];
      this.cityObjectProvider.applyStyles();
      this.sendEvent(DocumentProvider.EVENT_DISPLAYED_DOC_CHANGED, doc);
    });

    this.documentProvider.addEventListener(DocumentProvider.EVENT_FILTERED_DOCS_UPDATED, (docs) => {
      this.filteredDocumentsLinks = docs ? this.getLinksFromDocuments(docs) : [];
      this.cityObjectProvider.applyStyles();
      this.sendEvent(DocumentProvider.EVENT_FILTERED_DOCS_UPDATED, docs);
    });

    this.cityObjectProvider.addEventListener(CityObjectProvider.EVENT_CITY_OBJECT_SELECTED, (co) => {
      this.selectedCityObjectLinks = co ? this.getLinksFromCityObject(co) : [];
      this.cityObjectProvider.applyStyles();
      this.sendEvent(CityObjectProvider.EVENT_CITY_OBJECT_SELECTED);
    });
  }

  async fetchLinks() {
    this.links = await this.linkService.getLinks('city_object');
  }

  async deleteLink(link) {
    return await this.linkService.deleteLink('city_object', link.id);
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

  highlightDisplayedDocumentLinks() {
    this.cityObjectProvider.setLayer('linkDisplayedDoc', {materialProps: {color: 'red'}});
  }

  highlightFilteredDocumentsLinks() {
    this.cityObjectProvider.setLayer('linkFilteredDocs', {materialProps: {color: 'blue'}});
  }
}