import { DocumentModule } from "../Documents/DocumentModule";
import { DocumentImageOrienter } from "./View/DocumentImageOrienter";

export class DocumentVisualizer {
  /**
   * Creates the document visualizer.
   * 
   * @param {DocumentModule} documentModule The documents module
   */
  constructor(documentModule) {
    this.documentModule = documentModule;

    this.imageOrienter = new DocumentImageOrienter();

    this.documentModule.addDocumentWindow(this.imageOrienter);
    this.documentModule.addDisplayedDocumentCommand('Orient', () => {
      this.imageOrienter.startTravel();
    });
  }

}