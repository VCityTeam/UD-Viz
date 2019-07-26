import { CityObjectFilter } from "../../CityObjects/ViewModel/CityObjectFilter";
import { LinkProvider } from "./LinkProvider";
import { CityObject } from "../../../Utils/3DTiles/Model/CityObject";
import { Document } from "../../Documents/Model/Document";
import { DocumentProvider } from "../../Documents/ViewModel/DocumentProvider";

export class LinkCountFilter extends CityObjectFilter {
  constructor(linkProvider) {
    super('linkCount');

    this.requiredCount = 1;

    /**
     * 
     * 
     * @type {LinkProvider}
     */
    this.provider = linkProvider;
  }

  /**
   * 
   * @param {*} cityObject 
   */
  accepts(cityObject) {
    let linkCount = this.provider.getLinksFromCityObject(cityObject).length;
    return linkCount >= this.requiredCount;
  }

  toString() {
    let str = 'At least ' + this.requiredCount + ' linked document';
    if (this.requiredCount > 1) {
      str += 's';
    }
    return str;
  }
}

export class LinkedWithDisplayedDocumentFilter extends CityObjectFilter {
  constructor(linkProvider) {
    super('linkDisplayedDoc');

    /**
     * @type {LinkProvider}
     */
    this.provider = linkProvider;
  }

  /**
   * 
   * @param {CityObject} cityObject 
   */
  accepts(cityObject) {
    let found = this.provider.getDisplayedDocumentLinks().find((link) =>
      link.target_id == cityObject.props['cityobject.database_id']);
    return !!found;
  }

  toString() {
    return 'Linked to the displayed document';
  }
}

export class LinkedWithFilteredDocumentsFilter extends CityObjectFilter {
  constructor(linkProvider) {
    super('linkFilteredDocs');

    /**
     * @type {LinkProvider}
     */
    this.provider = linkProvider;
  }

  /**
   * 
   * @param {CityObject} cityObject 
   */
  accepts(cityObject) {
    let found = this.provider.getFilteredDocumentsLinks().find((link) =>
      link.target_id == cityObject.props['cityobject.database_id']);
    return !!found;
  }

  toString() {
    return 'Linked to the filtered documents';
  }
}