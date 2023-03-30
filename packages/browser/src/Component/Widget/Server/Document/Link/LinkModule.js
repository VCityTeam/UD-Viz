import { RequestService } from '../../../../RequestService';
import { LinkService } from './Model/LinkService';
import { DocumentProvider } from '../Core/ViewModel/DocumentProvider';
import { CityObjectModule } from '../../../CityObjects/CityObjectModule';
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
   * @param {DocumentProvider} documentProvider The document provider.
   * @param {CityObjectModule} cityObjectModule The city objects module.
   * @param {RequestService} requestService The request service.
   * @param {import('itowns').PlanarView} itownsView The iTowns view.
   * @param {import('itowns').PlanarControls} cameraControls The planar camera controls.
   * @param {object} configServer The server configuration.
   * @param {string} configServer.url The server URL.
   * @param {string} configServer.link The link route.
   */
  constructor(
    documentProvider,
    cityObjectModule,
    requestService,
    itownsView,
    cameraControls,
    configServer
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
      documentProvider,
      cityObjectModule.provider,
      this.service
    );

    /**
     * @todo this.view is not create after fetchLinks Promise is that a problem ?
     */
    this.provider.fetchLinks();
    this.view = new LinkView(
      cityObjectModule,
      this.provider,
      itownsView,
      cameraControls
    );
  }
}
