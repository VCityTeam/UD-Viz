import { LinkService } from "../Model/LinkService";
import { CityObjectModule } from "../../CityObjects/CityObjectModule";
import { CityObjectFilterSelector } from "../../CityObjects/View/CityObjectFilterSelector";
import { LinkProvider } from "../ViewModel/LinkProvider";
import { CityObjectProvider } from "../../CityObjects/ViewModel/CityObjectProvider";

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
    cityObjectModule.addFilterSelector(new CityObjectFilterSelector('linkDisplayedDoc', '[Debug] Linked to a displayed document'));
    cityObjectModule.addFilterSelector(new CityObjectFilterSelector('linkFilteredDocs', '[Debug] Linked to the filtered documents'));

    cityObjectModule.addExtension('showDoc', {
      type: 'button',
      html: 'Show linked documents',
      callback: () => {
        linkProvider.toggleLinkedDocumentsFilter();
      }
    });

    cityObjectModule.addExtension('links', {
      type: 'div',
      html: /*html*/`
        <div id="${this.linkListId}">
        </div>
      `,
    });

    this.linkProvider = linkProvider;

    this.linkProvider.addEventListener(CityObjectProvider.EVENT_CITY_OBJECT_SELECTED,
      () => this._updateLinkList());
  }

  _updateLinkList() {
    let docs = this.linkProvider.getSelectedCityObjectLinkedDocuments();
    if (docs.length === 0) {
      this.linkListElement.innerHTML = '';
    } else {
      let listHtml = `<p class="city-object-title">${docs.length} linked document(s)</p>
        <p class="city-object-value"><ul>`;
      for (let doc of docs) {
        listHtml += `<li>${doc.title}</li>`;
      }
      listHtml += '</ul></p>';
      this.linkListElement.innerHTML = listHtml;
    }
  }

  //////////////
  ////// GETTERS

  get linkListId() {
    return `city_objects_link_list`;
  }

  get linkListElement() {
    return document.getElementById(this.linkListId);
  }
}

export class LinkCountFilterSelector extends CityObjectFilterSelector {
  /**
   * 
   * @param {LinkProvider} linkProvider The link provider.
   */
  constructor(linkProvider) {
    super('linkCount', 'Number of linked documents');

    this.filter = linkProvider.linkCountFilter;
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