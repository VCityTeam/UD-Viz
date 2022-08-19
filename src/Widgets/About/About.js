/** @format */

// Components
import { ModuleView } from '../Components/ModuleView/ModuleView';
import jQuery from 'jquery';
import './About.css';

/**
 * Adds an "About" window that can be open/closed with a button
 * simply include this file in the html, no need to instanciate anything in main.js
 */
export class AboutWindow extends ModuleView {
  constructor(config = {}) {
    super();
    this.config = config;
  }

  // ///// MODULE VIEW MANAGEMENT
  enableView() {
    const widgetlayout = document.getElementById('_widget_layout');
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

  disableView() {
    document.getElementById('_widget_layout').style.setProperty('display', 'none');
    document.getElementById('_widget_layout').innerHTML = '';
  }
}
