import { DocumentResearch } from './DocumentResearch.js';
import { DocumentBrowser } from './DocumentBrowser.js';
import { DocumentBillboard } from './DocumentBillboard.js';
import './ConsultDoc.css';

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
    $.ajax({
      url : this.url + "app_dev.php/getDocuments",
      data : filterFormData,
      processData: false, //??
      contentType: false,
      type : "GET"
    }).done(function(documents){
      //console.log('filtered documents :');
      //console.log(documents);
      self.setOfDocuments = documents;
      console.log('#1', self.setOfDocuments);
      self.index = 0;
      self.updateDisplay();
      console.log(self.getCurrentDoc);
    })
//update display
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
    console.log('next', currentDoc);
    return this.getCurrentDoc();
  }

  this.getPreviousDoc = function getPreviousDoc(){
    if(this.index > 0 || this.setOfDocuments.length ==0)
    {
      this.index --;
      var currentDoc = this.getCurrentDoc();
      console.log('previous', currentDoc);
      return this.getCurrentDoc();//[this.index];
    }
  }

}
