import { DocumentController } from './DocumentController.js'
import $ from 'jquery';
import 'alpaca'; //A COMMENTER
/**
*
* @constructor
* @param {HTML DOM Element object}
* @param
*/

export function DocumentResearch( researchContainer ) {

  researchContainer.innerHTML =
  '<div id = "filtersTitle">Document research</div>\
  <div id = "filtersWindow"></div>\
  <div id="displayModeButtons"></div>\
  <button id = "docInBrowser">Browser</button>\
  <button id = "docInBillboard">Billboards</button>\
  ';

  var optionsFilter = "http://rict.liris.cnrs.fr/optionsFilter.json";
  var schema = "http://rict.liris.cnrs.fr/schemaType.json";

//mettre dans repertory
  $('#filtersWindow').alpaca({
    "schemaSource":schema,
    "optionsSource":optionsFilter
  });

}
