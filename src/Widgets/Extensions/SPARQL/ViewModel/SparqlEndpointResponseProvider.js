import { EventSender } from '../../../Components/Events/EventSender';
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
    this.data = {};

    /**
     * An array containing each namespace in the dataset.
     *
     * @type {Array}
     */
    this.namespaces = [];

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
        // { id: 'x', namespace: 1 },
        // { id: 'y', namespace: 2 },
      ],
      links: [
        // { source: 'x', target: 'y', value: 1 }
      ],
      legend: undefined,
    };

    for (let triple of this.data.results.bindings) {
      if (
        graphData.nodes.find((n) => n.id == triple.subject.value) == undefined
      ) {
        let subjectNamespaceId = this.getNamespaceIndex(
          triple.subjectType.value
        );
        let node = { id: triple.subject.value, namespace: subjectNamespaceId };
        graphData.nodes.push(node);
      }
      if (
        graphData.nodes.find((n) => n.id == triple.object.value) == undefined
      ) {
        let objectNamespaceId = this.getNamespaceIndex(triple.objectType.value);
        let node = { id: triple.object.value, namespace: objectNamespaceId };
        graphData.nodes.push(node);
      }
      let link = {
        source: triple.subject.value,
        target: triple.object.value,
        label: triple.predicate.value,
      };
      graphData.links.push(link);
    }
    graphData.legend = this.namespaces;
    console.log(graphData);
    console.log(this.namespaces);
    return graphData;
  }

  /**
   * return the most recently cached query response formatted for a table.
   * @return {Object | undefined}
   */
  getResponseDataAsTable() {
    //TODO: implement me!
    return undefined;
  }

  /**
   * Tokenize a URI into a namespace and id
   * @param {string} uri
   * @returns {Object}
   */
  tokenizeURI(uri) {
    let tokenizedURI = {};
    if (uri.includes('#')) {
      let uriTokens = uri.split('#');
      tokenizedURI.namespace = uriTokens[0] + '#';
      tokenizedURI.id = uriTokens[1];
    } else {
      let uriTokens = uri.split('/');
      tokenizedURI.id = uriTokens[uriTokens.length - 1];
      uriTokens[uriTokens.length - 1] = '';
      tokenizedURI.namespace = uriTokens.join('/');
    }
    return tokenizedURI;
  }

  /**
   * Get the namespace index of a uri. Add the namespace to the array of namespaces
   * if it does not exist.
   * @param {String} uri the uri to map to a namespace.
   * @return {Number}
   */
  getNamespaceIndex(uri) {
    let namespace = this.tokenizeURI(uri).namespace;
    if (!this.namespaces.includes(namespace)) {
      this.namespaces.push(namespace);
    }
    return this.namespaces.findIndex((d) => d == namespace);
  }

  ////////////
  ///// EVENTS

  static get EVENT_ENDPOINT_RESPONSE_UPDATED() {
    return 'EVENT_ENDPOINT_RESPONSE_UPDATED';
  }
}
