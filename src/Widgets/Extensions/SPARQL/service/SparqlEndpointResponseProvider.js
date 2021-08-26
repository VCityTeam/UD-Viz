import { EventSender } from '../../../Components/Events/EventSender';
import { SparqlEndpointService } from './SparqlEndpointService';

/**
 * Creates a SPARQL Endpoint Provider which manages treating SPARQL endpoint
 * responses and events for a specific SPARQL Endpoint.
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
     * The most recent query response.
     *
     * @type {string}
     */
    this.data = undefined;

    /**
     * The SPARQL Endpoint Service.
     *
     * @type {SparqlEndpointService}
     */

    this.service = service;

    this.registerEvent(
      SparqlEndpointResponseProvider.EVENT_ENDPOINT_RESPONSE_UPDATED
    );
  }

  /**
   * Query the SPARQL endpoint service
   * @param {string} query
   */
  async querySparqlEndpointService(query) {
    this.data = await this.service.querySparqlEndpoint(query);
    await this.sendEvent(
      SparqlEndpointResponseProvider.EVENT_ENDPOINT_RESPONSE_UPDATED,
      this.getResponseDataAsGraph()
    );
  }

  /**
   * return the most recently cached query response formatted for a D3.js graph.
   * @return {Object}
   */
  getResponseDataAsGraph() {
    let graphData = {
      nodes: [
        // { id: 'x', group: 1 },
        // { id: 'y', group: 2 },
      ],
      links: [
        // { source: 'x', target: 'y', value: 1 }
      ],
    };

    for (let triple of this.data.results.bindings) {
      if (!graphData.nodes.includes({ id: triple.subject.value })) {
        let node = { id: triple.subject.value };
        graphData.nodes.push(node);
      }
      if (!graphData.nodes.includes({ id: triple.object.value })) {
        let node = { id: triple.object.value };
        graphData.nodes.push(node);
      }
      let link = {
        source: triple.subject.value,
        target: triple.object.value,
        label: triple.predicate.value,
      };
      graphData.links.push(link);
    }
    console.log(graphData)
    return graphData;
  }

  /**
   * return the most recently cached query response formatted for a table.
   * @return {Object | undefined}
   */
  get getResponseDataAsTable() {
    return this.tableData;
  }

  ////////////
  ///// EVENTS

  static get EVENT_ENDPOINT_RESPONSE_UPDATED() {
    return 'EVENT_ENDPOINT_RESPONSE_UPDATED';
  }
}
