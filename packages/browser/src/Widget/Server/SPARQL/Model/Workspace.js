import * as d3 from 'd3';
import { getUriLocalname, tokenizeURI } from './URI';
import { Graph } from './Graph';
import { SparqlQueryWindow } from '../View/SparqlQueryWindow';
import { LayerManager } from '../../../../Itowns/LayerManager/LayerManager';

export class Workspace extends Graph {
  /**
   * Create a new D3 workspace graph from an RDF JSON object.
   * @param {SparqlQueryWindow} window the window this graph is attached to.
   * @param {object} configSparqlWidget The sparqlModule configuration.
   * @param {number} configSparqlWidget.height The SVG canvas height.
   * @param {number} configSparqlWidget.width The SVG canvas width.
   * @param {number} configSparqlWidget.fontSize The font size to use for node and link labels.
   * @param {object} configSparqlWidget.namespaceLabels Prefix declarations which will replace text labels in the Legend.
   *                                                    This doesn't (yet) affect the legend font size.
   */
  constructor(window, configSparqlWidget) {
    super(window, configSparqlWidget);
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
      .on('click', (event, d) => {
        this.window.sendEvent(
          Workspace.EVENT_WORKSPACE_NODE_CLICKED,
          d.index
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
          Workspace.EVENT_WORKSPACE_NODE_MOUSEOVER,
          d.index
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
          Workspace.EVENT_WORKSPACE_NODE_MOUSEOUT,
          d.index
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
   * Given the index of a node (of type Version), return the node of the first Scenario links to it using Scenario.versionMember.
   *
   * @param {Number} d the index of the Version node
   * @returns {object|undefined} return the object that represents the datum of a Scenario
   */
  getVersionScenarioByIndex(d) {
    const uri = this.getNodeByIndex(d).id;
    return this.getVersionScenarioByUri(uri);
  }

  /**
   * Given the index of a node (of type VersionTransition), return the node of the first Scenario links to it using Scenario.versionTransitionMember.
   *
   * @param {Number} d the index of the Version node
   * @returns {object|undefined} return the object that represents the datum of a Scenario
   */
  getVersionTransitionScenarioByIndex(d) {
    const uri = this.getNodeByIndex(d).id;
    return this.getVersionTransitionScenarioByUri(uri);
  }

  /**
   * Given the uri of a node, return the node of the first Scenario links to it using Scenario.versionMember.
   * The uri should belong to a node of type Version. 
   *
   * @param {string} uri the URI of the Version node
   * @returns {object|undefined} return the object that represents the datum of a Scenario
   */
  getVersionScenarioByUri(uri) {
    const memberLink = this.data.links.find(element => {
      return (
        getUriLocalname(element.label) == 'Scenario.versionMember' &&
        element.target == uri
      );
    });
    if (memberLink) {
      return this.getNodeByUri(memberLink.source);
    }
    console.warn(`No Scenario found for version with uri: ${uri}`)
    return undefined;
  }

  /**
   * Given the uri of a node, return the node of the first Scenario links to it using Scenario.versionTransitionMember.
   * The uri should belong to a node of type VersionTransition. 
   *
   * @param {string} uri the URI of the Version node
   * @returns {object|undefined} return the object that represents the datum of a Scenario
   */
  getVersionTransitionScenarioByUri(uri) {
    const memberLink = this.data.links.find(element => {
      return (
        getUriLocalname(element.label) == 'Scenario.versionTransitionMember' &&
        element.target == uri
      );
    });
    if (memberLink) {
      return this.getNodeByUri(memberLink.source);
    }
    console.warn(`No Scenario found for versionTransition with uri: ${uri}`)
    return undefined;
  }

  /**
   * Given the index of a node (of type Version or VersionTransition) and a layerManager,
   * find the first Scenario that links to it and return the first layer that matches
   * the layer.name of the Scenario's localname.
   *
   * @param {number} d the index of the Version or VersionTransition node
   * @param {LayerManager} layerManager the layerManager
   * @returns {C3DTilesLayer|undefined} return the a matching geometryLayer
   */
  getScenarioLayerByIndex(d, layerManager) {
    const node = this.getNodeByIndex(d);
    let scenarioLayer = undefined;
    switch (getUriLocalname(node.type)) { // behavior changes based on the node type
      case 'Version':
        const versionScenarioName = getUriLocalname(this.getVersionScenarioByIndex(d).id);
        scenarioLayer = layerManager.getGeometryLayersWithoutPlanar().find( layer => {
          return layer.name == versionScenarioName;
        });
        break;
      case 'VersionTransition':
        const transitionScenarioName = getUriLocalname(this.getVersionTransitionScenarioByIndex(d).id);
        scenarioLayer = layerManager.getGeometryLayersWithoutPlanar().find( layer => {
          return layer.name == transitionScenarioName;
        });
        break;
      default:
        console.warn(`Cannot find scenario associated with node, ${getUriLocalname(node.id)}; Unknown node type: ${getUriLocalname(node.type)}`);
        return undefined;
    }
    return scenarioLayer;
  }

  /**
   * Given the uri of a node (of type Version or VersionTransition) and a layerManager,
   * find the first Scenario that links to it and return the first layer that matches
   * the layer.name of the Scenario's localname.
   *
   * @param {string} uri the uri of the Version or VersionTransition node
   * @param {LayerManager} layerManager the layerManager
   * @returns {C3DTilesLayer|undefined} return the a matching geometryLayer
   */
  getScenarioLayerByUri(uri, layerManager) {
    const node = this.getNodeByUri(uri);
    let scenarioLayer = undefined;
    switch (getUriLocalname(node.type)) { // behavior changes based on the node type
      case 'Version':
        const versionScenarioName = getUriLocalname(this.getVersionScenarioByUri(uri).id);
        scenarioLayer = layerManager.getGeometryLayersWithoutPlanar().find( layer => {
          return layer.name == versionScenarioName;
        });
        break;
      case 'VersionTransition':
        const transitionScenarioName = getUriLocalname(this.getVersionTransitionScenarioByUri(uri).id);
        scenarioLayer = layerManager.getGeometryLayersWithoutPlanar().find( layer => {
          return layer.name == transitionScenarioName;
        });
        break;
      default:
        console.warn(`Cannot find scenario associated with node, ${getUriLocalname(node.id)}; Unknown node type: ${getUriLocalname(node.type)}`);
        return undefined;
    }
    return scenarioLayer;
  }

  /**
   * Given the index of a node, find the bitemporal timestamps that 
   * that link to it (with the properties AbstractFeatureWithLifespan.validFrom and
   * AbstractFeatureWithLifespan.validTo) and return them as an object of Dates
   *
   * @param {number} d the index of the node
   * @returns {{validFrom:Date,validTo:Date}|undefined} return the object that represents the datum of a node
   */
  getBitemporalTimestampsByIndex(d) {
    const links = this.getLinksByIndex(d);
    const validFrom = links.find( link => {
      return getUriLocalname(link.label) == 'AbstractFeatureWithLifespan.validFrom';
    });
    const validTo = links.find( link => {
      return getUriLocalname(link.label) == 'AbstractFeatureWithLifespan.validTo';
    });

    if (!validFrom || !validTo ) {
      console.warn(`could not find bitemporal timestamps for ${this.getNodeByIndex(d).id}`)
      return;
    }
    const timestamp1 = new Date(String(validFrom.target)).getFullYear();
    const timestamp2 = new Date(String(validTo.target)).getFullYear();
    
    console.debug(`bitemporal timestamps found: ${validFrom.target} and ${validTo.target}`);
    return {
      validFrom: timestamp1,
      validTo: timestamp2
    };
  }

  /// EVENTS

  static get EVENT_WORKSPACE_NODE_CLICKED() {
    return 'EVENT_WORKSPACE_NODE_CLICKED';
  }

  static get EVENT_WORKSPACE_NODE_MOUSEOVER() {
    return 'EVENT_WORKSPACE_NODE_MOUSEOVER';
  }

  static get EVENT_WORKSPACE_NODE_MOUSEOUT() {
    return 'EVENT_WORKSPACE_NODE_MOUSEOUT';
  }
}
