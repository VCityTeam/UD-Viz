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

    /**
     * An array containing each uri base in the dataset.
     *
     * @type {Array}
     */
    this.uriBases = [];

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
      legend: undefined
    };

    for (let triple of this.data.results.bindings) {
      if (graphData.nodes.find(n => n.id == triple.subject.value) == undefined) {
        let node = { id: triple.subject.value, group: 0 };
        graphData.nodes.push(node);
      }
      if (graphData.nodes.find(n => n.id == triple.object.value) == undefined) {
        let node = { id: triple.object.value, group: 0 };
        graphData.nodes.push(node);
      }
      if (
        triple.predicate.value ==
        'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' &&
        triple.object.value != 'http://www.w3.org/2002/07/owl#NamedIndividual'
      ) {
        let i = graphData.nodes.findIndex( n => n.id == triple.subject.value );
        if (i >= 0) {
          let groupId = this.getBaseUriIndex(triple.object.value);
          graphData.nodes[i].group = groupId;
        }
      }
      let link = {
        source: triple.subject.value,
        target: triple.object.value,
        label: triple.predicate.value,
      };
      graphData.links.push(link);
    }
    graphData.legend = this.uriBases
    console.log(graphData);
    return graphData;
  }

  /**
   * add a uri to this.uriBases if it does not exist.
   * @param {String} uri the uri to map to a group.
   * @return {Number}
   */
  getBaseUriIndex(uri) {
    let uriBase = uri.split('#')[0];
    if (!this.uriBases.includes(uriBase)) {
      this.uriBases.push(uriBase);
    }
    return this.uriBases.findIndex((d) => d == uriBase);
  }

  /**
   * return the most recently cached query response formatted for a table.
   * @return {Object | undefined}
   */
  getResponseDataAsTable() {
    return this.tableData;
  }

  ////////////
  ///// EVENTS

  static get EVENT_ENDPOINT_RESPONSE_UPDATED() {
    return 'EVENT_ENDPOINT_RESPONSE_UPDATED';
  }
}
