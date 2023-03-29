import { CityObjectProvider } from './ViewModel/CityObjectProvider';
import { CityObjectWindow } from './View/CityObjectWindow';

/**
 * @callback ActionCB
 * @param {any} data
 * @returns {any}
 */

/**
 * Manages the city objects and allows the user to visualize them with
 * filters. Other modules can extend the functionnalities of the city object
 * module by adding filters.
 */
export class CityObjectModule {
  /**
   * Manages the city objects and allows the user to visualize them with
   * filters. Other modules can extend the functionnalities of the city object
   * module by adding filters.
   *
   * @param {CityObjectProvider} cityObjectProvider The cityObjectProvider.
   */
  constructor(cityObjectProvider) {
    /**
     * The city object provider, whichs manages the city objects in terms
     * of layer and selected city object.
     */
    this.provider = cityObjectProvider;

    /**
     * The city object view. It consist of a main window, called the city
     * object window.
     */
    this.view = new CityObjectWindow(this.provider);
  }

  /**
   * Adds an event listener to the city object provider.
   *
   * @param {string} event The event of the city object provider.
   * @param {ActionCB} action The listener method.
   */
  addEventListener(event, action) {
    this.provider.addEventListener(event, action);
  }

  /**
   * Removes the event listener from the city object provider.
   *
   * @param {ActionCB} action The listener to remove.
   */
  removeEventListener(action) {
    this.provider.removeEventListener(action);
  }

  /**
   * Adds a filter selector in the city object filter window.
   *
   * @param {import("./View/CityObjectFilterSelector").CityObjectFilterSelector} filterSelector The filter selector to
   * add.
   */
  addFilterSelector(filterSelector) {
    this.view.addFilterSelector(filterSelector);
  }
}
