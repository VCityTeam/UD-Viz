import { CityObjectFilter } from "./CityObjectFilter";
import { CityObject } from "../../../Utils/3DTiles/Model/CityObject";

export class CityObjectFieldsFilter extends CityObjectFilter {
  constructor() {
    super('fields');

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

  toString() {
    let result = '';
    let attributes = [];

    if (!!this.tileId) {
      attributes.push(['tileId', this.tileId]);
    }

    if (!!this.batchId) {
      attributes.push(['batchId', this.batchId]);
    }

    for (let entry of Object.entries(this.props)) {
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