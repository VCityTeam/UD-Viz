//import './DocumentsBrowser.js';
//import './Contribute.css';

export function DeleteDoc(doc, root_url) {


  this.initialize = function initialize(){
    this.id = doc.doc_ID;
    this.url = root_url + "/deleteDocument/" + this.id;
    console.log(this.url);
  }

  this.ConfirmDeleteOneDocument = function ConfirmDeleteOneDocument(){
    if(confirm('Delete this document permanently?')){
      console.log("deletion");
  //    var url = "http://127.0.0.1/APIExtendedDocument/web/app_dev.php/deleteDocument/" + this.id;
    //  var url = "http://rict.liris.cnrs.fr/APIVilo3D/APIExtendedDocument/web/app_dev.php/deleteDocument/" + this.id;
      var req = new XMLHttpRequest();
      req.open("POST", this.url);
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
