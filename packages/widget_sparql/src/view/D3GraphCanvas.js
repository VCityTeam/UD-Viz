import { Graph } from '../model/Graph';

import * as d3 from 'd3';
import { getUriLocalname, tokenizeURI } from '@ud-viz/utils_browser';
import * as THREE from 'three';

export class D3GraphCanvas extends THREE.EventDispatcher {
  /**
   * Create a new D3 graph from an RDF JSON object.
   * Adapted from https://observablehq.com/@d3/force-directed-graph#chart and
   * https://www.d3indepth.com/zoom-and-pan/
   *
   * @param {object} configSparqlWidget The sparqlModule configuration.
   * @param {number} configSparqlWidget.height The SVG canvas height.
   * @param {number} configSparqlWidget.width The SVG canvas width.
   * @param {number} configSparqlWidget.fontSize The font size to use for node and link labels.
   * @param {object} configSparqlWidget.namespaceLabels Prefix declarations which will replace text labels in the Legend.
   *                                                    This doesn't (yet) affect the legend font size.
   */
  constructor(configSparqlWidget) {
    super();
    if (
      !configSparqlWidget ||
      !configSparqlWidget.height ||
      !configSparqlWidget.width ||
      !configSparqlWidget.fontSize
    ) {
      console.log(configSparqlWidget);
      throw 'The given "configSparqlWidget" configuration is incorrect.';
    }
    this.height = configSparqlWidget.height;
    this.width = configSparqlWidget.width;
    this.fontSize = configSparqlWidget.fontSize;
    this.knownNamespaceLabels = configSparqlWidget.namespaceLabels;
    this.svg = d3 // the svg in which the graph is displayed
      .create('svg')
      .attr('class', 'd3_graph')
      .attr('viewBox', [0, 0, this.width, this.height])
      .style('display', 'hidden');
    this.data = new Graph();
    this.colorSetOrScale = d3.scaleOrdinal(d3.schemeCategory10); // d3.schemeCategory10 returns an array of 10 colors and d3.scaleOrdinal is used to create an ordinal scale
    this.zoomClustering = true;
  }

  // / Data Functions ///

  /**
   * Retrieve the ID of all the node's descendants
   *
   * @param {string} node_id a node ID
   * @param {Array} list an empty list
   * @returns {Array} the list of all the node's descendants
   */
  generateDescendantList(node_id, list) {
    const allNodes = this.data.nodes.concat(this.data._nodes);
    const node = allNodes.find((element) => {
      return element.id == node_id;
    });
    if (node != undefined && node.child) {
      for (const child_id of node.child) {
        if (
          list.find((element) => {
            return element == child_id;
          }) == undefined
        ) {
          list.push(child_id);
          this.generateDescendantList(child_id, list);
        }
      }
    }
    return list;
  }

  /**
   * Create and initialize the 'child' and 'parent' properties for all nodes
   *
   */
  addChildParent() {
    for (const link of this.data.links) {
      const source = this.data.nodes.find((element) => {
        return element.id == link.source;
      });
      const target = this.data.nodes.find((element) => {
        return element.id == link.target;
      });

      if (target != undefined && source != undefined) {
        if (!('parent' in target)) {
          target.parent = [];
        }
        if (!('child' in source)) {
          source.child = [];
        }
        if (
          target.parent.find((element) => {
            return element == source.id;
          }) == undefined
        ) {
          target.parent.push(source.id);
        }
        if (
          source.child.find((element) => {
            return element == target.id;
          }) == undefined
        ) {
          source.child.push(target.id);
        }
      }
    }

    for (const node of this.data.nodes) {
      if (!('parent' in node)) {
        node.group = 0;
      }
    }

    let modif = true;
    let i = 0;

    while (modif) {
      modif = false;
      for (const node of this.data.nodes) {
        if (node.group == i) {
          if (node.child != undefined) {
            for (const childNodeId of node.child) {
              const childNode = this.data.nodes.find((element) => {
                return element.id == childNodeId;
              });
              childNode.group = i + 1;
              modif = true;
            }
          }
        }
      }
      i++;
    }
  }

