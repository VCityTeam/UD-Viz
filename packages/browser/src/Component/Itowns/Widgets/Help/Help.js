import { WidgetView } from '../Component/WidgetView/WidgetView';

import jQuery from 'jquery';

import './Help.css';

/**
 * Adds a "Help" window that can be open/closed with a button
 * simply include this file in the html, no need to instanciate anything in main.js
 */

export class HelpWindow extends WidgetView {
  constructor(config = {}) {
    super();
    this.config = config;

    // Button help to open help div
    const helpButton = document.createElement('button');
    helpButton.id = 'help-button';
    document.getElementById('_all_widget_stuct_main_panel').append(helpButton);

    // Image button
    const imgButton = document.createElement('img');
    imgButton.src = config.icon_path;
    helpButton.append(imgButton);

    // Event for openning help window
    helpButton.addEventListener('mousedown', () => {
      if (
        document.getElementById('_window_widget_content').style.display ==
        'block'
      )
        this.disable(this);
      else this.enable(this);
    });
  }

  // ///// MODULE VIEW METHODS
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

  disableView() {
    document.getElementById('_window_widget_content').innerHTML = '';
    document
      .getElementById('_window_widget_content')
      .style.setProperty('display', 'none');
  }
}
