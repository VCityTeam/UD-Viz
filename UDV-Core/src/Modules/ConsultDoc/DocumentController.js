import { DocumentResearch } from './DocumentResearch.js';
import './ConsultDoc.css';

export function DocumentController() {

  this.url = "http://rict.liris.cnrs.fr/APIVilo3D/APIExtendedDocument/web/";

  this.setOfDocuments = [];

  var researchContainer = document.createElement("div");
  researchContainer. id = "researchContainer";
  document.body.appendChild(researchContainer);
  this.documentResearch = new DocumentResearch(researchContainer, this);

  var browserContainer = document.createElement("div");
  browserContainer. id = "browserContainer";
  document.body.appendChild(browserContainer);
  this.documentBrowser = new DocumentBrowser(browserContainer, this);

  this.documentBillboard = new DocumentBillboard();

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

  this.getDocuments = function getDocuments( filterFormData ){
    $.ajax({
      url : this.url + "app_dev.php/getDocuments",
      data : filterFormData,
      processData: false, //??
      contentType: false,
      type : "GET"
    }).done(function(documents){
      //console.log('filtered documents :');
      console.log(documents);
      this.setOfDocuments = documents;
    })

//update display
  this.updateDisplay();
  }

  this.updateDisplay = function updateDisplay(){

    this.documentBrowser.update(this.setOfDocuments);
    this.documentBillboard.update(this.setOfDocuments);
  }

  this.documentControllerHandler = function documentControllerHandler(){

  }

}
