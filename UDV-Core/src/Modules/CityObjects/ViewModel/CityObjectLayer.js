import { CityObjectFilter } from "./CityObjectFilter";
import { CityObjectStyle } from "../../../Utils/3DTiles/Model/CityObjectStyle";

/**
 * A layer represents an association between a set of city objects and a style.
 * The set of city objects is defined by a filter.
 */
export class CityObjectLayer {
  /**
   * Constructs a layer from a filter and a style.
   * 
   * @param {CityObjectFilter} filter The filter associated with the layer.
   * @param {CityObjectStyle} style The style associated with the layer.
   */
  constructor(filter, style) {
    if (!(filter instanceof CityObjectFilter)) {
      throw 'The filter must be an instance of CityObjectFilter.';
    }

    if (!(style instanceof CityObjectStyle)) {
      style = new CityObjectStyle(stlye);
    }

    /**
     * The filter associated with the layer.
     * 
     * @type {CityObjectFilter}
     */
    this.filter = filter;

    /**
     * The style associated with the layer.
     * 
     * @type {CityObjectStyle}
     */
    this.style = style;
  }
}