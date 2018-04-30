import './Help.css';

/**
* adds a "Help" window that can be open/closed with a button
* simply include this file in the html, no need to instanciate anything in main.js
*/

export function HelpWindow( options={} ) {

  ///////////// Html elements
  var helpDiv = document.createElement("div");
  helpDiv.id = 'helpWindow';
  document.body.appendChild(helpDiv);

  document.getElementById("helpWindow").innerHTML =
    '<div id="text">\
       <br>\
       <p><a target="_blank"\
       href="PlanarControls.js">Camera key bindings</a>:</p>\
       <ul>\
         <li>Left-Click: camera translation (drag)</li>\
         <li>Right-Click: camera translation (pan)</li>\
         <li>Ctrl + Left-Click: camera rotation (orbit)</li>\
         <li>Spacebar / Wheel-Click: smart zoom</li>\
         <li>Mouse Wheel: zoom in/out</li>\
         <li>T: orient camera to a top view</li>\
         <li>Y: move camera to start position</li>\
       </ul>\
       <button id="helpCloseButton">Close</button>\
    </div>\
    ';

  ///////////// Class attributes
  // Whether this window is currently displayed or not.
  this.windowIsActive = options.active || true;

  //////////// Behavior

    // Display or hide this window
    this.activateWindow = function activateWindow( active ){
      if (typeof active != 'undefined') {
        this.windowIsActive = active;
        //console.log('coucou');
      }
      document.getElementById('helpWindow').style.display =
                              active ? "block" : "none" ;
    }

    this.refresh = function refresh( ){
      this.activateWindow( this.windowIsActive );
    }

    // Close the window...when close button is hit
    document.getElementById("helpCloseButton").addEventListener(
         'mousedown', this.activateWindow.bind(this, false ), false);

    ///////////// Initialization
    this.refresh( );
}
