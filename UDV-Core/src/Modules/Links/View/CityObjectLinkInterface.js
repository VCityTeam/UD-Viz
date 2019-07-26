import { LinkService } from "../Model/LinkService";
import { CityObjectModule } from "../../CityObjects/CityObjectModule";
import { CityObjectFilterSelector } from "../../CityObjects/View/CityObjectFilterSelector";
import { LinkProvider } from "../ViewModel/LinkProvider";

/**
 * The interface extensions for the city object window.
 */
export class CityObjectLinkInterface {
  /**
   * Constructs the city object link interface.
   * 
   * @param {CityObjectModule} cityObjectModule The city object module.
   * @param {LinkProvider} linkProvider The link service.
   */
  constructor(cityObjectModule, linkProvider) {
    this.linkCountFilterSelector = new LinkCountFilterSelector(linkProvider);
    cityObjectModule.addFilterSelector(this.linkCountFilterSelector);
    cityObjectModule.addFilterSelector(new CityObjectFilterSelector('linkDisplayedDoc', 'Linked to a displayed document'));
    cityObjectModule.addFilterSelector(new CityObjectFilterSelector('linkFilteredDocs', 'Linked to the filtered documents'));
  }
}

export class LinkCountFilterSelector extends CityObjectFilterSelector {
  /**
   * 
   * @param {LinkProvider} linkProvider The link provider.
   */
  constructor(linkProvider) {
    super('linkCount', 'Number of linked documents');

    this.filter  = linkProvider.linkCountFilter;
  }

  get html() {
    return /*html*/`
      <label for="requiredCount">Required count of linked documents</label>
      <input type="text" name="requiredCount" value="1">
    `;
  }

  onSubmit(formData) {
    this.filter.requiredCount = Number(formData.get('requiredCount')) || 1;
  }
}