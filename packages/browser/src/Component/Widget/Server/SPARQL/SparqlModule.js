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
   * @param {object} configSparql The sparqlModule configuration.
   * @param {string} configSparql.url The SPARQL endpoint url.
   * @param {LayerManager} layerManager The UD-Viz LayerManager.
   */
  constructor(configSparql, layerManager) {

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
    this.sparqlProvider = new SparqlEndpointResponseProvider(configSparql);

    /**
     * Provides CityObjects based on mouse event positions or batch table data.
     *
     * @type {CityObjectProvider}
     */
    this.cityObjectProvider = new CityObjectProvider(this.layerManager);

    /**
     * Contains a SparqlWidgetView for managing the user interface and view.
     *
     * @type {SparqlWidgetView}
     */
    this.view = new SparqlWidgetView(
      this.sparqlProvider,
      this.cityObjectProvider,
      this.layerManager
    );
  }
}
