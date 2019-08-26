import { LinkService } from "./Model/LinkService";
import { DocumentModule } from "../Documents/DocumentModule";
import { CityObjectModule } from "../CityObjects/CityObjectModule";
import { RequestService } from "../../Utils/Request/RequestService";
import { LinkView } from "./View/LinkView";
import { LinkProvider } from "./ViewModel/LinkProvider";
import { Window } from "../../Utils/GUI/js/Window";

/**
 * Manages the links between the city objects and the documents. This modules
 * fetches the links from the server and displays them in the document and city
 * object modules by adding extensions.
 */
export class LinkModule {
  /**
   * Creates the link module.
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
    /**
     * The link service.
     * 
     * @type {LinkService}
     */
    this.service = new LinkService(requestService, config);

    /**
     * The link provider.
     * 
     * @type {LinkProvider}
     */
    this.provider = new LinkProvider(documentModule.provider, cityObjectModule.provider, this.service, config);
    this.provider.fetchLinks().then(() => {
      this.view = new LinkView(documentModule, cityObjectModule, this.provider,
        itownsView, cameraControls);
    });

    documentModule.view.addEventListener(Window.EVENT_DISABLED, () => {
      if (cityObjectModule.provider.getLayer().filter.label === 'linkDisplayedDoc') {
        cityObjectModule.provider.removeLayer();
      }
    });
  }
}