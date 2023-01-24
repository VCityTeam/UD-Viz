import { WidgetView } from '../Component/WidgetView/WidgetView';
import jQuery from 'jquery';
import './About.css';

/**
 * Adds an "About" window that can be open/closed with a button
 * simply include this file in the html, no need to instanciate anything in main.js
 *
 * @class
 */
export class AboutWindow extends WidgetView {
  /**
   * The constructor function is a special function that is called when a new instance of the class is
   * created
   *
   * @param {object} [config] - This is the configuration object that is passed to the constructor.
   */
  constructor(config = {}) {
    super();
    /** @type {object} */
    this.config = config;

    this.aboutWindow = null;

    this.aboutWindow = document.createElement('div');
    this.aboutWindow.id = '_about_window';
  }

  /**
   * MODULE VIEW MANAGEMENT
   * It takes an array of paths to HTML files, loads them, and appends them to the widget layout
   */
  enableView() {
    // Create HMTL
    document.getElementById(this.parentElement.id).append(this.aboutWindow);
    this.aboutWindow.style.setProperty('display', 'block');
    const promises = [];
    if (this.config.htmlPaths && this.config.htmlPaths.length) {
      this.config.htmlPaths.forEach((path) => {
        promises.push(
          new Promise((resolve, reject) => {
            jQuery.ajax({
              type: 'GET',
              url: path,
              datatype: 'html',
              success: (data) => {
                this.aboutWindow.innerHTML += data;
                resolve();
              },
              error: (e) => {
                console.error(e);
                reject();
              },
            });
          })
        );
      });
    }
  }

  /**
   * It disables the view by hiding it and clearing its contents
   */
  disableView() {
    if (this.aboutWindow) {
      this.aboutWindow.innerHTML = '';
      this.aboutWindow.style.setProperty('display', 'none');
    }
  }
}
