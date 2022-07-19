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
        this.enable(this);
      });

    ///////////// Html elements
    const helpDiv = document.createElement('div');
    helpDiv.id = 'helpWindow';
    document.getElementById('contentSection').append(helpDiv);

    // ////////// Build dynamically the html content
    const promises = [];
    if (config.htmlPaths && config.htmlPaths.length) {
      config.htmlPaths.forEach(function (path) {
        promises.push(
          new Promise((resolve, reject) => {
            jQuery.ajax({
              type: 'GET',
              url: path,
              datatype: 'html',
              success: (data) => {
                helpDiv.innerHTML += data;
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
    const closeCallback = this.disable.bind(this);
    Promise.all(promises).then(function () {
      // Create close button
      const closeButton = document.createElement('button');
      closeButton.id = 'helpCloseButton';
      closeButton.innerHTML = 'Close';
      helpDiv.appendChild(closeButton);
      // Close the window...when close button is hit
      closeButton.addEventListener('mousedown', closeCallback, false);
    });

    this.disableView();
  }

  // ///// MODULE VIEW METHODS

  enableView() {
    document.getElementById('helpWindow').style.setProperty('display', 'block');
  }

  disableView() {
    document.getElementById('helpWindow').style.setProperty('display', 'none');
  }
}
