/**
* Classe: UpdateDoc
* Description :
* The UpdateDoc is an object handling the update of one Document
*/

import '../Documents/DocumentsHandler.js';

export function UpdateDoc(doc, url) {

  // initialization
  // The update window is displayed
  // the update form is generated using alpaca
  // the document image is shown
  //=========================================================================
  this.initialize = function initialize(){

    this.previewImage = doc.imageSourceBD;
    this.id = doc.doc_ID;
    this.url = url + "app_dev.php/editDocument/";
    //  this.url = "http://rict.liris.cnrs.fr/APIVilo3D/APIExtendedDocument/web/app_dev.php/editDocument/";
    //setup display
    document.getElementById('updateDocWindow').style.display = "block";
    document.getElementById('docBrowserWindow').style.display = "none";
    $("#updateForm").alpaca('get').setValue(doc);
    document.getElementById('filePreview').src = this.previewImage;
  }

  this.initialize();

  // SAVEUPDATE: save document's update
  // using function PostUpdateDoc
  //=========================================================================
  this.saveUpdate = function saveUpdate(){
    var form_data = new FormData(document.getElementById('updateForm'));
    //debug
    /*
    for (var pair of form_data.entries()){
      console.log(pair[0]+ ', ' + pair[1]);
    }*/
    this.url += this.id;
    PostUpdateDoc(this.url ,form_data, function() {});
    this.closeUpdateWindow();
  }


  // close the updatewindow
  //=========================================================================
  this.closeUpdateWindow = function closeUpdateWindow(){
    document.getElementById('updateDocWindow').style.display = "none";
  }

  // event listeners for buttons
  document.getElementById('closeUpdateForm').addEventListener("mousedown",this.closeUpdateWindow.bind(this),false);
  document.getElementById('saveUpdateButton').addEventListener("mousedown", this.saveUpdate.bind(this),false);

}

// FUNCTION POSTUPDATEDOC document updates to a given URL (to the database)
//=========================================================================
function PostUpdateDoc(url,data, callback){
  var req = new XMLHttpRequest();
  req.open('POST',url);
  req.addEventListener("load", function () {
      if (req.status >= 200 && req.status < 400) {
        alert('Document has been updated');
        callback(req.responseText);
      }
      else {
        console.error(req.status + " " + req.statusText + " " + url);
      }
  });
  req.addEventListener("error", function () {
      console.error("Network error with url: " + url);
  });
  req.send(data);
}
