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
  }

  /**
   * MODULE VIEW MANAGEMENT
   * It takes an array of paths to HTML files, loads them, and appends them to the widget layout
   */
  enableView() {
    const widgetlayout = document.getElementById('_window_widget_content');
    widgetlayout.style.setProperty('display', 'block');
    widgetlayout.innerHTML = '';
    // Create HMTL
    const promises = [];
    if (this.config.htmlPaths && this.config.htmlPaths.length) {
      this.config.htmlPaths.forEach(function (path) {
        promises.push(
          new Promise((resolve, reject) => {
            jQuery.ajax({
              type: 'GET',
              url: path,
              datatype: 'html',
              success: (data) => {
                widgetlayout.innerHTML += data;
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
    document
      .getElementById('_window_widget_content')
      .style.setProperty('display', 'none');
    document.getElementById('_window_widget_content').innerHTML = '';
  }
}
