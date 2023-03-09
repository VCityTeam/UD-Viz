import { findChildByID } from '../../../HTMLUtil';

import './TemporalWindow.css';

// JSDOC
import { TemporalOptions } from '../TemporalModule';
/**
 * Handles the GUI part enabling the user to specify the chosen "time" (year)
 * of observation for displayal of the (3D) scene.
 * Note that it is not the Temporal View's responsability to
 * alter/modify/update the scene according to the user specified moment (but
 * only to trigger the possible hook-ups).
 */
export class TemporalSliderWindow {
  /**
   * It creates a new temporal navigation widget, and sets up some default values for the minimum and
   * maximum times that can be displayed, the current time, and the time step
   *
   * @param {Function} refreshCallback - Callback to be called when the time has changed.
   * @param {TemporalOptions} [options] - optional parameters (min time, max time and current time)
   */
  constructor(refreshCallback, options = {}) {
    // Minimum and maximum times that can be displayed by this occurence
    this.minTime = options.minTime || 2009;
    this.maxTime = options.maxTime || 2015;

    // The currently selected timestamp
    this.currentTime = options.currentTime || 2009;

    /** @type {HTMLElement} */
    this.rootHtml = document.createElement('div');
    this.rootHtml.setAttribute('id', 'temporalWindow');
    this.rootHtml.innerHTML = this.innerContentHtml;

    // The timestep used to increment or decrement time with the slide buttons.
    // Note that timeStep is a "duration" as opposed to a timestamp.
    this.timeStep = options.timeStep || 1;

    this.refreshCallback = refreshCallback;

    // Magical code to center an absolute positionned window
    this.rootHtml.style.setProperty('left', '0');
    this.rootHtml.style.setProperty('right', '0');
    this.rootHtml.style.setProperty('margin-left', 'auto');
    this.rootHtml.style.setProperty('margin-right', 'auto');
    // Put it at the bottom of the page
    this.rootHtml.style.setProperty('top', 'unset');
    this.rootHtml.style.setProperty('bottom', '10px');
    this.rootHtml.style.setProperty('margin-bottom', 'auto');
    // Window size and center text
    this.rootHtml.style.setProperty('width', '700px');
    this.rootHtml.style.setProperty('height', '115px');
    this.rootHtml.style.setProperty('text-align', 'center');

    // Hook up the callbacks
    findChildByID(this.rootHtml, 'timeSliderValue').addEventListener(
      'input',
      this.timeSelection.bind(this),
      false
    );
    findChildByID(this.rootHtml, 'timeSlider').addEventListener(
      'input',
      this.timeSelectionSlider.bind(this),
      false
    );
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
            <div id="timeSliderMinDate">${this.minTime}</div>
            <div id="timeSliderMaxDate">${this.maxTime}</div>
            <input type="text" id="timeSliderValue" value=${this.currentTime}>
            <input  id="timeSlider" type="range" min=${this.minTime} max=${this.maxTime}
                    value=${this.currentTime} step=${this.timeStep}>
            </div>
        `;
  }

  // Call back on new user input with the date selector
  timeSelection() {
    this.currentTime = findChildByID(
      this.rootHtml,
      'timeSliderValue'
    ).value.toString();
    findChildByID(this.rootHtml, 'timeSlider').value = this.currentTime;
    // Eventually inform who it may concern (e.g. an associated iTowns layer)
    // that the currentTime has changed:
    this.refreshCallback(this.currentTime);
  }

  // Call back on new user input with the time slider
  timeSelectionSlider() {
    this.currentTime = findChildByID(
      this.rootHtml,
      'timeSlider'
    ).value.toString();
    findChildByID(this.rootHtml, 'timeSliderValue').value = this.currentTime;
    // Eventually inform who it may concern (e.g. an associated iTowns layer)
    // that the currentTime has changed:
    this.refreshCallback(this.currentTime);
  }
}
