import { CityObjectFilterSelector } from "./CityObjectFilterSelector";
import { CityObjectProvider } from "../ViewModel/CityObjectProvider";
import { CityObjectFieldsFilter } from "../ViewModel/CityObjectFieldsFilter";

export class CityObjectFieldsFilterSelector extends CityObjectFilterSelector {
  /**
   * 
   * @param {CityObjectProvider} provider The city object provider.
   */
  constructor(provider) {
    super('fields', 'City object attributes');

    this.filter = new CityObjectFieldsFilter();
    provider.addFilter('fields', this.filter);
  }

  get html() {
    return /*html*/`
      <label for="tileId">Tile ID</label>
      <input type="text" name="tileId">
      <label for="batchId">Batch ID</label>
      <input type="text" name="batchId">
      <label for="cityobject.database_id">cityobject.database_id</label>
      <input type="text" name="cityobject.database_id">
    `;
  }

  /**
   * 
   * @param {FormData} formData
   */
  onSubmit(formData) {
    this.filter.tileId = Number(formData.get('tileId'));
    this.filter.batchId = Number(formData.get('batchId'));
    for (let key of formData.keys()) {
      if (key !== 'tileId' && key !== 'batchId' && key !== 'filterLabel') {
        this.filter.props[key] = formData.get(key);
      }
    }
  }

  toString() {
    let result = '';
    let attributes = [];

    if (!!this.filter.tileId) {
      attributes.push(['tileId', this.filter.tileId]);
    }

    if (!!this.filter.batchId) {
      attributes.push(['batchId', this.filter.batchId]);
    }

    for (let entry of Object.entries(this.filter.props)) {
      if (!!entry[1]) {
        attributes.push([entry[0], entry[1]]);
      }
    }

    if (attributes.length > 0) {
      result += 'Attributes (';
      for (let i = 0; i < attributes.length; i++) {
        let attribute = attributes[i];
        result += `${attribute[0]}=${attribute[1]}`;
        if (i < attributes.length - 1) {
          result += ', ';
        }
      }
      result += ')'
    } else {
      result += 'All city objects'
    }

    return result;
  }
}