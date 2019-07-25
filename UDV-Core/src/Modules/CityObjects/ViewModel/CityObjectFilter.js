import { CityObject } from "../../../Utils/3DTiles/Model/CityObject";

/**
 * Represents a filter for city objects. It is basically a function that takes
 * a city object and returns wether it is acceptable.
 */
export class CityObjectFilter {
  /**
   * Constructs a new city object filter, from an acceptation function. If no
   * acceptation function was provided, the filter accepts all city objects.
   * 
   * @param {(CityObject) => boolean} [accepts] The function responsible to
   * filter the city objects. It must evaluate wether a city object is
   * acceptable according to the filter.
   */
  constructor(accepts) {
    if (typeof(accepts) === 'function') {
      this.accepts = accepts;
    } else {
      this.accepts = this.accepts.bind(this);
    }
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
    return true;
  }
}