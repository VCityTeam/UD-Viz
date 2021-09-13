import * as d3 from 'd3';

export class Graph {
  /**
   * Create a new D3 graph from an RDF JSON object.
   * Adapted from https://observablehq.com/@d3/force-directed-graph#chart and 
   * https://www.d3indepth.com/zoom-and-pan/
   */
  constructor(height = 500, width = 500) {
    this.height = height;
    this.width = width;

    this.svg = undefined;
  }

  /**
   * Create a new graph based on an graph dataset.
   *
   * @param {Object} data an RDF JSON object.
   */
  createGraph(data) {
    const links = data.links.map((d) => Object.create(d));
    const nodes = data.nodes.map((d) => Object.create(d));
    const uriBases = data.legend;

    this.svg = d3
      .create('svg')
      .attr('class', 'd3_graph')
      .attr('viewBox', [0, 0, this.width, this.height]);

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3.forceLink(links).id((d) => d.id)
      )
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(this.width / 2, this.height / 2)
                           .strength(1.5));

    const zoom = d3.zoom()
      .on('zoom', this.handleZoom);

    this.svg.call(zoom);

    const link = this.svg
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', (d) => Math.sqrt(d.value));

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    const node = this.svg
      .append('g')
      .attr('stroke', '#333')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 5)
      .attr('fill', (d) => colorScale(d.group))
      .on('click', (d) => console.log(d))
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
    this.svg.append('g')
      .attr('stroke', '#333')
      .attr('stroke-width', 1)
      .selectAll('rect')
      .data(uriBases)
      .join('rect')
      .attr("x", 10)
      .attr("y", (d, i) => 10 + (i * 12))
      .attr("width", 8)
      .attr("height", 8)
      .style("fill", (d, i) => colorScale(i))
      .append('title')
        .text((d) => d)
      
    this.svg.append('g')
      .style('font-size', '0.8em')
      .selectAll('text')
      .data(uriBases)
      .join('text')
      .attr("x", 22)
      .attr("y", (d, i) => 18 + (i * 12))
      .text((d) => d);
  }

  /**
   * Remove nodes and lines from the SVG.
   */
  clearGraph() {
    this.svg.selectAll('g').remove();
  }

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

  /**
   * Getter for retrieving the d3 svg.
   */
  get data() {
    console.log(this.svg.node());
    return this.svg.node();
  }
}
