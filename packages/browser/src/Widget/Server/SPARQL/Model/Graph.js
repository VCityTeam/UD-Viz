/** @class */
export class Graph {
  /**
   * Create a new Table using D3.
   *
   * @param {object} response A JSON object typically returned by a SparqlEndpointResponseProvider.EVENT_ENDPOINT_RESPONSE_UPDATED event
   */
  constructor() {
    this.nodes = [
      // { id: 'x', color_id: 1 },
      // { id: 'y', color_id: 2, type:MyClass },
    ];
    this.links = [
      // { source: 'x', target: 'y', label: 1 }
    ];
    this.typeList = [];
  }

  /**
   * update the graph nodes and links.
   *
   * @param {object} response A JSON object returned by a SparqlEndpointResponseProvider.EVENT_ENDPOINT_RESPONSE_UPDATED event
   */
  formatResponseData(response) {
    /* If the query is formatted using subject, predicate, object, and optionally
        subjectType and objectType variables the node color based on the type of the
        subject or object's respective type */
    if (
      !response.head.vars.includes('subject') ||
      !response.head.vars.includes('predicate') ||
      !response.head.vars.includes('object')
    ) {
      throw (
        'Missing endpoint response bindings for graph construction. Needs at least "subject", "predicate", "object". Found binding: ' +
        response.head.vars
      );
    }
    for (const triple of response.results.bindings) {
      if (
        // if the subject doesn't exist yet
        this.nodes.find((n) => n.id == triple.subject.value) == undefined
      ) {
        const node = { id: triple.subject.value };
        if (
          // if there is a subjectType assign a type and color id
          triple.subjectType
        ) {
          node.type = triple.subjectType.value;
          node.color_id = this.getNodeColorId(triple.subjectType.value);
        }
        this.nodes.push(node);
      }
      if (
        // if the object doesn't exist yet
        this.nodes.find((n) => n.id == triple.object.value) == undefined
      ) {
        const node = { id: triple.object.value };
        if (
          // if there is an objectType assign a color id
          triple.objectType
        ) {
          node.type = triple.objectType.value;
          node.color_id = this.getNodeColorId(triple.objectType.value);
        }
        this.nodes.push(node);
      }
      const link = {
        source: triple.subject.value,
        target: triple.object.value,
        label: triple.predicate.value,
      };
      this.links.push(link);
    }

    console.debug(this);
  }

  /**
   * Get the id (or index) of a uri from the typeList. Each type in the type list is used
   * to color nodes in the graph. If the uri does not exist in the typeList, add the uri.
   *
   * @param {string} uri the uri to map to a color index.
   * @returns {number} the index of the color
   */
  getNodeColorId(uri) {
    if (!this.typeList.includes(uri)) {
      this.typeList.push(uri);
    }
    return this.typeList.findIndex((d) => d == uri);
  }

  /**
   * Get a data node by index.
   *
   * @param {number} d the index of the node
   * @returns {object} return the object that represents the datum of a node
   */
  getNodeByIndex(d) {
    return this.nodes[d];
  }

  /**
   * Get a data node by uri.
   *
   * @param {number} uri the uri of the node
   * @returns {object|undefined} return the object that represents the datum of a node
   */
  getNodeByUri(uri) {
    return this.nodes.find((element) => {
      return element.id == uri;
    });
  }

  /**
   * Get all of the links associated with a node by node index.
   *
   * @param {number} d the index of the node
   * @returns {Array<object>} return the objects that represents the datum of the links connected to a node
   */
  getLinksByIndex(d) {
    const uri = this.getNodeByIndex(d).id;
    return this.getLinksByUri(uri);
  }

  /**
   * Get all of the links associated with a node by node uri.
   *
   * @param {number} uri the uri of the node
   * @returns {Array<object>} return the objects that represents the datum of the links connected to a node
   */
  getLinksByUri(uri) {
    const links = [];
    this.links.forEach((element) => {
      if (element.source == uri || element.target == uri) {
        links.push(element);
      }
    });
    return links;
  }
}
