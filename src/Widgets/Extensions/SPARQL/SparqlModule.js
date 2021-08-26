import { SparqlEndpointResponseProvider } from './service/SparqlEndpointResponseProvider';
import { SparqlEndpointService } from './service/SparqlEndpointService';
import { SparqlModuleView } from './view/SparqlModuleView';
import { SparqlQueryWindow } from './view/SparqlQueryWindow';

/**
 * The SPARQL module class used to initialize the SPARQL widget
 */
export class SparqlModule {
  /**
   * Creates a new SPARQL Module.
   *
   * @param {object} config The configuration of UD-Viz.
   * @param {object} config.sparqlModule The sparqlModule configuration.
   * @param {string} config.sparqlModule.url The SPARQL endpoint url.
   */
  constructor(config) {
    this.config = config;

    /**
     * Contains connection information for the SPARQL Endpoint service.
     *
     * @type {SparqlEndpointService}
     */
    this.service = new SparqlEndpointService(this.config);

    /**
     * Manages events and HTTP responses from SPARQL Endpoint.
     *
     * @type {SparqlEndpointResponseProvider}
     */
    this.provider = new SparqlEndpointResponseProvider(this.service);

    /**
     * Contains a SparqlQueryWindow for capturing user input.
     *
     * @type {SparqlQueryWindow}
     */
    this.view = new SparqlModuleView(this.service, this.provider);
  }
}
