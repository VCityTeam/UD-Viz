import { CityObjectProvider } from "./ViewModel/CityObjectProvider";
import { CityObjectWindow } from "./View/CityObjectWindow";

import * as THREE from 'three';
import { TilesManager } from "../../Utils/3DTiles/TilesManager";
import { CityObjectStyle } from "../../Utils/3DTiles/Model/CityObjectStyle";

export class CityObjectModule {
  /**
   * Manages the city objects and allows the user to visualize them with
   * filters. Other modules can extend the functionnalities of the city object
   * module by adding filters.
   * 
   * @param {TilesManager} tilesManager The tiles manager.
   * @param {object} config The UDV configuration.
   * @param {object} config.cityObjects The city objects config.
   * @param {Object.<string, CityObjectStyle>} config.cityObjects.styles The
   * city object styles.
   * @param {CityObjectStyle} config.cityObjects.styles.layerDefault The default
   * style for the layer.
   * @param {CityObjectStyle} config.cityObjects.styles.selection The style
   * for the selected city object.
   */
  constructor(tilesManager, config) {
    /**
     * The city object provider, whichs manages the city objects in terms
     * of layer and selected city object.
     */
    this.provider = new CityObjectProvider(tilesManager);
    this.provider.setSelectionStyle(config.cityObjects.styles.selection);

    /**
     * The city object view. It consist of a main window, called the city
     * object window.
     */
    this.view = new CityObjectWindow(this.provider);
    this.view.setDefaultLayerStyle(config.cityObjects.styles.layerDefault);
  }

  /**
   * Adds an event listener to the city object provider.
   * 
   * @param {string} event The event of the city object provider.
   * @param {(data: any) => any} action The listener method.
   */
  addEventListener(event, action) {
    this.provider.addEventListener(event, action);
  }

  /**
   * Removes the event listener from the city object provider.
   * 
   * @param {(data: any) => any} action The listener to remove.
   */
  removeEventListener(action) {
    this.provider.removeEventListener(action);
  }

  /**
   * Creates a new extension for the city object window. An extension is 
   * a piece of HTML identified by a label.
   * 
   * @param {string} label The extension label.
   * @param {object} options The extension options.
   * @param {string} options.html The inside HTML of the
   * extension.
   */
  addExtension(label, options) {
    this.view.addExtension(label, options);
  }

  /**
   * Removes an existing extension in the city object window.
   * 
   * @param {string} label The extension label.
   */
  removeExtension(label) {
    this.view.removeExtension(label);
  }

  /**
   * Adds a filter selector in the city object filter window.
   * 
   * @param {CityObjectFilterSelector} filterSelector The filter selector to
   * add.
   */
  addFilterSelector(filterSelector) {
    this.view.addFilterSelector(filterSelector);
  }
}