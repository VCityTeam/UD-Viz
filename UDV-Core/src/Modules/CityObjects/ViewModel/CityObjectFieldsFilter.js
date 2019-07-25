import { CityObjectFilter } from "./CityObjectFilter";
import { CityObject } from "../../../Utils/3DTiles/Model/CityObject";

export class CityObjectFieldsFilter extends CityObjectFilter {
  constructor() {
    super();

    this.tileId = undefined;
    this.batchId = undefined;
    this.props = {};
  }

  /**
   * The function responsible to filter the city objects. It evaluates wether
   * a city object is acceptable according to the filter.
   * 
   * @param {CityObject} cityObject The city object to evaluate.
   * 
   * @returns {boolean} Wether the city object is acceptable.
   */
  accepts(cityObject) {
    if (!!this.tileId && cityObject.tile.tileId !== this.tileId) {
      return false;
    }

    if (!!this.batchId && cityObject.batchId !== this.batchId) {
      return false;
    }

    for (let key of Object.keys(this.props)) {
      if (!cityObject.props[key] || (!!this.props[key] && this.props[key] != cityObject.props[key])) {
        return false;
      }
    }

    return true;
  }
}