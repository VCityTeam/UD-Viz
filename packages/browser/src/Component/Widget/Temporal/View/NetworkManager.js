import { Options as VisNetworkOptions, Network } from 'vis-network';

/**
 * Manager for the graph.
 * It take care of all data needed by vis.js
 */
export class NetworkManager {
  /**
   * Constructs a NetworkManager.
   *
   * @param {string} [id_network=mynetwork] - HTML id which will be the container of the graph
   * @param {object} [data] - Data about nodes, edges and groups will be used to create the network.
   * @param {object[]} [data.nodes=null] - Array of nodes objects
   * @param {string} data.nodes[].id - id of a node
   * @param {string} data.nodes[].label - Label of a node
   * @param {number} data.nodes[].level - Level of a node
   * @param {string} data.nodes[].title - Title of a node
   * @param {number} data.nodes[].startDate - Start date of a node
   * @param {object[]} [data.edges=null] - Array of edges objects
   * @param {string} data.edges[].id - id of a edge
   * @param {string} data.edges[].from - `from` attribute of a edge
   * @param {string} data.edges[].to - `to` attribute of a edge
   * @param {object} data.groups - Groups data
   * @param {number} data.groups.id - id of groups
   * @param {string} data.groups.label - label of groups
   * @param {VisNetworkOptions} [option=null]  - Data about graphics' options for viz.js. See doc for futher details about the possibilities
   */
  constructor(
    id_network = 'mynetwork',
    data = {
      nodes: null,
      edges: null,
      groups: {
        id: 0,
        label: 'consensusScenario',
      },
    },
    option = null
  ) {
    /** @type {Network} hold the network/graph instance created by viz.js */
    this.network = null;
    this.data = data;
    this.option = option;
    this.id_network = id_network;
    this.getAsynchronousData = null;
  }

  /**
   * Kill the simulation network
   * When the graph is shown, a simulation is running. It allows dynamics interactions
   * When killed, the graph disappear.
   */
  destroy() {
    if (this.network !== null) {
      this.network.destroy();
      this.network = null;
    }
  }

  /**
   * Initiate the vis.Network with the container (html), data (nodes & edges) and options (graphics)
   * The data is got asynchronously. It's coming from tileset.json so we need to wait for it.
   */
  init() {
    this.destroy();

    this.data.nodes = this.getAsynchronousData()[0];
    this.data.edges = this.getAsynchronousData()[1];
    const container = document.getElementById(this.id_network);
    this.network = new Network(container, this.data, this.option);
  }

  /**
   * Add callback to the graph
   * Click on node = event
   * Click on edge = event
   * In both case, a date is passed
   *
   * @param {Function} callback - the function to be called when a node or edge is clicked.
   */
  add_event(callback) {
    this.network.on('selectNode', function (params) {
      const nodeId = this.getNodeAt(params.pointer.DOM);
      const node = this.body.nodes[nodeId];
      const time = node.options.name;
      callback(time);
    });

    this.network.on('selectEdge', function (params) {
      const edgeId = this.getEdgeAt(params.pointer.DOM);
      const connectedNodesId = this.getConnectedNodes(edgeId);
      const from_time = this.body.nodes[connectedNodesId[0]].options.name;
      const to_time = this.body.nodes[connectedNodesId[1]].options.name;
      const time = (from_time / 1 + to_time / 1) / 2;
      callback(time);
    });
  }
}
