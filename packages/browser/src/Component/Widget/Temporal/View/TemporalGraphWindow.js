import { NetworkManager } from './NetworkManager';
import './TemporalWindow.css';

/**
 * Constructor for TemporalWindow Class
 * Handles the GUI part enabling the user to specify the chosen "time" (moment or
 * date) of observation for displayal of the (3D) scene.
 * Note that it is not the Temporal View's responsability to
 * alter/modify/update the scene according to the user specified moment (but
 * only to trigger the possible hook-ups).
 * This View represents a timestamp with the Moment.js library.
 */
export class TemporalGraphWindow {
  /**
   * It creates a new instance of the `TemporalGraphNavigation` class, which is a subclass of the
   * `GraphNavigation` class
   *
   * @param {Function} refreshCallback - Callback to be called when the time has changed.
   * @param {object} [options={}] - Optional parameters (min time, max time and current time).
   */
  constructor(refreshCallback, options = {}) {
    console.error('DEPRECATED');
    // Option : getAsynchronousData

    this.rootHtml = document.createElement('div');
    this.rootHtml.setAttribute('id', 'temporalWindow');

    this.refreshCallback = refreshCallback;

    // Graph
    this.networkManager = new NetworkManager();
    this.networkManager.option = options.viewOptions;
    this.networkManager.getAsynchronousData =
      options.temporalWindow.getAsynchronousData;

    // Magical code to center an absolute positionned window
    this.rootHtml.style.setProperty('left', '0');
    this.rootHtml.style.setProperty('right', '0');
    this.rootHtml.style.setProperty('margin-left', 'auto');
    this.rootHtml.style.setProperty('margin-right', 'auto');
    // Put it at the bottom of the page
    this.rootHtml.style.setProperty('top', 'unset');
    this.rootHtml.style.setProperty('bottom', '0');
    this.rootHtml.style.setProperty('margin-bottom', 'auto');
    // Window size and center text
    this.rootHtml.style.setProperty('width', '700px');
    this.rootHtml.style.setProperty('height', '215px');
    //        this.rootHtml.style.setProperty('height', '115px');
    this.rootHtml.style.setProperty('text-align', 'center');

    // Add graph
    this.networkManager.init();
    this.networkManager.add_event((param) => {
      this.changeTime(param);
    });
  }

  html() {
    return this.rootHtml;
  }

  dispose() {
    this.rootHtml.remove();
  }

  get innerContentHtml() {
    return /* html*/ `
            <div id="temporalWindow">
            <div id="mynetwork"></div>
            </div>
        `;
  }

  // Change the current date and sync the temporal version to this new date
  changeTime(time) {
    this.currentTime = time;

    // Eventually inform who it may concern (e.g. an associated iTowns layer)
    // that the currentTime has changed:
    this.refreshCallback(this.currentTime);
  }
}
