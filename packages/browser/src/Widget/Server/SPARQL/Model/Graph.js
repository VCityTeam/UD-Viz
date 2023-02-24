import * as d3 from 'd3';
import { getUriLocalname, tokenizeURI } from './URI';
import { SparqlQueryWindow } from '../View/SparqlQueryWindow';

export class Graph {
  /**
   * Create a new D3 graph from an RDF JSON object.
   * Adapted from https://observablehq.com/@d3/force-directed-graph#chart and
   * https://www.d3indepth.com/zoom-and-pan/
   *
   * @param {SparqlQueryWindow} window the window this graph is attached to.
   * @param {object} configSparqlWidget The sparqlModule configuration.
   * @param {number} configSparqlWidget.height The SVG canvas height.
   * @param {number} configSparqlWidget.width The SVG canvas width.
   * @param {number} configSparqlWidget.fontSize The font size to use for node and link labels.
   * @param {object} configSparqlWidget.namespaceLabels Prefix declarations which will replace text labels in the Legend.
   *                                                    This doesn't (yet) affect the legend font size.
   */
  constructor(window, configSparqlWidget) {
    if (
      !configSparqlWidget ||
      !configSparqlWidget.height ||
      !configSparqlWidget.width ||
      !configSparqlWidget.fontSize
    ) {
      console.log(configSparqlWidget);
      throw 'The given "configSparqlWidget" configuration is incorrect.';
    }

    this.window = window;
    this.height = configSparqlWidget.height;
    this.width = configSparqlWidget.width;
    this.fontSize = configSparqlWidget.fontSize;
    this.knownNamespaceLabels = configSparqlWidget.namespaceLabels;
    this.typeList = [];
    this.svg = d3
      .create('svg')
      .attr('class', 'd3_graph')
      .attr('viewBox', [0, 0, this.width, this.height])
      .style('display', 'hidden');
    this.data = undefined;
  }

  // / Data Functions ///

  /**
   * return a SPARQL endpoint query response formatted for a D3.js based graph.
   *
   * @param {object} response A JSON object returned by a SparqlEndpointResponseProvider.EVENT_ENDPOINT_RESPONSE_UPDATED event
   * @returns {object} A data object formatted for constructing a D3.js graph svg
   */
  formatResponseData(response) {
    const graphData = {
      nodes: [
        // { id: 'x', color_id: 1 },
        // { id: 'y', color_id: 2, type:MyClass },
      ],
      links: [
        // { source: 'x', target: 'y', label: 1 }
      ],
      legend: {
        title: 'Legend',
        content: [],
      },
      colorSetOrScale: d3.scaleOrdinal(d3.schemeCategory10),
    };

    /* If the query is formatted using subject, predicate, object, and optionally
      subjectType and objectType variables the node color based on the type of the
      subject or object's respective type */
    if (
      !response.head.vars.includes('subject') ||
      !response.head.vars.includes('predicate') ||
      !response.head.vars.includes('object')
    ) {
      throw(
        'Missing endpoint response bindings for graph construction. Needs at least "subject", "predicate", "object". Found binding: ' + response.head.vars
      );
    }
    for (const triple of response.results.bindings) {
      if (
        // if the subject doesn't exist yet
        graphData.nodes.find((n) => n.id == triple.subject.value) ==
        undefined
      ) {
        const node = { id: triple.subject.value };
        if (
          // if there is a subjectType assign a type and color id
          triple.subjectType
        ) {
          node.type = triple.subjectType.value;
          node.color_id = this.getNodeColorId(triple.subjectType.value);
        }
        graphData.nodes.push(node);
      }
      if (
        // if the object doesn't exist yet
        graphData.nodes.find((n) => n.id == triple.object.value) ==
        undefined
      ) {
        const node = { id: triple.object.value };
        if (
          // if there is an objectType assign a color id
          triple.objectType
        ) {
          node.type = triple.objectType.value;
          node.color_id = this.getNodeColorId(triple.objectType.value);
        }
        graphData.nodes.push(node);
      }
      const link = {
        source: triple.subject.value,
        target: triple.object.value,
        label: triple.predicate.value,
      };
      graphData.links.push(link);
      graphData.legend.content = this.typeList;
    }

    console.debug(graphData);
    return graphData;
  }

