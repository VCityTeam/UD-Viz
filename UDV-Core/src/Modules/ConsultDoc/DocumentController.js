/**
* Class: DocumentController
* Description :
* The Document Handler is an object holding and managing Document objects
* It handles the display of documents in the document browser window, the central window, and billboards.
* Documents are objects with properties : source image, title, date, metadata, camera position,
* camera quaternion (both for the oriented view) and billboard position
*/

import { DocumentResearch } from './DocumentResearch.js';
import { DocumentBrowser } from './DocumentBrowser.js';
import { DocumentBillboard } from './DocumentBillboard.js';
import './ConsultDoc.css';





// TO DO : pass showBillboardButton as an option to DocumentsHandler
// currently, BILLBOARDS WILL BE ALWAYS HIDDEN if the showBillboardButton global var is set to false !!

/**
* Constructor for DocumentsHandler Class
* The Document Handler is an object holding and managing Document objects.
* It handles the display of documents in the document browser window and the central window.
* Document data is loaded from a csv file, and initialization is only done after loading (asynchronous)
* @param view : itowns planar view
* @param controls : PlanarControls instance
* @param dataFile : CSV file holding the documents data
* @param options : optional parameters (including TemporalController)
*/
//=============================================================================
export function DocumentController(controls) {

  this.url = "http://rict.liris.cnrs.fr/APIVilo3D/APIExtendedDocument/web/";
  this.controls = controls; //FIXME
  this.setOfDocuments = [];
  this.index = 0;

  var researchContainer = document.createElement("div");
  researchContainer. id = "researchContainer";
  document.body.appendChild(researchContainer);
  this.documentResearch = new DocumentResearch(researchContainer, this);

  var browserContainer = document.createElement("div");
  browserContainer. id = "browserContainer";
  document.body.appendChild(browserContainer);
  this.documentBrowser = new DocumentBrowser(browserContainer, this);

  this.documentBillboard = new DocumentBillboard();

    this.updateDisplay = function updateDisplay(){
      this.documentBrowser.update();
      this.documentBillboard.update();
    }

  this.getDocuments = function getDocuments( filterFormData ){
    var self = this;
    //console.log(filterFormData);

    $.ajax({
      url : this.url + "app_dev.php/getDocuments",
      data : filterFormData,
      processData: false,
      contentType: false,
      type:'POST',
      success:function(documents){
        self.setOfDocuments = documents;
        console.log('#1', self.setOfDocuments);
        self.index = 0;
        self.updateDisplay();
      },
      error: function(XMLHTTPRequest, textStatus, errorThrown){
        console.alert(textStatus);
      }
    });
  }

  this.getCurrentDoc = function getCurrentDoc(){
    if(this.setOfDocuments.length != 0)
      return this.setOfDocuments[this.index];
    else{
      return null;
    }
  }

  this.getNextDoc = function getNextDoc(){
    if(this.index < this.setOfDocuments.length-1 || this.setOfDocuments.length ==0)
    this.index ++;
    var currentDoc = this.getCurrentDoc();
    //console.log('next', currentDoc);
    return this.getCurrentDoc();
  }

  this.getPreviousDoc = function getPreviousDoc(){
    if(this.index > 0 || this.setOfDocuments.length ==0)
    {
      this.index --;
      var currentDoc = this.getCurrentDoc();
      //console.log('previous', currentDoc);
      return this.getCurrentDoc();//[this.index];
    }
  }

}
