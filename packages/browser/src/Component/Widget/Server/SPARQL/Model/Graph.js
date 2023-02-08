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
   * @param {number} height The SVG height.
   * @param {number} width The SVG width.
   */
  constructor(window, height = 500, width = 500) {
    this.window = window;
    this.height = height;
    this.width = width;
    this.typeList = [];
    this.svg = d3
      .create('svg')
      .attr('class', 'd3_graph')
      .attr('viewBox', [0, 0, this.width, this.height])
      .style('display', 'hidden');
    // TODO: add prefixes dynamically using user query definitions 
    this.knownPrefixes = new Map([
      // Common prefixes
      ['http://www.w3.org/1999/02/22-rdf-syntax-ns#', 'rdf'],
      ['http://www.w3.org/2000/01/rdf-schema#', 'rdfs'],
      ['http://www.w3.org/2002/07/owl#', 'owl'],
      ['http://www.w3.org/2001/XMLSchema#', 'xsd'],
      ['https://w3id.org/list#', 'list'],
      ['http://www.w3.org/2004/02/skos/core#', 'skos'],
      ['http://www.opengis.net/gml#', 'gml'],
      ['http://www.opengis.net/ont/gml#', 'gmlowl'],
      ['http://www.opengis.net/def/uom/OGC/1.0/', 'units'],
      ['http://www.opengis.net/ont/geosparql#', 'geo'],
      ['http://www.opengis.net/def/function/geosparql/', 'geof'],
      ['http://strdf.di.uoa.gr/ontology#', 'strdf'],
      ['http://www.w3.org/1999/xlink#', 'xlink'],
      
      // IFC2x3 Prefixes 
      ['https://w3id.org/express#', 'express'],
      ['http://standards.buildingsmart.org/IFC/DEV/IFC2x3/TC1/OWL#', 'ifc'],
      
      // CityGML 2.0 prefixes
      ['https://raw.githubusercontent.com/VCityTeam/UD-Graph/master/Ontologies/CityGML/2.0/core#', 'core'],
      ['https://raw.githubusercontent.com/VCityTeam/UD-Graph/master/Ontologies/CityGML/2.0/building#', 'bldg'],
      ['https://raw.githubusercontent.com/VCityTeam/UD-Graph/master/Ontologies/CityGML/2.0/bridge#', 'brid'],
      ['https://raw.githubusercontent.com/VCityTeam/UD-Graph/master/Ontologies/CityGML/2.0/landuse#', 'luse'],
      ['https://raw.githubusercontent.com/VCityTeam/UD-Graph/master/Ontologies/CityGML/2.0/appearance#', 'app'],
      ['https://raw.githubusercontent.com/VCityTeam/UD-Graph/master/Ontologies/CityGML/2.0/relief#', 'dem'],
      ['https://raw.githubusercontent.com/VCityTeam/UD-Graph/master/Ontologies/CityGML/2.0/cityfurniture#', 'frn'],
      ['https://raw.githubusercontent.com/VCityTeam/UD-Graph/master/Ontologies/CityGML/2.0/generics#', 'gen'],
      ['https://raw.githubusercontent.com/VCityTeam/UD-Graph/master/Ontologies/CityGML/2.0/cityobjectgroup#', 'grp'],
      ['https://raw.githubusercontent.com/VCityTeam/UD-Graph/master/Ontologies/CityGML/2.0/texturedsurface#', 'tex'],
      ['https://raw.githubusercontent.com/VCityTeam/UD-Graph/master/Ontologies/CityGML/2.0/tunnel#', 'tun'],
      ['https://raw.githubusercontent.com/VCityTeam/UD-Graph/master/Ontologies/CityGML/2.0/vegetation#', 'veg'],
      ['https://raw.githubusercontent.com/VCityTeam/UD-Graph/master/Ontologies/CityGML/2.0/waterbody#', 'wtr'],
      
      // Versioning prefixes
      ['https://raw.githubusercontent.com/VCityTeam/UD-Graph/master/Ontologies/CityGML/3.0/versioning#', 'vers'],
      ['https://raw.githubusercontent.com/VCityTeam/UD-Graph/master/Ontologies/Workspace/3.0/transactiontypes#', 'type'],
      
      // Dataset prefixes
      ['https://github.com/VCityTeam/UD-Graph/DOUA_BATI_2009-2018_Workspace#', 'vt'],
      ['https://raw.githubusercontent.com/VCityTeam/Datasets/ifc_doua#', 'inst'],
      ['https://github.com/VCityTeam/UD-Graph/DOUA_BATI_2009_stripped_split#', 'v2009'],
      ['https://github.com/VCityTeam/UD-Graph/DOUA_BATI_2012_stripped_split#', 'v2012'],
      ['https://github.com/VCityTeam/UD-Graph/DOUA_BATI_2015_stripped_split#', 'v2015'],
      ['https://github.com/VCityTeam/UD-Graph/DOUA_BATI_2018_stripped_split#', 'v2018'],
    ]);
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
    const legend = data.legend;
    const setColor = function (d, default_color, override_color = undefined) {
      if (override_color && data.colorSetOrScale) return override_color;
      else if (data.colorSetOrScale) return data.colorSetOrScale(d);
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
      .on('click', (event) => {
        this.window.sendEvent(Graph.EVENT_NODE_CLICKED, event.path[0].textContent);
      })
      .on('mouseover', (event, d) => {
        event.target.style['stroke'] = setColor(nodes[d.index].color_id, 'white', 'white');
        event.target.style['fill'] = setColor(nodes[d.index].color_id, '#333');
        node_label.filter((e, j) => {
          return d.index == j;
        })
          .style('fill', 'white')
          .style('opacity', '1');
        link_label.filter((e, j) => {
          return d.index == e.source.index || d.index == e.target.index;
        })
          .style('fill', 'white')
          .style('opacity', '1');
        this.window.sendEvent(Graph.EVENT_NODE_MOUSEOVER, event.path[0].textContent);
      })
      .on('mouseout', (event, d) => {
        event.target.style['stroke'] = setColor(nodes[d.index].color_id, '#ddd', '#111');
        event.target.style['fill'] = setColor(nodes[d.index].color_id, 'black');
        node_label.filter((e, j) => {
          return d.index == j;
        })
          .style('fill', 'grey')
          .style('opacity', '0.5');
        link_label.filter((e) => {
          return d.index == e.source.index || d.index == e.target.index;
        })
          .style('fill', 'grey')
          .style('opacity', '0.5');
          this.window.sendEvent(Graph.EVENT_NODE_MOUSEOUT, event.path[0].textContent);
      })
      .call(this.drag(simulation));
      
    node.append('title').text((d) => d.id);

    const node_label = this.svg.selectAll('.node_label')
      .data(nodes)
      .enter()
      .append('text')
      .text(function (d) { 
        const uri = tokenizeURI(d.id);
        return uri.id;
      })
      .style('text-anchor', 'middle')
      .style('font-family', 'Arial')
      .style('font-size', 10.5)
      .style('text-shadow', '1px 1px black')
      .style('fill', 'grey')
      .style('opacity', '0.5')
      // .style('fill', 'white')
      // .style('visibility', 'hidden')
      .attr('class','node_label')
      .call(this.drag(simulation));
      
    const link_label = this.svg.selectAll('.link_label')
      .data(links)
      .enter()
      .append('text')
      .text(function (d) {
        const label = tokenizeURI(d.label);
        return label.id;
      })
      .style('text-anchor', 'middle')
      .style('font-family', 'Arial')
      .style('font-size', 10)
      .style('text-shadow', '1px 1px black')
      .style('fill', 'grey')
      .style('opacity', '0.5')
      // .style('fill', 'white')
      // .style('visibility', 'hidden')
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


  /**
   * Getter for retrieving the d3 svg.
   */
  get canvas() {
    return this.svg.node();
  }

  /**
   * return a query response formatted for a D3.js graph.
   * @return {Object}
   */
  formatResponseDataAsGraph(data) {
    const graphData = {
      nodes: [
        // { id: 'x', color_id: 1 },
        // { id: 'y', color_id: 2 },
      ],
      links: [
        // { source: 'x', target: 'y', value: 1 }
      ],
      legend: {
        title: '',
        content: []
      },
      colorSetOrScale: d3.scaleOrdinal(d3.schemeCategory10)
    };
    
    if (data.head.vars.includes("subject") && data.head.vars.includes("predicate") && data.head.vars.includes("object")) {
      if (data.head.vars.includes("subjectType") && data.head.vars.includes("objectType")) {
        /* If the query is formatted using subject, subjectType, predicate, object,
           and objectType variables the node color based on the type of the subject
           or object's respective type */
        for (const triple of data.results.bindings) {
          if ( // if the subject doesn't exist yet 
            graphData.nodes.find((n) => n.id == triple.subject.value) == undefined
          ) {
            const subjectTypeId = this.getNodeColorId(
              triple.subjectType.value
            );
            const node = { id: triple.subject.value, color_id: subjectTypeId };
            graphData.nodes.push(node);
          }
          if (// if the object doesn't exist yet
            graphData.nodes.find((n) => n.id == triple.object.value) == undefined
          ) {
            let objectTypeId;
            if (// if there is an objectType
              triple.objectType
            ) {
              objectTypeId = this.getNodeColorId(triple.objectType.value);
            } else { // if not color it black
              objectTypeId = undefined;
            }
            const node = { id: triple.object.value, color_id: objectTypeId };
            graphData.nodes.push(node);
          }
          const link = {
            source: triple.subject.value,
            target: triple.object.value,
            label: triple.predicate.value,
          };
          graphData.links.push(link);
          graphData.legend.title = 'Legend';
          graphData.legend.content = this.typeList;
        }
      } else {
        /* If the query is formatted using just subject, predicate, and object,
           variables the node color is left black */
        for (const triple of data.results.bindings) {
          if ( // if the subject doesn't exist yet 
            graphData.nodes.find((n) => n.id == triple.subject.value) == undefined
          ) {
            const node = { id: triple.subject.value, color_id: undefined };
            graphData.nodes.push(node);
          }
          if (// if the object doesn't exist yet
            graphData.nodes.find((n) => n.id == triple.object.value) == undefined
          ) {
            const node = { id: triple.object.value, color_id: undefined };
            graphData.nodes.push(node);
          }
          const link = {
            source: triple.subject.value,
            target: triple.object.value,
            label: triple.predicate.value,
          };
          graphData.links.push(link);
          graphData.legend.title = '';
          graphData.colorSetOrScale = undefined;
        }
      }
    } else {
      console.warn('Unrecognized endpoint response format for graph construction');
    }

    console.debug(graphData);
    return graphData;
  }
  /**
   * Get the color ID of a uri. Add the uri to the type array
   * if it does not exist.
   * @param {String} uri the uri to map to a color id.
   * @return {Number}
   */
  getNodeColorId(uri) {
    const tURI = tokenizeURI(uri);
    let prefixedId = uri;
    for (const prefix of this.knownPrefixes.entries()) {
      if (prefix[0] == tURI.namespace) {
        prefixedId = `${prefix[1]}:${tURI.id}`;
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
      .attr('height','100%')
      .attr('width','100%')
      //.attr('transform', event.transform)
      .attr('transform',
        'translate(' + event.transform.x + ',' + event.transform.y + ') scale(' + event.transform.k + ')');
    d3.selectAll('text.node_label')
      .style('font-size', (10.5/event.transform.k) + 'px')
      .attr('transform',
        'translate(' + event.transform.x + ',' + event.transform.y + ') scale(' + event.transform.k + ')');
    d3.selectAll('text.link_label')
      .style('font-size', (10.5/event.transform.k) + 'px')
      .attr('transform',
        'translate(' + event.transform.x + ',' + event.transform.y + ') scale(' + event.transform.k + ')');
  }

  /// EVENTS

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