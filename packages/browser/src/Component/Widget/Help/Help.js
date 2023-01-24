import { WidgetView } from '../Component/WidgetView/WidgetView';

import jQuery from 'jquery';

import './Help.css';

/**
 * Adds a "Help" window that can be open/closed with a button
 * simply include this file in the html, no need to instanciate anything in main.js
 */

export class HelpWindow extends WidgetView {
  constructor(uiParent, config = {}) {
    super();
    this.config = config;
    this.uiParent = uiParent;

    this.helpWindow = document.createElement('div');
    this.helpWindow.id = '_help_window';
    this.helpWindow.style.setProperty('display', 'none');
    document.getElementById(this.uiParent.id).append(this.helpWindow);

    // Button help to open help div
    const helpButton = document.createElement('button');
    helpButton.id = '_help_button';
    document.getElementById(this.uiParent.id).append(helpButton);

    // Image button
    const imgButton = document.createElement('img');
    imgButton.src = config.icon_path;
    helpButton.append(imgButton);

    // Event for openning help window
    helpButton.addEventListener('mousedown', () => {
      if (document.getElementById(this.helpWindow.id).style.display == 'block')
        this.disable(this);
      else this.enable(this);
    });
  }

  // ///// MODULE VIEW METHODS
  enableView() {
    document.getElementById(this.uiParent.id).append(this.helpWindow);
    this.helpWindow.style.setProperty('display', 'block');
    this.helpWindow.innerHTML = '';
    // Create HMTL
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
                this.helpWindow.innerHTML += data;
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
    this.helpWindow.innerHTML = '';
    this.helpWindow.style.setProperty('display', 'none');
  }
}
