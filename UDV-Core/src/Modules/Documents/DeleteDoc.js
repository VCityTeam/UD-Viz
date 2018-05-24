import '../Documents/DocumentsHandler.js';

export function DeleteDoc(doc) {

  this.id = doc.doc_ID;



  this.initialize = function initialize(){
    console.log("entering delete class");
  }

  this.ConfirmDeleteOneDocument = function ConfirmDeleteOneDocument(){
console.log(this.id);
    if(confirm('Delete this document permanently?')){
      console.log("deletion");


      var url = "http://rict.liris.cnrs.fr/APIVilo3D/APIExtendedDocument/web/app_dev.php/deleteDocument/" + id;
      var req = new XMLHttpRequest();
      req.open("POST", url);
      req.send();
      alert("The document has been deleted successfully");
      document.getElementById('docBrowserWindow').style.display = "none";
    }
    else {
      alert('The document was not deleted');
    }
  }


  this.initialize();
  this.ConfirmDeleteOneDocument();
}
