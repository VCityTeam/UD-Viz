import { RequestService } from '../Component/RequestService';
import { Window } from '../../Component/GUI/js/Window';
import { LinkService } from './Model/LinkService';
import { DocumentModule } from '../Documents/DocumentModule';
import { CityObjectModule } from '../../CityObjects/CityObjectModule';
import { LinkView } from './View/LinkView';
import { LinkProvider } from './ViewModel/LinkProvider';

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
   * @param {object} configServer The server configuration.
   * @param {string} configServer.url The server URL.
   * @param {string} configServer.link The link route.
   * @param {object} configCityObjects - need description
   */
  constructor(
    documentModule,
    cityObjectModule,
    requestService,
    itownsView,
    cameraControls,
    configServer,
    configCityObjects
  ) {
    /**
     * The link service.
     *
     * @type {LinkService}
     */
    this.service = new LinkService(requestService, configServer);

    /**
     * The link provider.
     *
     * @type {LinkProvider}
     */
    this.provider = new LinkProvider(
      documentModule.provider,
      cityObjectModule.provider,
      this.service,
      configCityObjects
    );
    this.provider.fetchLinks().then(() => {
      this.view = new LinkView(
        documentModule,
        cityObjectModule,
        this.provider,
        itownsView,
        cameraControls
      );
    });

    documentModule.view.addEventListener(Window.EVENT_DISABLED, () => {
      if (!cityObjectModule.provider.getLayer()) {
        return;
      }
      if (
        cityObjectModule.provider.getLayer().filter.label === 'linkDisplayedDoc'
      ) {
        cityObjectModule.provider.removeLayer();
      }
    });
  }
}