  /**
   * Clear and update the d3 SVG canvas based on the data from a graph dataset.
   *
   * @param {object} response an RDF JSON object ideally formatted by this.formatResponseData().
   */
  update(response) {
    this.clear();
    this.data = this.formatResponseData(response);

    const links = this.data.links.map((d) => Object.create(d));
    const nodes = this.data.nodes.map((d) => Object.create(d));
    const legend = this.data.legend;
    const colorScale = this.data.colorSetOrScale;
    const setColor = function (d, default_color, override_color = undefined) {
      if (override_color && colorScale) return override_color;
      else if (colorScale) return colorScale(d);
      return default_color;
    };

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3.forceLink(links).id((d) => d.id)
      )
      .force('charge', d3.forceManyBody().strength(-60))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2));

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

    const node = this.svg
      .append('g')
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 4)
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', 0.75)
      .attr('stroke', (d) => setColor(d.color_id, '#ddd', '#111'))
      .attr('fill', (d) => setColor(d.color_id, 'black'))
      .on('click', (event) => {
        this.window.sendEvent(
          Graph.EVENT_NODE_CLICKED,
          event.target.textContent
        );
      })
      .on('mouseover', (event, d) => {
        event.target.style['stroke'] = setColor(
          nodes[d.index].color_id,
          'white',
          'white'
        );
        event.target.style['fill'] = setColor(nodes[d.index].color_id, '#333');
        node_label
          .filter((e, j) => {
            return d.index == j;
          })
          .style('fill', 'white')
          .style('opacity', '1');
        link_label
          .filter((e) => {
            return d.index == e.source.index || d.index == e.target.index;
          })
          .style('fill', 'white')
          .style('opacity', '1');
        this.window.sendEvent(
          Graph.EVENT_NODE_MOUSEOVER,
          event.target.textContent
        );
      })
      .on('mouseout', (event, d) => {
        event.target.style['stroke'] = setColor(
          nodes[d.index].color_id,
          '#ddd',
          '#111'
        );
        event.target.style['fill'] = setColor(nodes[d.index].color_id, 'black');
        node_label
          .filter((e, j) => {
            return d.index == j;
          })
          .style('fill', 'grey')
          .style('opacity', '0.5');
        link_label
          .filter((e) => {
            return d.index == e.source.index || d.index == e.target.index;
          })
          .style('fill', 'grey')
          .style('opacity', '0.5');
        this.window.sendEvent(
          Graph.EVENT_NODE_MOUSEOUT,
          event.target.textContent
        );
      })
      .call(this.drag(simulation));

    node.append('title').text((d) => d.id);

    const node_label = this.svg
      .selectAll('.node_label')
      .data(nodes)
      .enter()
      .append('text')
      .text(function (d) {
        return getUriLocalname(d.id);
      })
      .style('text-anchor', 'middle')
      .style('font-family', 'Arial')
      .style('font-size', this.fontSize)
      .style('text-shadow', '1px 1px black')
      .style('fill', 'grey')
      .style('opacity', '0.5')
      // .style('fill', 'white')
      // .style('visibility', 'hidden')
      .style('pointer-events', 'none')
      .attr('class', 'node_label');

    const link_label = this.svg
      .selectAll('.link_label')
      .data(links)
      .enter()
      .append('text')
      .text(function (d) {
        return getUriLocalname(d.label);
      })
      .style('text-anchor', 'middle')
      .style('font-family', 'Arial')
      .style('font-size', this.fontSize)
      .style('text-shadow', '1px 1px black')
      .style('fill', 'grey')
      .style('opacity', '0.5')
      // .style('fill', 'white')
      // .style('visibility', 'hidden')
      .style('pointer-events', 'none')
      .attr('class', 'link_label');

    simulation.on('tick', () => {
      node_label
        .attr('x', function (d) {
          return d.x;
        })
        .attr('y', function (d) {
          return d.y - 10;
        });
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);
      link_label
        .attr('x', function (d) {
          return (d.source.x + d.target.x) / 2;
        })
        .attr('y', function (d) {
          return (d.source.y + d.target.y) / 2;
        });
      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
    });

    // Create legend
    this.svg
      .append('text')
      .attr('x', 12)
      .attr('y', 24)
      .style('font-size', '18px')
      .style('text-decoration', 'underline')
      .text(legend.title)
      .style('fill', 'FloralWhite');

    // legend colors
    this.svg
      .append('g')
      .attr('stroke', '#111')
      .attr('stroke-width', 1)
      .selectAll('rect')
      .data(legend.content)
      .join('rect')
      .attr('x', 12)
      .attr('y', (d, i) => 32 + i * 16)
      .attr('width', 10)
      .attr('height', 10)
      .style('fill', (d, i) => {
        return setColor(i, '#000');
      })
      .append('title')
      .text((d) => d);

    // legend text
    this.svg
      .append('g')
      .selectAll('text')
      .data(legend.content)
      .join('text')
      .attr('x', 26)
      .attr('y', (d, i) => 41 + i * 16)
      .text((d) => d)
      .style('fill', 'FloralWhite')
      .style('font-size', '14px');
  }

  /**
   * Getter for retrieving the d3 svg.
   *
   * @returns {d3.svg.node} return the D3 svg object that represents the graph's "canvas"
   */
  get canvas() {
    return this.svg.node();
  }

  /**
   * Get a data node by index.
   *
   * @param {number} d the index of the node
   * @returns {object} return the object that represents the datum of a node
   */
  getNodeByIndex(d) {
    return this.data.nodes[d];
  }

  /**
   * Get a data node by uri.
   *
   * @param {number} uri the uri of the node
   * @returns {object|undefined} return the object that represents the datum of a node
   */
  getNodeByUri(uri) {
    return this.data.nodes.find(element => {
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
    let links = [];
    this.data.links.forEach(element => {
      if (
        element.source == uri ||
        element.target == uri) {
        links.push(element);
      }
    });
    return links;
  }

  /**
   * Get the id (or index) of a uri from the typeList. Each type in the type list is used
   * to color nodes in the graph. If the uri does not exist in the typeList, add the uri.
   *
   * @param {string} uri the uri to map to a color index.
   * @returns {number} the index of the color
   */
  getNodeColorId(uri) {
    const tURI = tokenizeURI(uri);
    let prefixedId = uri;
    for (const namespace in this.knownNamespaceLabels) {
      if (namespace == tURI.namespace) {
        prefixedId = `${this.knownNamespaceLabels[namespace]}:${tURI.localname}`;
      }
    }

    if (!this.typeList.includes(prefixedId)) {
      this.typeList.push(prefixedId);
    }
    return this.typeList.findIndex((d) => d == prefixedId);
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
    this.svg.selectAll('text').remove();
    this.typeList = [];
  }

  // / Interface Functions ///

  /**
   * Create a drag effect for graph nodes within the context of a force simulation
   *
   * @param {d3.forceSimulation} simulation The active D3 force simulation of the graph
   * @returns {d3.drag} a D3 drag function to enable dragging nodes within the graph
   */
  drag(simulation) {
    /**
     *
     * @param {d3.D3DragEvent} event the drag event containing information on which node is being clicked and dragged
     */
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    /**
     *
     * @param {d3.D3DragEvent} event the drag event containing information on which node is being clicked and dragged
     */
    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    /**
     *
     * @param {d3.D3DragEvent} event the drag event containing information on which node is being clicked and dragged
     */
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
   *
   * @param {d3.D3ZoomEvent} event the zoom event containing information on how the svg canvas is being translated and scaled
   */
  handleZoom(event) {
    d3.selectAll('svg g')
      .filter((d, i) => i < 2)
      .attr('height', '100%')
      .attr('width', '100%')
      // .attr('transform', event.transform)
      .attr(
        'transform',
        'translate(' +
          event.transform.x +
          ',' +
          event.transform.y +
          ') scale(' +
          event.transform.k +
          ')'
      );
    d3.selectAll('text.node_label')
      .style('font-size', this.fontSize / event.transform.k + 'px')
      .attr(
        'transform',
        'translate(' +
          event.transform.x +
          ',' +
          event.transform.y +
          ') scale(' +
          event.transform.k +
          ')'
      );
    d3.selectAll('text.link_label')
      .style('font-size', this.fontSize / event.transform.k + 'px')
      .attr(
        'transform',
        'translate(' +
          event.transform.x +
          ',' +
          event.transform.y +
          ') scale(' +
          event.transform.k +
          ')'
      );
  }

  // / EVENTS

  static get EVENT_NODE_CLICKED() {
    return 'EVENT_NODE_CLICKED';
  }

  static get EVENT_NODE_MOUSEOVER() {
    return 'EVENT_NODE_MOUSEOVER';
  }

  static get EVENT_NODE_MOUSEOUT() {
    return 'EVENT_NODE_MOUSEOUT';
  }
}
