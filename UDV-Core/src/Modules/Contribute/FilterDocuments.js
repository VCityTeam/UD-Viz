///
import * as THREE from 'three';
import { MAIN_LOOP_EVENTS } from 'itowns';
import { Document } from '../Documents/Document.js'
import { readCSVFile } from '../../Tools/CSVLoader.js';
import '../Documents/DocumentsHandler.css';
import DefaultImage from '../Documents/DefaultImage.png';
import './DocumentPositioner.css';

///help https://jsfiddle.net/vert3x/pv4oxrLd/

export function FilterDocuments(view, controls, dataFile, options = {}) {

  var filterDoc = document.createElement("div");
  filterDoc.id = 'filterDoc';
  document.body.appendChild(filterDoc);

  document.getElementById("filterDoc").innerHTML =
  '<div id="filterDocWindow">\
  <label id="title" >Document upload</label>\
  <br></br>\
  <div id="filtersWindow">\
  <form id="filterDocForm">\
  <p></p>\
  <label>Subjet</label><br></br>\
   <select>\
     <option value="subj1">Subject 1</option>\
     <option value="subj2">Subject 2</option>\
     <option value="subj3">Subject 3</option>\
  </select> \
  <br></br>\
  <label>Type</label><br></br>\
  <select>\
    <option value="type1">Drawing</option>\
    <option value="type2">Picture</option>\
    <option value="type3">Text</option>\
  </select> \
  <br></br>\
  <label>Start date</label>\
  <input type="date" name="startDate" id="startDate"required/>\
  <br></br>\
  <label>End date</label>\
  <input type="date" name="endDate" id="endDate" required/>\
  <p id="demo"></p>\
  <br></br>\
  <button id = "docInBrowser">Show docs in browser</button>\
  <button id = "docInBillboard">Show docs in billboard</button>\
  </div>\
  </div>\
  ';

  this.windowIsActive = options.active || false;

  // Display or hide this window
  this.activateWindow = function activateWindow( active ){
    if (typeof active != 'undefined') {
      this.windowIsActive = active;
    }
    document.getElementById('filterDocWindow').style.display = active ? "block" : "none" ;
  }

  this.refresh = function refresh( ){
    this.activateWindow( this.windowIsActive );
  }

  this.refresh( );

  //document.getElementById("demo").innerHTML = this.responseText;
  //ajaxGET DOC communication with Joris'API
  //if validation OK then
  // - create GET request
  // - update / create csv file so that it can be used by the document browser previously implemented
  // - show documents in the docBrowser

  function ajaxGetDocs(url, data, callback) {
    //ajax call to get documents
    //si browser alors
    //var url = "jorisurl?";
    var req = new XMLHttpRequest();
    //var data = new FormData(document.getElementById("filterDocForm"));
    data.append("hello","sophia");
    req.open("GET", url);
    req.addEventListener("load", function () {
        if (req.status >= 200 && req.status < 400) {
            callback(req.responseText);
        } else {
            console.error(req.status + " " + req.statusText + " " + url);
        }
    });
    req.addEventListener("error", function () {
        console.error("Network error with url: " + url);
    });

    req.send();
  }


}
