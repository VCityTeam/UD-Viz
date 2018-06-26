import { DocumentResearch } from './DocumentResearch.js';
import './ConsultDoc.css';

export function DocumentController() {

  var researchContainer = document.createElement("div");
  researchContainer. id = "researchContainer";
  document.body.appendChild(researchContainer);
  var documentResearch = new DocumentResearch(researchContainer);

  this.windowIsActive = true;

  // Display or hide this window
  this.activateWindow = function activateWindow( active ){
    if (typeof active != 'undefined') {
      this.windowIsActive = active;
    }
    document.getElementById('researchContainer').style.display = active ? "block" : "none" ;
  }

  this.refresh = function refresh( ){
    this.activateWindow( this.windowIsActive );
  }


}