  /**
   * Return true if any parent of the node is a cluster, false otherwise
   *
   * @param {string} node_id a node ID
   * @returns {boolean} the result
   */
  OneParentCluster(node_id) {
    const allNodes = this.data.nodes.concat(this.data._nodes);
    const node = allNodes.find((element) => {
      return element.id == node_id;
    });
    if (node.parent != undefined) {
      for (const parent_id of node.parent) {
        const parent = allNodes.find((element) => {
          return element.id == parent_id;
        });
        if (parent != undefined) {
          if (parent.cluster) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Return true if any parent of the node is visible, false otherwise
   *
   * @param {string} node_id a node ID
   * @returns {boolean} the result
   */
  OneParentVisible(node_id) {
    const allNodes = this.data.nodes.concat(this.data._nodes);
    const node = allNodes.find((element) => {
      return element.id == node_id;
    });
    if (node != undefined) {
      if (node.parent != undefined) {
        for (const parent_id of node.parent) {
          const parent = this.data.nodes.find((element) => {
            return element.id == parent_id;
          });
          if (parent != undefined) {
            return true;
          }
        }
      }
    } else {
      console.debug('[OneParentVisible] node undefined: ', node_id);
    }
    return false;
  }

  /**
   * Change the state of the node from simple node to cluster, or the opposite
   *
   * @param {string} node_id a node ID
   */
  changeVisibilityChildren(node_id) {
    const allNodes = this.data.nodes.concat(this.data._nodes);
    const node = allNodes.find((d) => d.id == node_id);
    if (node != undefined) {
      if (node.child != undefined) {
        node.cluster = node.cluster != true;
        const descendants = [];
        this.generateDescendantList(node_id, descendants);
        if (node.cluster) {
          for (const descendant_id of descendants) {
            this.hideNode(descendant_id);
          }
          for (const descendant_id of descendants) {
            const nodeLinks = [];
            this.data.links.forEach((element) => {
              if (
                element.source.id == descendant_id ||
                element.target.id == descendant_id
              ) {
                nodeLinks.push(element);
              }
            });
            for (const link of nodeLinks) {
              this.hideLink(link);
            }
          }
        } else {
          for (const descendant_id of descendants) {
            if (
              this.OneParentVisible(descendant_id) &&
              !this.OneParentCluster(descendant_id)
            ) {
              this.showNode(descendant_id);
            }
          }
          for (const descendant_id of descendants) {
            if (
              this.OneParentVisible(descendant_id) &&
              !this.OneParentCluster(descendant_id)
            ) {
              const nodeLinks = [];
              this.data._links.forEach((element) => {
                if (
                  (element.source == descendant_id ||
                    element.target == descendant_id) &&
                  this.data.nodes.find((d) => d.id == element.source) !=
                    undefined &&
                  this.data.nodes.find((d) => d.id == element.target) !=
                    undefined
                ) {
                  nodeLinks.push(element);
                }
              });
              for (const link of nodeLinks) {
                this.showLink(link);
              }
            }
          }
        }
      }
    } else {
      console.debug('[changeVisibilityChildren] node undefined: ', node_id);
    }
  }

  /**
   * Create a new link and add it to the graph
   *
   * @param {string} source source of the link
   * @param {string} target target of the link
   * @param {string} label label of the link
   * @returns {object} the created link
   */
  createNewLink(source, target, label) {
    const link = {};
    link.source = source;
    link.target = target;
    link.label = label;
    this.data.links.push(link);
    return link;
  }

  /**
   * Create a new node and add it to the graph
   *
   * @param {string} node_id a node ID
   * @returns {object} the created node
   */
  createNewNode(node_id) {
    const node = {};
    node.id = node_id;
    node.cluster = false;
    node.display = true;
    this.data.nodes.push(node);
    return node;
  }

  /**
   * Remove the node from the graph
   *
   * @param {string} node_id a node ID
   */
  removeNode(node_id) {
    const allNodes = this.data.nodes.concat(this.data._nodes);
    const node = this.data.nodes.find((element) => {
      return element.id == node_id;
    });
    if (node != undefined) {
      this.data.nodes = this.data.nodes.filter((d) => d.id != node.id);
      for (const child_id of node.child) {
        const child = allNodes.find((element) => {
          return element.id == child_id;
        });
        child.parent = child.parent.filter((d) => d != node.id);
      }
      this.data.links = this.data.links.filter(
        (d) => d.source.id != node_id && d.target.id != node_id
      );
      this.data._links = this.data._links.filter(
        (d) => d.source != node_id && d.target != node_id
      );
      this.update();
    } else {
      console.debug('[removeNode] node undefined: ', node_id);
    }
  }

  /**
   * Create a new cluster and add it to the graph
   *
   * @param {string} cluster_id the ID of the created cluster
   * @param {Array} nodes_id an array of node IDs
   * @param {string} source_id the ID of the node to which the created cluster will be linked
   * @returns {object} the created cluster
   */
  createNewCluster(cluster_id, nodes_id, source_id = undefined) {
    const cluster = this.createNewNode(cluster_id);
    cluster.cluster = false;
    cluster.child = nodes_id;
    cluster.realNode = false;
    if (source_id != undefined) {
      this.createNewLink(source_id, cluster_id, 'isCluster');
      const source = this.data.nodes.find((element) => {
        return element.id == source_id;
      });
      source.child.push(cluster_id);
      cluster.parent = [source_id];
    }
    this.changeVisibilityChildren(cluster_id);
    return cluster;
  }

  /**
   * Hide the node from the graph
   *
   * @param {string} node_id a node ID
   */
  hideNode(node_id) {
    const node = this.data.nodes.find((element) => {
      return element.id == node_id;
    });
    if (node != undefined) {
      const node_copy = { ...node };
      this.data.nodes = this.data.nodes.filter((element) => {
        return element.id != node_id;
      });
      const propertiesToDelete = ['index', 'vx', 'vy', 'x', 'y'];
      propertiesToDelete.forEach((prop) => delete node_copy[prop]);
      this.data._nodes.push(node_copy);
    } else {
      console.debug('[hideNode] node undefined: ', node_id);
    }
  }

  /**
   * Show the hidden node
   *
   * @param {string} node_id a node ID
   */
  showNode(node_id) {
    const node = this.data._nodes.find((element) => {
      return element.id == node_id;
    });
    if (node != undefined) {
      const node_copy = { ...node };
      this.data._nodes = this.data._nodes.filter((element) => {
        return element.id != node_id;
      });
      this.data.nodes.push(node_copy);
    } else {
      console.debug('[showNode] node undefined: ', node_id);
    }
  }

  /**
   * Hide the link from the graph
   *
   * @param {object} link a link
   */
  hideLink(link) {
    if (link != undefined) {
      const link_copy = { ...link };
      this.data.links = this.data.links.filter((element) => {
        return element != link;
      });
      delete link_copy['index'];
      link_copy.source = link_copy.source.id;
      link_copy.target = link_copy.target.id;
      this.data._links.push(link_copy);
    } else {
      console.debug('[hideLink] link undefined: ', link);
    }
  }

  /**
   * Show the hidden link of the graph
   *
   * @param {object} link a link
   */
  showLink(link) {
    if (link != undefined) {
      const link_copy = { ...link };
      this.data._links = this.data._links.filter((element) => {
        return element != link;
      });
      this.data.links.push(link_copy);
    } else {
      console.debug('[showLink] link undefined: ', link);
    }
  }

  /**
   * Return a list of the node's child types
   *
   * @param {string} node_id a node ID
   * @returns {Array} the list
   */
  getChildrenType(node_id) {
    const allNodes = this.data.nodes.concat(this.data._nodes);
    const node = allNodes.find((element) => {
      return element.id == node_id;
    });
    const childrenType = [];
    if (node != undefined) {
      for (const child_id of node.child) {
        const child = allNodes.find((element) => {
          return element.id == child_id;
        });
        if (
          child != undefined &&
          child.type != undefined &&
          childrenType.find((element) => {
            return element == child.type;
          }) == undefined
        ) {
          childrenType.push(child.type);
        }
      }
    }
    return childrenType;
  }

  /**
   * Returns the list of children of the node of this type
   *
   * @param {string} node_id a node ID
   * @param {string} type a type
   * @returns {Array} the list
   */
  getChildrenByType(node_id, type) {
    const allNodes = this.data.nodes.concat(this.data._nodes);
    const node = allNodes.find((element) => {
      return element.id == node_id;
    });
    const children = [];
    if (node != undefined) {
      for (const child_id of node.child) {
        const child = allNodes.find((element) => {
          return element.id == child_id;
        });
        if (child != undefined && child.type == type) {
          children.push(child_id);
        }
      }
    }
    return children;
  }

  /**
   * Return a list of node IDs whose group is equal to groupIndex
   *
   * @param {int} groupIndex the index of the group
   * @returns {Array} the list
   */
  getNodeByGroup(groupIndex) {
    const allNodes = this.data.nodes.concat(this.data._nodes);
    const nodes = [];
    for (const node of allNodes) {
      if (node.group == groupIndex) {
        nodes.push(node.id);
      }
    }
    return nodes;
  }

  /**
   * Initialize the d3 SVG canvas based on the data from a graph dataset
   *
   * @param {object} response an RDF JSON object ideally formatted by this.formatResponseData().
   */
  init(response) {
    this.data.formatResponseData(response);
    this.addChildParent();
    for (const node of this.data.nodes) {
      node.cluster = false;
      node.realNode = true;
      node.display = true;
    }

    const legend = this.prefixLegend(this.data.typeList);
    const colorScale = this.colorSetOrScale;
    const setColor = function (d, default_color, override_color = undefined) {
      if (override_color && colorScale) return override_color;
      else if (colorScale) return colorScale(d);
      return default_color;
    };

    this.g = this.svg.append('g').attr('class', 'graph');
    this.link = this.g.append('g').selectAll('.link');
    this.nodeCircle = this.g.append('g').selectAll('.node');
    this.nodeCluster = this.g.append('g').selectAll('.node');

    this.distanceLink = 30;
    this.chargeStrength = -40;
    this.forceCenter = 0.1;

    this.simulation = d3
      .forceSimulation(this.data.nodes) // defines simulation nodes
      .force(
        'link',
        d3
          .forceLink(this.data.links)
          .id((d) => d.id) // tells d3 how to identify nodes
          .distance(this.distanceLink)
      )
      .force('charge', d3.forceManyBody().strength(this.chargeStrength)) // adds a repulsive force between the nodes
      .force('x', d3.forceX(this.width / 2).strength(this.forceCenter))
      .force('y', d3.forceY(this.height / 2).strength(this.forceCenter))
      .force('collide', d3.forceCollide(5))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2)) // defines the graph's center of gravity at the center of the canva
      .alphaTarget(1)
      .on('tick', () => this.ticked(this));

    // adds an event handler for zoom management
    const zoom = d3.zoom().on('zoom', (event) => {
      this.handleZoom(event, this);
    });

    this.svg.call(zoom);

    this.node_label = this.g.selectAll('.node_label');
    this.link_label = this.g.selectAll('.link_label');

    // create legend
    this.svg
      .append('text')
      .attr('x', 12)
      .attr('y', 24)
      .style('font-size', '14px')
      .style('text-decoration', 'underline')
      .text('Legend')
      .style('fill', 'FloralWhite');

    // legend colors
    this.svg
      .append('g')
      .attr('stroke', '#111')
      .attr('stroke-width', 1)
      .selectAll('rect')
      .data(legend)
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
      .data(legend)
      .join('text')
      .attr('x', 26)
      .attr('y', (d, i) => 41 + i * 16)
      .text((d) => d)
      .style('fill', 'FloralWhite')
      .style('font-size', '14px');

    // create an initial group cluster
    if (this.zoomClustering) {
      const cluster = this.createNewCluster('zoom', this.getNodeByGroup(1));
      cluster.display = false;
      this.hiddenGroup = 1;
    }

    // initialize the zoom sensitivity
    this.zoomSensitivity = 1;

    this.update();
  }

  /**
   * Update the forces of the simulation
   *
   */
  updateForceSimulation() {
    this.simulation.force('link').distance(this.distanceLink);
    this.simulation.force('charge').strength(this.chargeStrength);
    this.simulation.force('x').strength(this.forceCenter);
    this.simulation.force('y').strength(this.forceCenter);
    this.simulation.alpha(1).restart();
  }

  /**
   * Clear and update the d3 SVG canvas based on the data from a graph dataset. Also apply event dispatchers
   *
   *
   */
  update() {
    const colorScale = this.colorSetOrScale;
    const setColor = function (d, default_color, override_color = undefined) {
      if (override_color && colorScale) return override_color;
      else if (colorScale) return colorScale(d);
      return default_color;
    };

    // attach the data to svg elements
    this.nodeCircle = this.nodeCircle.data(
      this.data.nodes.filter((d) => !d.cluster),
      function (d) {
        return d.id;
      }
    );

    // remove svg elements linked to deleted data
    this.nodeCircle.exit().remove();

    // create a new circle for each new node added to the data
    this.nodeCircle = this.nodeCircle
      .enter()
      .append('circle')
      .attr('r', (d) => {
        return 7 - d.group;
      })
      .attr('stroke', (d) => setColor(d.color_id, '#ddd', '#111')) // d corresponds to the data attached to the element
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', 0.75)
      .attr('fill', (d) => setColor(d.color_id, 'black'))
      .style('visibility', (d) => {
        const result = d.display ? 'visible' : 'hidden';
        return result;
      })
      .call(
        d3
          .drag()
          .on('start', (e, d) => this.dragstarted(e, d, this))
          .on('drag', this.dragged)
          .on('end', (e, d) => this.dragended(e, d, this))
      )
      .on('click', (event, datum) => {
        this.dispatchEvent({
          type: 'click',
          message: 'node click event',
          event: event,
          datum: datum,
        });
      })
      .on('mouseover', (event, datum) => {
        event.target.style['stroke'] = setColor(
          this.data.nodes[datum.index].color_id,
          'white',
          'white'
        );
        event.target.style['fill'] = setColor(
          this.data.nodes[datum.index].color_id,
          '#333'
        );
        this.node_label
          .filter((e, j) => {
            return datum.index == j;
          })
          .style('fill', 'white')
          .style('opacity', '1');
        this.dispatchEvent({
          type: 'mouseover',
          message: 'node mouseover event',
          event: event,
          datum: datum,
        });
      })
      .on('mouseout', (event, datum) => {
        event.target.style['stroke'] = setColor(
          this.data.nodes[datum.index].color_id,
          '#ddd',
          '#111'
        );
        this.node_label
          .filter((e, j) => {
            return datum.index == j;
          })
          .style('fill', 'grey')
          .style('opacity', '0.5');

        this.dispatchEvent({
          type: 'mouseout',
          message: 'node mouseout event',
          event: event,
          datum: datum,
        });
      })
      .merge(this.nodeCircle);

    this.nodeCluster = this.nodeCluster.data(
      this.data.nodes.filter((d) => d.cluster),
      function (d) {
        return d.id;
      }
    );

    this.nodeCluster.exit().remove();

    // create a new rectangle for each new cluster added to the data
    this.nodeCluster = this.nodeCluster
      .enter()
      .append('rect')
      .attr('fill', 'blue')
      .attr('width', 14)
      .attr('height', 14)
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', 0.75)
      .attr('stroke', (d) => setColor(d.color_id, '#ddd', '#111'))
      .attr('fill', (d) => setColor(d.color_id, 'black'))
      .style('visibility', (d) => {
        const result = d.display ? 'visible' : 'hidden';
        return result;
      })
      .call(
        d3
          .drag()
          .on('start', (e, d) => this.dragstarted(e, d, this))
          .on('drag', this.dragged)
          .on('end', (e, d) => this.dragended(e, d, this))
      )
      .on('click', (event, datum) => {
        this.dispatchEvent({
          type: 'click',
          message: 'node click event',
          event: event,
          datum: datum,
        });
      })
      .on('mouseover', (event, datum) => {
        event.target.style['stroke'] = setColor(
          this.data.nodes[datum.index].color_id,
          'white',
          'white'
        );
        event.target.style['fill'] = setColor(
          this.data.nodes[datum.index].color_id,
          '#333'
        );
        this.node_label
          .filter((e, j) => {
            return datum.index == j;
          })
          .style('fill', 'white')
          .style('opacity', '1');
        this.link_label
          .filter((e) => {
            return (
              datum.index == e.source.index || datum.index == e.target.index
            );
          })
          .style('fill', 'white')
          .style('opacity', '1');
        this.dispatchEvent({
          type: 'mouseover',
          message: 'node mouseover event',
          event: event,
          datum: datum,
        });
      })
      .on('mouseout', (event, datum) => {
        event.target.style['stroke'] = setColor(
          this.data.nodes[datum.index].color_id,
          '#ddd',
          '#111'
        );
        this.node_label
          .filter((e, j) => {
            return datum.index == j;
          })
          .style('fill', 'grey')
          .style('opacity', '0.5');
        this.dispatchEvent({
          type: 'mouseout',
          message: 'node mouseout event',
          event: event,
          datum: datum,
        });
      })
      .merge(this.nodeCluster);

    this.link = this.link.data(this.data.links, function (d) {
      return d.source.id + '-' + d.target.id;
    });

    this.link.exit().remove();

    // create a new line for each new link added to the data
    this.link = this.link
      .enter()
      .append('line')
      .attr('stroke-width', 0.75)
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.8)
      .style('visibility', (d) => {
        let source;
        let target;
        if (d.source.id == undefined) {
          const allNodes = this.data.nodes.concat(this.data._nodes);
          source = this.data.nodes.find((element) => {
            return element.id == d.source;
          });
          target = allNodes.find((element) => {
            return element.id == d.target;
          });
        } else {
          source = d.source;
          target = d.target;
        }
        const result = source.display && target.display ? 'visible' : 'hidden';
        return result;
      })
      .on('mouseover', (event, datum) => {
        this.link_label
          .filter((e) => {
            return datum.index == e.index;
          })
          .style('visibility', (d) => {
            const res = d.display ? 'visible' : 'hidden';
            return res;
          });
        this.dispatchEvent({
          type: 'mouseover',
          message: 'node mouseover event',
          event: event,
          datum: datum,
        });
      })
      .on('mouseout', (event, datum) => {
        this.link_label
          .filter((e) => {
            return datum.index == e.index;
          })
          .style('visibility', 'hidden');
        this.dispatchEvent({
          type: 'mouseout',
          message: 'node mouseout event',
          event: event,
          datum: datum,
        });
      })
      .merge(this.link);

    this.node_label = this.node_label.data(this.data.nodes, function (d) {
      return d.id;
    });
    this.node_label.exit().remove();
    this.node_label = this.node_label
      .enter()
      .append('text')
      .text(function (d) {
        return getUriLocalname(d.id);
      })
      .style('text-anchor', 'middle')
      .style('font-family', 'Arial')
      .style('font-size', this.fontSize)
      .style('text-shadow', '1px 1px black')
      .style('fill', 'white')
      .style('opacity', '0.3')
      .style('pointer-events', 'none')
      .style('visibility', (d) => {
        const res = d.display ? 'visible' : 'hidden';
        return res;
      })
      .attr('class', 'node_label')
      .merge(this.node_label);

    this.link_label = this.link_label.data(this.data.links, function (d) {
      return d.source.id + '-' + d.target.id;
    });
    this.link_label.exit().remove();
    this.link_label = this.link_label
      .enter()
      .append('text')
      .text(function (d) {
        return getUriLocalname(d.label);
      })
      .style('text-anchor', 'middle')
      .style('font-family', 'Arial')
      .style('font-size', this.fontSize)
      .style('text-shadow', '1px 1px black')
      .style('fill', 'white')
      .style('opacity', '1')
      .style('visibility', 'hidden')
      .style('pointer-events', 'none')
      .attr('class', 'link_label')
      .merge(this.link_label);

    // update and restart the simulation.
    this.simulation.nodes(this.data.nodes);
    this.simulation.force('link').links(this.data.links);
    this.simulation.alpha(1).restart();
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
  clearCanvas() {
    this.svg.selectAll('g').remove();
    this.svg.selectAll('text').remove();
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
      if (!event.active) simulation.alphaTarget(0.3).restart(); // assure que la simulation redémarre et "s'anime" si aucune autre interaction n'est en cours (pour la fluidité)
      event.subject.fx = event.subject.x; // associe à fx (= la position fixe x du node, sans intéraction de force) sa position x avant le début du drag
      event.subject.fy = event.subject.y;
    }

    /**
     *
     * @param {d3.D3DragEvent} event the drag event containing information on which node is being clicked and dragged
     */
    function dragged(event) {
      event.subject.fx = event.x; // met à jour la position fixe du node avec la valeur de sa position actuelle
      event.subject.fy = event.y;
    }

    /**
     *
     * @param {d3.D3DragEvent} event the drag event containing information on which node is being clicked and dragged
     */
    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null; // réinitialise la valeur de position fixe du node
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
   * @param {D3GraphCanvas} graph this
   */
  handleZoom(event, graph) {
    d3.selectAll('g.graph')
      .attr('height', '100%')
      .attr('width', '100%')
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
    // zoom clustering by group
    if (graph.zoomClustering) {
      if (
        Math.floor(event.transform.k / this.zoomSensitivity) !=
          graph.hiddenGroup &&
        Math.floor(event.transform.k) >= this.zoomSensitivity
      ) {
        graph.changeVisibilityChildren('zoom');
        graph.removeNode('zoom');
        const node = graph.createNewCluster(
          'zoom',
          graph.getNodeByGroup(
            Math.floor(event.transform.k / this.zoomSensitivity)
          )
        );
        node.display = false;
        graph.hiddenGroup = Math.floor(
          event.transform.k / this.zoomSensitivity
        );
        graph.update();
      }
    }
  }

  ticked(graph) {
    graph.nodeCluster.attr('x', (d) => d.x - 7).attr('y', (d) => d.y - 7);

    graph.nodeCircle
      .attr('cx', function (d) {
        return d.x;
      })
      .attr('cy', function (d) {
        return d.y;
      });

    graph.link
      .attr('x1', function (d) {
        return d.source.x;
      })
      .attr('y1', function (d) {
        return d.source.y;
      })
      .attr('x2', function (d) {
        return d.target.x;
      })
      .attr('y2', function (d) {
        return d.target.y;
      });

    graph.node_label
      .attr('x', function (d) {
        return d.x;
      })
      .attr('y', function (d) {
        return d.y - 10;
      });

    graph.link_label
      .attr('x', function (d) {
        return (d.source.x + d.target.x) / 2;
      })
      .attr('y', function (d) {
        return (d.source.y + d.target.y) / 2;
      });
  }

  dragstarted(event, d, graph) {
    if (!event.active) graph.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  dragended(event, d, graph) {
    if (!event.active) graph.simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  /**
   * Check if a list of URIs have namespaces in the known namespace list. If so, replace
   * the namespace of the URI with a prefix. The known namespace list is declared in a
   * configuration file.
   *
   * @param {Array<string>} legendContent the list of uris representing the content of the legend0
   * @returns {Array<string>} returns the legend content with prefixes
   */
  prefixLegend(legendContent) {
    const prefixedLegendContent = [];
    for (const uri in legendContent) {
      const tURI = tokenizeURI(legendContent[uri]);
      if (Object.keys(this.knownNamespaceLabels).includes(tURI.namespace)) {
        prefixedLegendContent.push(
          `${this.knownNamespaceLabels[tURI.namespace]}:${tURI.localname}`
        );
      } else {
        prefixedLegendContent.push(legendContent[uri]);
      }
    }
    return prefixedLegendContent;
  }
}
