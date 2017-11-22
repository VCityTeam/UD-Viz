/**
* adds an "About" window that can be open/closed with a button
* simply include this file in the html, no need to instanciate anything in main.js
*/
export function AboutWindow( options={} ) {

  ///////////// Html elements
  var aboutDiv = document.createElement("div");
  aboutDiv.id = 'aboutWindow';
  document.body.appendChild(aboutDiv);

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

  ////////////// Associated stylesheet
  var link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('type', 'text/css');
  link.setAttribute('href', '/src/Modules/Others/About.css');
  document.getElementsByTagName('head')[0].appendChild(link);

  ///////////// Class attributes
  // Whether this window is currently displayed or not.
  this.windowIsActive = options.active || true;

  //////////// Behavior

  // Display or hide this window
  this.activateWindow = function activateWindow( active ){
    if (typeof active != 'undefined') {
      this.windowIsActive = active;
    }
    document.getElementById('aboutWindow').style.display =
                            active ? "block" : "none" ;
  }

  this.refresh = function refresh( ){
    this.activateWindow( this.windowIsActive );
  }

  // Close the window...when close button is hit
  document.getElementById("aboutCloseButton").addEventListener(
       'mousedown', this.activateWindow.bind(this, false ), false);

  ///////////// Initialization
  this.refresh( );
}
