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

    // /////////// Html elements
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
  }

  // ///// MODULE VIEW METHODS

  enableView() {
    document.getElementById('helpWindow').style.setProperty('display', 'block');
  }

  disableView() {
    document.getElementById('helpWindow').style.setProperty('display', 'none');
  }
}
