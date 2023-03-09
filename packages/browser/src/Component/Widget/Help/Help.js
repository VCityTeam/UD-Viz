import jQuery from 'jquery';

import './Help.css';

/**
 * Adds a "Help" window that can be open/closed with a button
 * simply include this file in the html, no need to instanciate anything in main.js
 */

export class HelpWindow {
  /**
   * Creates a HelpWindow
   *
   * @param {object} config The config of the Window
   */
  constructor(config = {}) {
    this.rootHtml = document.createElement('div');
    this.rootHtml.setAttribute('id', 'helpWindow');

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

  html() {
    return this.rootHtml;
  }

  dispose() {
    this.rootHtml.remove();
  }
}
