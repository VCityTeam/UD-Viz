import { SparqlEndpointResponseProvider } from './Service/SparqlEndpointResponseProvider';
import { SparqlWidgetView } from './View/SparqlWidgetView';
import { LayerManager } from '../../../Itowns/LayerManager/LayerManager';
import { CityObjectProvider } from '../../CityObjects/ViewModel/CityObjectProvider';

/**
 * The SPARQL module class used to initialize the SPARQL widget
 */
export class SparqlModule {
  /**
   * Creates a new SPARQL Module.
   *
   * @param {object} configSparqlServer The sparql server configuration.
   * @param {object|undefined} configSparqlWidget The sparqlWidget view configuration.
   * @param {LayerManager} layerManager The UD-Viz LayerManager.
   * @param {CityObjectProvider} cityObjectProvider A cityObjectProvider used to provide interaction between the SPARQL widget view and CityObjects.
   */
  constructor(
    configSparqlServer,
    configSparqlWidget,
    layerManager,
    cityObjectProvider
  ) {
    /**
     * Manages data layers visualized in the application.
     *
     * @type {LayerManager}
     */
    this.layerManager = layerManager;

    /**
     * Manages events and HTTP responses from SPARQL Endpoint.
     *
     * @type {SparqlEndpointResponseProvider}
     */
    this.sparqlProvider = new SparqlEndpointResponseProvider(
      configSparqlServer
    );

    /**
     * Provides CityObjects based on mouse event positions or batch table data.
     *
     * @type {CityObjectProvider}
     */
    this.cityObjectProvider = cityObjectProvider;

    /**
     * Contains a SparqlWidgetView for managing the user interface and view.
     * Created if a configSparqlWidget is passed to the module.
     *
     * @type {SparqlWidgetView}
     */
    if (configSparqlWidget) {
      this.view = new SparqlWidgetView(
        this.sparqlProvider,
        this.cityObjectProvider,
        this.layerManager,
        configSparqlWidget
      );
    }
  }
}
