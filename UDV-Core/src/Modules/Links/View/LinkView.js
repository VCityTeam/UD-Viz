import { DocumentModule } from "../../Documents/DocumentModule";
import { CityObjectModule } from "../../CityObjects/CityObjectModule";
import { LinkService } from "../Model/LinkService";
import { DocumentLinkInterface } from "./DocumentLinkInterface";
import { CityObjectLinkInterface } from "./CityObjectLinkInterface";
import { DocumentInspectorWindow } from "../../Documents/View/DocumentInspectorWindow";
import { LinkProvider } from "../ViewModel/LinkProvider";

/**
 * Represents the visual interface of the link module. This class contains
 * two different interfaces: one for the document and the other for the city
 * objects.
 */
export class LinkView {
  /**
   * Constructs the link view.
   * 
   * @param {DocumentModule} documentModule The document module.
   * @param {CityObjectModule} cityObjectModule The city object module.
   * @param {LinkProvider} linkProvider The link service.
   * @param {*} itownsView The iTowns view.
   * @param {*} cameraControls The planar camera controls 
   */
  constructor(documentModule, cityObjectModule, linkProvider, itownsView,
    cameraControls) {

    this.documentView = documentModule.view;
    this.cityObjectView = cityObjectModule.view;

    this.documentInterface = new DocumentLinkInterface(documentModule, linkProvider, itownsView, cameraControls);

    this.cityObjectInterface = new CityObjectLinkInterface(this, cityObjectModule, linkProvider);
  }

  requestDisplayDocuments() {
    this.documentView.enable();
  }

  requestDisplayCityObjects() {
    this.cityObjectView.enable();
  }
}