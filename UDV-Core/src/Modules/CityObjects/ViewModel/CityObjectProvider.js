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
     * @type {Array<CityObjectID>}
     */
    this.layerCityObjectIds = [];

    /**
     * The selected city object.
     * 
     * @type {CityObjectID}
     */
    this.selectedCityObjectId = undefined;

    this.defaultSelectionStyle = {materialProps: {color: 0x13ddef}};

    this.registerEvent(CityObjectProvider.EVENT_FILTERS_UPDATED);
    this.registerEvent(CityObjectProvider.EVENT_LAYER_CHANGED);
    this.registerEvent(CityObjectProvider.EVENT_CITY_OBJECT_SELECTED);

    this._init();
  }

  _init() {
    // Create default filters
    this.addFilter('all', new CityObjectFilter((_) => true));
  }

  /**
   * 
   * @param {MouseEvent} mouseEvent 
   */
  selectCityObject(mouseEvent) {
    let cityObject = this.tilesManager.pickCityObject(mouseEvent);
    if (!!cityObject) {
      this.selectedCityObjectId = cityObject.cityObjectId;
    }
    this.sendEvent(CityObjectProvider.EVENT_CITY_OBJECT_SELECTED, cityObject);
    this._updateTilesManager();
  }

  unselectCityObject() {
    this.selectedCityObjectId = undefined;
    this.sendEvent(CityObjectProvider.EVENT_CITY_OBJECT_SELECTED, undefined);
    this._updateTilesManager();
  }

  /**
   * 
   * @param {CityObjectStyle | string} style
   */
  setSelectionStyle(style) {
    this.defaultSelectionStyle = style;
  }

  /**
   * 
   * @param {CityObjectFilter} cityObjectFilter The filter to add.
   */
  addFilter(cityObjectFilter) {
    let label = cityObjectFilter.label;

    if (this.filters[label] !== undefined) {
      throw 'A filter with this label already exists : ' + label;
    }

    this.filters[label] = cityObjectFilter;

    this.sendEvent(CityObjectProvider.EVENT_FILTERS_UPDATED, this.filters);
  }

  /**
   * 
   * @return {Array<CityObjectFilter>}
   */
  getFilters() {
    return this.filters;
  }

  setLayer(filterLabel, style) {
    let filter = this.filters[filterLabel];

    if (filter === undefined) {
      throw 'No filter found with the label : ' + label;
    }

    this.layer = new CityObjectLayer(filter, style);

    this.sendEvent(CityObjectProvider.EVENT_LAYER_CHANGED, filter);

    this._updateTilesManager();
  }

  getLayer() {
    return this.layer;
  }

  removeLayer() {
    this.layer = undefined;
    this.sendEvent(CityObjectProvider.EVENT_LAYER_CHANGED, undefined);
    this._updateTilesManager();
  }

  _updateTilesManager() {
    this.tilesManager.update();
    this.tilesManager.removeAllStyles();

    if (this.layer === undefined) {
      this.layerCityObjectIds = [];
    } else {
      this.layerCityObjectIds = this.tilesManager
        .findAllCityObjects(this.layer.filter.accepts)
        .map((co) => co.cityObjectId);
      
      this.tilesManager.setStyle(this.layerCityObjectIds, this.layer.style);
    }

    if (!!this.selectedCityObjectId) {
      this.tilesManager.setStyle(this.selectedCityObjectId, this.defaultSelectionStyle);
    }
  }

  applyStyles() {
    this._updateTilesManager();
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

  static get EVENT_CITY_OBJECT_SELECTED() {
    return 'EVENT_CITY_OBJECT_SELECTED';
  }
}