import { SparqlEndpointResponseProvider } from './ViewModel/SparqlEndpointResponseProvider';
import { SparqlModuleView } from './View/SparqlModuleView';
import { LayerManager } from '../../Component/Component';
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
     * Contains a SparqlModuleView for managing the user interface and view.
     *
     * @type {SparqlModuleView}
     */
    this.view = new SparqlModuleView(
      this.sparqlProvider,
      this.cityObjectProvider,
      this.layerManager
    );
  }
}
