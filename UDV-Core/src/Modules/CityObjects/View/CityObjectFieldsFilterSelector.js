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
    `;
  }

  /**
   * 
   * @param {FormData} formData
   */
  onSubmit(formData) {
    this.filter.tileId = Number(formData.get('tileId'));
    this.filter.batchId = Number(formData.get('batchId'));
  }

  toString() {
    let result = this.displayName;
    let attributes = [];

    if (!!this.filter.tileId) {
      attributes.push(['tileId', this.filter.tileId]);
    }

    if (!!this.filter.batchId) {
      attributes.push(['batchId', this.filter.batchId]);
    }

    for (let entry of Object.entries(this.filter.props)) {
      attributes.push([entry[0], entry[1]]);
    }

    if (attributes.length > 0) {
      result += ' (';
      for (let attribute of attributes) {
        result += `${attribute[0]}=${attribute[1]}, `;
      }
      result += ')'
    }

    return result;
  }
}