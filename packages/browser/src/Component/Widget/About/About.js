import jQuery from 'jquery';
import './About.css';

/**
 * Adds an "About" window that can be open/closed with a button
 * simply include this file in the html, no need to instanciate anything in main.js
 *
 * @class
 */
export class About {
  /**
   * The constructor function is a special function that is called when a new instance of the class is
   * created
   *
   * @param {object} [config] - This is the configuration object that is passed to the constructor.
   */
  constructor(config = {}) {
    /** @type {HTMLElement} */
    this.rootHtml = document.createElement('div');
    this.rootHtml.setAttribute('id', 'aboutWindow');

    // Create HMTL
    if (config.htmlPaths && config.htmlPaths.length) {
      config.htmlPaths.forEach((path) => {
        jQuery.ajax({
          type: 'GET',
          url: path,
          datatype: 'html',
          success: (data) => {
            this.rootHtml.innerHTML += data;
          },
          error: (e) => {
            console.error(e);
          },
        });
      });
    }
  }

  /**
   *
   * @returns {HTMLElement} - root html
   */
  html() {
    return this.rootHtml;
  }

  /**
   * remove root html from DOM
   */
  dispose() {
    this.rootHtml.remove();
  }
}
