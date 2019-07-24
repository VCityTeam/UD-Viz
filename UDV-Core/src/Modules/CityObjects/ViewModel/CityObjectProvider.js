import { TilesManager } from "../../../Utils/3DTiles/TilesManager";
import { CityObjectFilter } from "./CityObjectFilter";
import { CityObjectLayer } from "./CityObjectLayer";
import { CityObjectStyle } from "../../../Utils/3DTiles/Model/CityObjectStyle";
import { CityObjectID, CityObject } from "../../../Utils/3DTiles/Model/CityObject";
import { EventSender } from "../../../Utils/Events/EventSender";

export class CityObjectProvider extends EventSender {
  /**
   * 
   * @param {TilesManager} tilesManager The tiles manager.
   */
  constructor(tilesManager) {
    super();
    /**
     * The tiles manager.
     * 
     * @type {TilesManager}
     */
    this.tilesManager = tilesManager;

    /**
     * The available filters.
     * 
     * @type {Object.<string, CityObjectFilter>}
     */
    this.filters = {};

    /**
     * The current displayed layer.
     * 
     * @type {CityObjectLayer}
     */
    this.layer = undefined;

    /**
     * The array of city objects in the layer.
     * 
     * @type {Array<CityObjectID}
     */
    this.layerCityObjectIds = [];

    this.registerEvent(CityObjectProvider.EVENT_FILTERS_UPDATED);
    this.registerEvent(CityObjectProvider.EVENT_LAYER_CHANGED);

    this._init();
  }

  _init() {
    // Create default filters
    this.addFilter('all', new CityObjectFilter((_) => true));
  }

  /**
   * 
   * @param {string} label The label to identify the filter.
   * @param {CityObjectFilter | ((cityObject: CityObject) => boolean)} cityObjectFilter
   * The filter to add.
   */
  addFilter(label, cityObjectFilter) {
    if (typeof(cityObjectFilter) === 'function') {
      cityObjectFilter = new CityObjectFilter(cityObjectFilter);
    }

    if (this.filters[label] !== undefined) {
      throw 'A filter with this label already exists : ' + label;
    }

    this.filters[label] = cityObjectFilter;

    this.sendEvent(CityObjectProvider.EVENT_FILTERS_UPDATED, this.filters);
  }

  /**
   * 
   * @return {Array<string>}
   */
  getFilters() {
    return Object.keys(this.filters);
  }

  setLayer(filterLabel, style) {
    let filter = this.filters[filterLabel];

    if (filter === undefined) {
      throw 'No filter found with the label : ' + label;
    }

    if (!(style instanceof CityObjectStyle)) {
      style = new CityObjectStyle(style);
    }

    this.layer = new CityObjectLayer(filter, style);

    this.sendEvent(CityObjectProvider.EVENT_LAYER_CHANGED);

    this._updateTilesManagerFromLayer();
  }

  removeLayer() {
    this.layer = undefined;
    this._updateTilesManagerFromLayer();
  }

  _updateTilesManagerFromLayer() {
    this.tilesManager.update();
    this.tilesManager.removeAllStyles();

    if (this.layer === undefined) {
      this.layerCityObjectIds = [];
      return;
    }

    this.layerCityObjectIds = this.tilesManager
      .findAllCityObjects(this.layer.filter.accepts)
      .map((co) => co.cityObjectId);
    
    this.tilesManager.setStyle(this.layerCityObjectIds, this.layer.style);
  }

  applyStyles() {
    this._updateTilesManagerFromLayer();
    this.tilesManager.applyStyles();
  }

  ////////////
  ///// EVENTS

  static get EVENT_FILTERS_UPDATED() {
    return 'EVENT_FILTERS_UPDATED';
  }

  static get EVENT_LAYER_CHANGED() {
    return 'EVENT_LAYER_CHANGED';
  }
}