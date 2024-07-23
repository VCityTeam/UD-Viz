/** @class */
export class Graph {
  /**
   * Create a new Table using D3.
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
    this._nodes = []; // store the hidden nodes
    this._links = []; // store the hidden links

    this.legend = []; // associate a type to a color
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

  /**
   * Remove nodes and lines from the SVG.
   */
  clear() {
    this.nodes = [];
    this.links = [];
    this._nodes = [];
    this._links = [];
    this.typeList = [];
    this.legend = [];
  }
}
