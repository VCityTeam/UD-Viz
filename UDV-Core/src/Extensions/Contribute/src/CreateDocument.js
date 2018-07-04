export function CreateDocument(creationContainer, contributeController){

  this.contributeController = contributeController;
  this.creationContainer = creationContainer;

  var docCreateButton = document.createElement('button');
  docCreateButton.id = "docCreateButton";
  var text = document.createTextNode("Create");
  docCreateButton.appendChild(text);
  document.getElementById("researchWindowTabs").appendChild(docCreateButton);

  var docBrowserCreateButton = document.createElement('button');
  docBrowserCreateButton.id = "docBrowserCreateButton";
  var word = document.createTextNode("Create");
  docBrowserCreateButton.appendChild(word);
  document.getElementById("browserWindowTabs").appendChild(docBrowserCreateButton);


  this.createDoc = function createDoc(){

  }

  document.getElementById('docCreateButton').addEventListener('mousedown', this.createDoc.bind(this),false);
  document.getElementById('docBrowserCreateButton').addEventListener('mousedown', this.createDoc.bind(this),false);

}
