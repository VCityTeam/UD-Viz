// import { CityObjectModule } from '../../../../CityObjects/CityObjectModule';
// import { CityObjectWindow } from '../../../../CityObjects/View/CityObjectWindow';
import { DocumentLinkInterface } from './DocumentLinkInterface';
// import { CityObjectLinkInterface } from './CityObjectLinkInterface';
import { LinkProvider } from '../ViewModel/LinkProvider';

/**
 * Represents the visual interface of the link module. This class contains
 * two different interfaces: one for the document and the other for the city
 * objects.
 */
export class LinkView {
  /**
   * Constructs the link view.
   *
   * @param {LinkProvider} linkProvider The link service.
   * @param {import('itowns').PlanarView} itownsView The iTowns view.
   * @param {import('itowns').PlanarControls} cameraControls The planar camera controls
   */
  constructor(linkProvider, itownsView, cameraControls) {
    /**
     * The interface extensions for the document module.
     *
     * @type {DocumentLinkInterface}
     */
    this.documentInterface = new DocumentLinkInterface(
      linkProvider,
      itownsView,
      cameraControls
    );

    /**
     * The interface extensions for the city object module.
     *
     * @type {CityObjectLinkInterface}
     */
    this.cityObjectInterface = new CityObjectLinkInterface(this, linkProvider);
  }
}
