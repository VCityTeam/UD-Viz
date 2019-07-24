import { LinkService } from "./Service/LinkService";
import { DocumentModule } from "../Documents/DocumentModule";
import { RequestService } from "../../Utils/Request/RequestService";
import { DocumentLinkView } from "./View/DocumentLinkView";
import { TilesManager } from "../../Utils/3DTiles/TilesManager";

/**
 * 
 */
export class LinkModule {
  /**
   * 
   * @param {DocumentModule} documentModule The document module.
   * @param {RequestService} requestService The request service.
   * @param {TilesManager} tilesManager The tiles manager.
   * @param {*} itownsView The iTowns view.
   * @param {*} cameraControls The planar camera controls.
   * @param {object} config The UDV config.
   * @param {object} config.server The server configuration.
   * @param {string} config.server.url The server URL.
   * @param {string} config.server.link The link route.
   */
  constructor(documentModule, requestService, tilesManager, itownsView,
    cameraControls, config) {
    this.linkService = new LinkService(requestService, config);

    this.documentLinkView = new DocumentLinkView(documentModule,
      this.linkService, tilesManager, itownsView, cameraControls);
  }
}