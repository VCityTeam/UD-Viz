import * as d3 from 'd3';
import { tokenizeURI } from './URI';
import { SparqlQueryWindow } from '../View/SparqlQueryWindow';
import { Graph } from './Graph';

export class Workspace extends Graph {
  
  /**
   * Create a new D3 workspace graph from an RDF JSON object.
   * @param {SparqlQueryWindow} window the window this graph is attached to.
   * @param {object} configSparqlWidget The sparqlModule configuration.
   * @param {number} configSparqlWidget.height The SVG height.
   * @param {number} configSparqlWidget.width The SVG width.
   * @param {number} configSparqlWidget.fontSize The font size to use for node and link labels.
   * @param {object} configSparqlWidget.namespaceLabels Prefix declarations which will replace text labels in the Legend.
   *                                       This doesn't (yet) affect the legend font size.
   */
  constructor(window, configSparqlWidget) {
    super(window, configSparqlWidget);
  }

  /**
   * Create a new workspace graph based on a graph dataset.
   * 
   * @param {Object} data an RDF JSON object.
   */
   update(data) {
    this.clear();

    const links = data.links.map((d) => Object.create(d));
    const nodes = data.nodes.map((d) => Object.create(d));
    const legend = data.legend;
    const setColor = function (d, default_color, override_color = undefined) {
      if (override_color && data.colorSetOrScale) return override_color;
      if (data.colorSetOrScale) return data.colorSetOrScale(d);
      return default_color;
    };

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
      .on('click', (d) => {
        this.window.sendEvent(WorkspaceGraph.EVENT_NODE_CLICKED, d.path[0].textContent);
      })
      .on('mouseover', (event, d) => {
        event.target.style['stroke'] = setColor(nodes[d.index].color_id, 'white', 'white');
        event.target.style['fill'] = setColor(nodes[d.index].color_id, '#333');
        node_label.filter((e, j) => {
          return d.index == j;
        })
          .style('fill', 'white');
        link_label.filter((e, j) => {
          return d.index == e.source.index || d.index == e.target.index;
        })
          .style('display', 'inline');
      })
      .on('mouseout', (event, d) => {
        event.target.style['stroke'] = setColor(nodes[d.index].color_id, '#ddd', '#111');
        event.target.style['fill'] = setColor(nodes[d.index].color_id, 'black');
        node_label.filter((e, j) => {
          return d.index == j;
        })
          .style('fill', 'grey');
        link_label.filter((e) => {
          return d.index == e.source.index || d.index == e.target.index;
        })
          .style('display', 'none');
      })
      .call(this.drag(simulation));
      
    node.append('title').text((d) => d.id);

    const node_label = this.svg.selectAll('.node_label')
      .data(nodes)
      .enter()
      .append('text')
      .text(function (d) { 
        let uri = tokenizeURI(d.id);
        return uri.id;
      })
      .style('text-anchor', 'middle')
      .style('fill', 'grey')
      .style('font-family', 'Arial')
      .style('font-size', 10.5)
      .style('text-shadow', '1px 1px black')
      .attr('class','node_label')
      .call(this.drag(simulation));
      
    const link_label = this.svg.selectAll('.link_label')
      .data(links)
      .enter()
      .append('text')
      .text(function (d) {
        let label = tokenizeURI(d.label);
        return label.id;
      })
      .style('display', 'none')
      .style('text-anchor', 'middle')
      .style('fill', 'white')
      .style('font-family', 'Arial')
      .style('font-size', 10)
      .style('text-shadow', '1px 1px black')
      .attr('class','link_label')
      .call(this.drag(simulation));

    simulation.on('tick', () => {
      node_label
        .attr('x', function(d){ return d.x; })
        .attr('y', function (d) {return d.y - 10; });
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);
      link_label
        .attr('x', function(d) {
          return ((d.source.x + d.target.x)/2);
        })
        .attr('y', function(d) {
          return ((d.source.y + d.target.y)/2);
        });
      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);
    });

    // Create legend
    this.svg
      .append('text')
      .attr('x', 10)             
      .attr('y', 16)
      .style('font-size', '14px')
      .style('text-decoration', 'underline')
      .text(legend.title)
      .style('fill','FloralWhite');

    this.svg
      .append('g')
      .attr('stroke', '#111')
      .attr('stroke-width', 1)
      .selectAll('rect')
      .data(legend.content)
      .join('rect')
      .attr('x', 10)
      .attr('y', (d, i) => 25 + i * 16)
      .attr('width', 10)
      .attr('height', 10)
      .style('fill', (d, i) => {
        return setColor(i, '#000');
      })
      .append('title')
      .text((d) => d);

    this.svg
      .append('g')
      .selectAll('text')
      .data(legend.content)
      .join('text')
      .attr('x', 24)
      .attr('y', (d, i) => 35 + i * 16)
      .text((d) => d)
      .style('fill','FloralWhite');
  }

  /// EVENTS

  static get EVENT_NODE_CLICKED() {
    return 'EVENT_NODE_CLICKED';
  }
}