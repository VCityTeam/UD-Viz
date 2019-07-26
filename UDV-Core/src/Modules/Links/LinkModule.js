import { LinkService } from "./Model/LinkService";
import { DocumentModule } from "../Documents/DocumentModule";
import { CityObjectModule } from "../CityObjects/CityObjectModule";
import { RequestService } from "../../Utils/Request/RequestService";
import { LinkView } from "./View/LinkView";
import { LinkProvider } from "./ViewModel/LinkProvider";

/**
 * 
 */
export class LinkModule {
  /**
   * 
   * @param {DocumentModule} documentModule The document module.
   * @param {CityObjectModule} cityObjectModule The city objects module.
   * @param {RequestService} requestService The request service.
   * @param {*} itownsView The iTowns view.
   * @param {*} cameraControls The planar camera controls.
   * @param {object} config The UDV config.
   * @param {object} config.server The server configuration.
   * @param {string} config.server.url The server URL.
   * @param {string} config.server.link The link route.
   */
  constructor(documentModule, cityObjectModule, requestService, itownsView,
    cameraControls, config) {
    this.service = new LinkService(requestService, config);

    this.provider = new LinkProvider(documentModule.provider, cityObjectModule.provider, this.service, config);
    this.provider.fetchLinks().then(() => {
      this.view = new LinkView(documentModule, cityObjectModule, this.provider,
        itownsView, cameraControls);
    });
  }
}