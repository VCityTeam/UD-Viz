import * as d3 from 'd3';
import { tokenizeURI } from './URI';
import { SparqlQueryWindow } from '../View/SparqlQueryWindow';

export class Graph {
  /**
   * Create a new D3 graph from an RDF JSON object.
   * Adapted from https://observablehq.com/@d3/force-directed-graph#chart and
   * https://www.d3indepth.com/zoom-and-pan/
   *
   * @param {SparqlQueryWindow} window the window this graph is attached to.
   * @param {Number} height The SVG height.
   * @param {Number} height The SVG width.
   */
  constructor(window, height = 500, width = 500) {
    this.window = window;
    this.height = height;
    this.width = width;
    this.namespaces = [];
    this.svg = d3
      .create('svg')
      .attr('class', 'd3_graph')
      .attr('viewBox', [0, 0, this.width, this.height])
      .style('display', 'hidden');
  }

  /// Data Functions ///

  /**
   * Create a new graph based on an graph dataset.
   *
   * @param {Object} data an RDF JSON object.
   */
  update(data) {
    this.clear();

    const links = data.links.map((d) => Object.create(d));
    const nodes = data.nodes.map((d) => Object.create(d));
    const namespaces = data.legend;

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3.forceLink(links).id((d) => d.id))
      .force(
        'charge',
        d3.forceManyBody().strength(-60))
      .force(
        'center',
        d3.forceCenter(this.width / 2, this.height / 2));

    const zoom = d3.zoom().on('zoom', this.handleZoom);

    this.svg.call(zoom);

    const link = this.svg
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.8)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', (d) => Math.sqrt(d.value));

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    const node = this.svg
      .append('g')
      .attr('stroke', '#000')
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', 0.75)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 5)
      .attr('fill', (d) => colorScale(d.namespace_id))
      .on('click', (d) =>
        this.window.sendEvent(Graph.EVENT_NODE_SELECTED, d.path[0].textContent)
      )
      .call(this.drag(simulation));

    node.append('title').text((d) => d.id);

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
    });

    // Create legend
    this.svg
    .append('text')
    .attr("x", 10)             
    .attr("y", 16)
    .style("font-size", "14px")
    .style("text-decoration", "underline")
    .text("Legend")
    .style('fill','FloralWhite');

    this.svg
      .append('g')
      .attr('stroke', '#000')
      .attr('stroke-width', 1)
      .selectAll('rect')
      .data(namespaces)
      .join('rect')
      .attr('x', 10)
      .attr('y', (d, i) => 25 + i * 16)
      .attr('width', 10)
      .attr('height', 10)
      .style('fill', (d, i) => colorScale(i))
      .append('title')
      .text((d) => d);

    this.svg
      .append('g')
      .selectAll('text')
      .data(namespaces)
      .join('text')
      .attr('x', 24)
      .attr('y', (d, i) => 35 + i * 16)
      .text((d) => d)
      .style('fill','FloralWhite');
  }


  /**
   * Getter for retrieving the d3 svg.
   */
   get node() {
    return this.svg.node();
  }

  /**
   * return the most recently cached query response formatted for a D3.js graph.
   * @return {Object}
   */
   formatResponseDataAsGraph(data) {
    let graphData = {
      nodes: [
        // { id: 'x', namespace_id: 1 },
        // { id: 'y', namespace_id: 2 },
      ],
      links: [
        // { source: 'x', target: 'y', value: 1 }
      ],
      legend: undefined,
    };

    for (let triple of data) {
      if (
        graphData.nodes.find((n) => n.id == triple.subject.value) == undefined
      ) {
        let subjectNamespaceId = this.getNamespaceIndex(
          triple.subjectType.value
        );
        let node = { id: triple.subject.value, namespace_id: subjectNamespaceId };
        graphData.nodes.push(node);
      }
      if (
        graphData.nodes.find((n) => n.id == triple.object.value) == undefined
      ) {
        let objectNamespaceId = this.getNamespaceIndex(triple.objectType.value);
        let node = { id: triple.object.value, namespace_id: objectNamespaceId };
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
    return graphData;
  }

  /**
   * Get the namespace index of a uri. Add the namespace to the array of namespaces
   * if it does not exist.
   * @param {String} uri the uri to map to a namespace.
   * @return {Number}
   */
  getNamespaceIndex(uri) {
    let namespace = tokenizeURI(uri).namespace;
    if (!this.namespaces.includes(namespace)) {
      this.namespaces.push(namespace);
    }
    return this.namespaces.findIndex((d) => d == namespace);
  }

  /**
   * Hide the graph SVG
   */
  hide() {
    this.svg.style('display', 'hidden');
  }

  /**
   * Show the graph SVG
   */
  show() {
    this.svg.style('display', 'visible');
  }

  /**
   * Remove nodes and lines from the SVG.
   */
  clear() {
    this.svg.selectAll('g').remove();
  }

  /// Interface Functions ///

  /**
   * Create a drag effect for graph nodes within the context of a force simulation
   * @param {d3.forceSimulation} simulation
   * @returns {d3.drag}
   */
  drag(simulation) {
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3
      .drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  /**
   * A handler function for selecting elements to transform during a zoom event
   * @param {d3.D3ZoomEvent} event
   */
  handleZoom(event) {
    d3.selectAll('svg g')
      .filter((d, i) => i < 2)
      .attr('transform', event.transform);
  }

  static get EVENT_NODE_SELECTED() {
    return 'EVENT_NODE_SELECTED';
  }
}