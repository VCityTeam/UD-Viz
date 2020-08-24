import { TilesManager } from "../../../Utils/3DTiles/TilesManager";
import { CityObjectFilter } from "./CityObjectFilter";
import { CityObjectLayer } from "./CityObjectLayer";
import { CityObjectStyle } from "../../../Utils/3DTiles/Model/CityObjectStyle";
import { CityObjectID, CityObject } from "../../../Utils/3DTiles/Model/CityObject";
import { EventSender } from "../../../Utils/Events/EventSender";
import { LayerManager } from "../../../Utils/LayerManager/LayerManager";

/**
 * The city object provider manages the city object by organizing them in two
 * categories : the _layer_ and the _selected city object_. The layer
 * represents a set of city objects to highlight, determined by a specific
 * filter.
 */
export class CityObjectProvider extends EventSender {
  /**
   * Constructs a city object provider, using a tiles manager.
   * 
   * @param {LayerManager} layerManager The tiles manager.
   */
  constructor(layerManager) {
    super();
    /**
     * The tiles manager.
     * 
     * @type {LayerManager}
     */
    this.layerManager = layerManager;

    /**
     * The available filters.
     * 
     * @type {Object.<string, CityObjectFilter>}
     */
    this.filters = {};

    /**
     * The current highlighted layer.
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

    /**
     * The style applied to the selected city object.
     * 
     * @type {CityObjectStyle | string}
     */
    this.defaultSelectionStyle = {materialProps: {color: 0x13ddef}};

    // Event registration
    this.registerEvent(CityObjectProvider.EVENT_FILTERS_UPDATED);
    this.registerEvent(CityObjectProvider.EVENT_LAYER_CHANGED);
    this.registerEvent(CityObjectProvider.EVENT_CITY_OBJECT_SELECTED);
  }

  ///////////////////////////
  ///// CITY OBJECT SELECTION

  /**
   * Selects a city object from a mouse event. If a city object is actually
   * under the mouse, the `EVENT_CITY_OBJECT_SELECTED` event is sent.
   * 
   * @param {MouseEvent} mouseEvent The mouse click event.
   */
  selectCityObject(mouseEvent) {
    let cityObject = this.layerManager.tilesManagers[0].pickCityObject(mouseEvent);
    if (!!cityObject) {
      this.selectedCityObjectId = cityObject.cityObjectId;
      this.removeLayer();
      this.sendEvent(CityObjectProvider.EVENT_CITY_OBJECT_SELECTED, cityObject);
    }
    this._updateTilesManager();
  }

  /**
   * Unset the selected city object and sends an `EVENT_CITY_OBJECT_SELECTED`
   * event.
   */
  unselectCityObject() {
    this.selectedCityObjectId = undefined;
    this.sendEvent(CityObjectProvider.EVENT_CITY_OBJECT_SELECTED, undefined);
    this._updateTilesManager();
    this.applyStyles();
  }

  /**
   * Sets the style for the selected city object.
   * 
   * @param {CityObjectStyle | string} style The style.
   */
  setSelectionStyle(style) {
    this.defaultSelectionStyle = style;
  }

  /////////////
  ///// FILTERS

  /**
   * Adds a filter to the dictionnary of available filters. The key shall be
   * the `label` attribute of the filter. After that, the
   * `EVENT_FILTERS_UPDATED` event is sent.
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
   * Returns the currently available filters.
   * 
   * @return {Array<CityObjectFilter>} The currently available filters.
   */
  getFilters() {
    return Object.values(this.filters);
  }

  //////////////////////
  ///// LAYER MANAGEMENT

  /**
   * Sets the current layer. The layer is defined by a filter (ie. a set
   * of city objects) and a style. Sends the `EVENT_LAYER_CHANGED` event.
   * 
   * @param {string} filterLabel Label of the filter that defines the layer.
   * The filter must first be registered using `addFilter`.
   * @param {CityObjectStyle | string} style The style to associate to the
   * layer.
   */
  setLayer(filterLabel, style) {
    let filter = this.filters[filterLabel];

    if (filter === undefined) {
      throw 'No filter found with the label : ' + label;
    }

    this.layer = new CityObjectLayer(filter, style);

    this.sendEvent(CityObjectProvider.EVENT_LAYER_CHANGED, filter);

    this.unselectCityObject();

    this.applyStyles();
  }

  /**
   * Returns the current layer.
   * 
   * @returns {CityObjectLayer} The current layer.
   */
  getLayer() {
    return this.layer;
  }

  /**
   * Unsets the current layer. Sends the `EVENT_LAYER_CHANGED` event.
   */
  removeLayer() {
    this.layer = undefined;
    this.sendEvent(CityObjectProvider.EVENT_LAYER_CHANGED, undefined);
    
    this.applyStyles();
  }

  /**
   * Updates the tiles manager so that it has the correct styles associated with
   * the right city objects.
   * 
   * @private
   */
  _updateTilesManager() {
    this.layerManager.tilesManagers[0].update();
    this.layerManager.tilesManagers[0].removeAllStyles();

    if (this.layer === undefined) {
      this.layerCityObjectIds = [];
    } else {
      this.layerCityObjectIds = this.layerManager.tilesManagers[0]
        .findAllCityObjects(this.layer.filter.accepts)
        .map((co) => co.cityObjectId);
      
      this.layerManager.tilesManagers[0].setStyle(this.layerCityObjectIds, this.layer.style);
    }

    if (!!this.selectedCityObjectId) {
      this.layerManager.tilesManagers[0].setStyle(this.selectedCityObjectId, this.defaultSelectionStyle);
    }
  }

  /**
   * Apply the styles to the tiles manager. This function is necessary as the
   * event for tile loading does not exist yet. In the future, it shouldn't be
   * necessary to manually call this function.
   */
  applyStyles() {
    this._updateTilesManager();
    this.layerManager.tilesManagers[0].applyStyles();
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