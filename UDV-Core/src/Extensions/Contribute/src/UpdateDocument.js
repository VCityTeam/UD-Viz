export function UpdateDocument(updateContainer, contributeController){

  this.contributeController = contributeController;
  this.updateContainer = updateContainer;
  this.browser = this.contributeController.documentController.documentBrowser;

  var docUpdateButton = document.createElement('button');
  docUpdateButton.id = "docUpdateButton";
  var text = document.createTextNode("Update");
  docUpdateButton.appendChild(text);
  document.getElementById("browserWindowTabs").appendChild(docUpdateButton);

  var docDeleteButton = document.createElement('button');
  docDeleteButton.id = "docDeleteButton";
  var text = document.createTextNode("Delete");
  docDeleteButton.appendChild(text);
  document.getElementById("browserWindowTabs").appendChild(docDeleteButton);

  this.updateDoc = function updateDoc(){

  }

  this.deleteDoc = function deleteDoc(){

  }

  document.getElementById('docUpdateButton').addEventListener('mousedown', this.updateDoc.bind(this),false);
  document.getElementById('docDeleteButton').addEventListener('mousedown', this.deleteDoc.bind(this),false);

}
