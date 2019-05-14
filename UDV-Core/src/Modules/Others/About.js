import './About.css';

/**
 * adds an "About" window that can be open/closed with a button
 * simply include this file in the html, no need to instanciate anything in main.js
 */
export function AboutWindow(options = {}) {

    // Create DOM element
    let aboutDiv = document.createElement("div");
    aboutDiv.id = 'aboutWindow';
    $("#contentSection").append(aboutDiv);

    // Create HMTL
    document.getElementById("aboutWindow").innerHTML =
        '<div id="text">\
             <br>\
             <p>This UDV-Core demo is part of the \
             <a target="_blank"\
                href="https://github.com/MEPP-team/UDV">Urban Data Viewer</a>\
             (UDV) project of the\
             <a target="_blank"\
                href="https://liris.cnrs.fr/vcity/wiki/doku.php">VCity project</a>\
             from\
             <a target="_blank"\
                href="https://liris.cnrs.fr/en">LIRIS lab</a>\
             (with additional support from \
             <a target="_blank"\
                href="http://imu.universite-lyon.fr/"">LabEx IMU</a>).</p>\
             <p>UDV-Core demo is powered with\
                <ul>\
                <li><a href="http://www.itowns-project.org/">iTowns</a></li>\
                <li><a target="_blank"\
                       href="https://data.grandlyon.com">Lyon Métropole Open\ Data</a></li>\
                </ul>\
             </p>\
        </div>\
        <button id="aboutCloseButton">Close</button>\
        ';

    // Close the window...when close button is hit
    document.getElementById("aboutCloseButton").addEventListener(
        'mousedown', () => {
           this.disable();
        }, false);

   /////// MODULE MANAGEMENT FOR BASE DEMO

   this.enable = () => {
      document.getElementById('aboutWindow').style.setProperty('display', 'block');
      this.sendEvent('ENABLED');
   }

   this.disable = () => {
      document.getElementById('aboutWindow').style.setProperty('display', 'none');
      this.sendEvent('DISABLED');
   }

   this.eventListeners = {};

   this.addListener = (event, action) => {
      if (this.eventListeners[event]) {
         this.eventListeners[event].push(action);
      } else {
         this.eventListeners[event] = [
            action
         ];
      }
   }

   this.sendEvent = (event) => {
      let listeners = this.eventListeners[event];
      if (listeners !== undefined && listeners !== null) {
          for (let listener of listeners) {
              listener();
          }
      }
   }
}
