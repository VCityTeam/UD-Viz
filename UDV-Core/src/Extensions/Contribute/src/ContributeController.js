import { CreateDocument }  from './CreateDocument.js';
import { UpdateDocument }   from './UpdateDocument.js';

export function ContributeController(documentController){

  this.documentController = documentController;

  this.documentCreate;
  this.documentUpdate;
  this.creationContainerId = "creationContainer";
  this.updateContainerId = "updateContainer";

  this.initialize = function initialize()
  {
      var updateContainer = document.createElement("div");
      updateContainer.id =   this.updateContainerId;
      document.body.appendChild(updateContainer);
      this.documentUpdate = new UpdateDocument(updateContainer, this);

      var creationContainer = document.createElement("div");
      creationContainer.id = this.creationContainerId;
      document.body.appendChild(creationContainer);
      this.documentCreate = new CreateDocument(creationContainer, this);

  }

this.initialize();


}
