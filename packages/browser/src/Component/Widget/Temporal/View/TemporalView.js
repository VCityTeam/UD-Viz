import { TemporalGraphWindow } from './TemporalGraphWindow.js';
import { TemporalSliderWindow } from './TemporalSliderWindow.js';
import { EnumTemporalWindow } from './EnumWindows.js';

// JSDOC Import
import { TemporalProvider } from '../ViewModel/TemporalProvider.js';
import { TemporalOptions } from '../TemporalModule.js';
/**
 * The view entrypoint. Initialize the correct window depending on the
 * configuration and hook up the callbacks from the view model to this window.
 */
export class TemporalView {
  /**
   * It creates a temporal window (either a slider or a graph) and binds it to the temporal extension
   *
   * @param {TemporalProvider} provider - The provider that will be used to fetch the tiles.
   * @param {TemporalOptions} temporalOptions - options for initializing the temporal module
   */
  constructor(provider, temporalOptions) {
    /**
     * Setting the provider to the provider that is passed in.
     *
      @type {TemporalProvider}  */
    this.provider = provider;

    /**
     * Setting the current time to the current time.
     *
      @type {number}  */
    this.currentTime = temporalOptions.currentTime;

    /**
     * It updates the current time
     * and then tells the provider to update the visible tiles
     *
     * @param {string} newDate - the new date that the user has selected.
     */
    function currentTimeUpdated(newDate) {
      this.currentTime = Number(newDate);
      this.provider.currentTime = this.currentTime; // TODO: verify that the
      // flow is good with MVVM
      this.provider.changeVisibleTilesStates();
    }

    // ******* Temporal window
    /** Declare a callback to update `this.currentTime` when it is changed by the user in the `temporalWindow` */
    const refreshCallback = currentTimeUpdated.bind(this);

    /**
     * Callback to get data asynchronously from the `tileset.json`
     *
     * @returns {Array} An array of two elements: `versions` and `versionTransitions`
     */
    function getAsynchronousData() {
      const versions =
        this.temporalExtension.temporal_tileset.temporalVersions.versions;
      const versionTransitions =
        this.temporalExtension.temporal_tileset.versionTransitions;
      return [versions, versionTransitions];
    }

    // Select the window type:
    switch (temporalOptions.view) {
      case EnumTemporalWindow.SLIDERWINDOW:
        this.temporalWindow = new TemporalSliderWindow(
          refreshCallback,
          temporalOptions
        );
        break;
      case EnumTemporalWindow.GRAPHWINDOW:
        temporalOptions.getAsynchronousData = getAsynchronousData.bind(this);
        this.temporalWindow = new TemporalGraphWindow(
          refreshCallback,
          temporalOptions
        );
        break;
    }
  }

  html() {
    return this.temporalWindow.html();
  }

  dispose() {
    this.temporalWindow.dispose();
  }
}
