import { DocumentController } from './DocumentController.js'
import $ from 'jquery';
import 'alpaca'; //A COMMENTER
/**
*
* @constructor
* @param {HTML DOM Element object}
* @param
*/

export function DocumentResearch( researchContainer, documentController ) {

  this.documentController = documentController;
  researchContainer.innerHTML =
  '<div id = "filtersTitle">Document research</div>\
  <div id = "filtersWindow"></div>\
  <div id="displayModeButtons"></div>\
  <button id = "docResearch">Search</button>\
  ';

  var optionsFilter = "http://rict.liris.cnrs.fr/optionsFilter.json";
  var schema = "http://rict.liris.cnrs.fr/schemaType.json";

//mettre dans repertory
  $('#filtersWindow').alpaca({
    "schemaSource":schema,
    "optionsSource":optionsFilter
  });

  this.windowIsActive = false;

  // Display or hide this window
  this.activateWindow = function activateWindow( active ){
    if (typeof active != 'undefined') {
      this.windowIsActive = active;
    }
    document.getElementById('researchContainer').style.display = active ? "block" : "none " ;
  }

  this.refresh = function refresh( ){
    this.activateWindow( this.windowIsActive );
  }


this.research = function research(){
  var filtersFormData = new FormData(document.getElementById('filterForm'));
  this.documentController.getDocuments(filtersFormData);
}
document.getElementById("docResearch").addEventListener('mousedown', this.research.bind(this),false);

}
