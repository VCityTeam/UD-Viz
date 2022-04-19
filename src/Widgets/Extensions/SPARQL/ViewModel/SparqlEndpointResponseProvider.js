import { EventSender } from '../../../../Components/Events/EventSender';
import { SparqlEndpointService } from '../Model/SparqlEndpointService';

/**
 * Creates a SPARQL Endpoint Provider which manages treating SPARQL endpoint
 * responses and events for a specific SPARQL Endpoint. Also contains helper
 * functions for manipulating RDF data.
 */
export class SparqlEndpointResponseProvider extends EventSender {
  /**
   * Creates a SPARQL Endpoint Provider
   *
   * @param {SparqlEndpointService} service a SPARQL endpoint service.
   */
  constructor(service) {
    super();

    /**
     * The SPARQL Endpoint Service..
     *
     * @type {SparqlEndpointService}
     */
    this.service = new SparqlEndpointService(service);

    /**
     * The most recent query response.
     *
     * @type {Object}
     */
    this.response_cache = {};

    this.registerEvent(
      SparqlEndpointResponseProvider.EVENT_ENDPOINT_RESPONSE_UPDATED
    );
  }

  /**
   * Query the SPARQL endpoint service
   * @param {string} query
   */
  async querySparqlEndpointService(query) {
    this.response_cache = await this.service.querySparqlEndpoint(query);

    await this.sendEvent(
      SparqlEndpointResponseProvider.EVENT_ENDPOINT_RESPONSE_UPDATED,
      this.response_cache
    );
  }

  ////////////
  ///// EVENTS

  static get EVENT_ENDPOINT_RESPONSE_UPDATED() {
    return 'EVENT_ENDPOINT_RESPONSE_UPDATED';
  }
}
