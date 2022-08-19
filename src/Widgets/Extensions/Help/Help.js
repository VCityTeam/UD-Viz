/** @format */

// Components
import { ModuleView } from '../../Components/ModuleView/ModuleView';

import jQuery from 'jquery';

import './Help.css';

/**
 * Adds a "Help" window that can be open/closed with a button
 * simply include this file in the html, no need to instanciate anything in main.js
 */

export class HelpWindow extends ModuleView {
  constructor(config = {}) {
    super();
    this.config = config;

    // Button help to open help div
    const helpButton = document.createElement('button');
    helpButton.id = 'help-button';
    document.getElementById('_all_widget_stuct_main_panel').append(helpButton);

    // Image button
    const imgButton = document.createElement('img');
    imgButton.src = './../../../../examples/assets/icons/help.svg';
    helpButton.append(imgButton);

    //Event for openning help window
    helpButton.addEventListener('mousedown',
      () => {
        if (document.getElementById('_widget_layout').style.display == 'block')
          this.disable(this);
        else
          this.enable(this);
      });
  }

  /////// MODULE VIEW METHODS
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
    document.getElementById('_widget_layout').innerHTML = '';
    document.getElementById('_widget_layout').style.setProperty('display', 'none'); 
  }
}
