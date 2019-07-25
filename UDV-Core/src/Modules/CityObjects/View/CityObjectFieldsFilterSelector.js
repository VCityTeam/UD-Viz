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
    provider.addFilter(this.filter);
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
}