import { Graph } from '../model/Graph';

import * as d3 from 'd3';
import { getUriLocalname, tokenizeURI } from '@ud-viz/utils_browser';
import * as THREE from 'three';

export class D3GraphCanvas extends THREE.EventDispatcher {
  /**
   * Create a new D3 graph from a JSON object.
   * Adapted from https://observablehq.com/@d3/force-directed-graph#chart and
   * https://www.d3indepth.com/zoom-and-pan/
   *
   * @param {object} config The sparqlModule configuration.
   * @param {number} config.height The SVG canvas height.
   * @param {number} config.width The SVG canvas width.
   * @param {number} config.fontSize The font size to use for node and link labels.
   * @param {object} config.namespaceLabels Prefix declarations which will replace text labels in the Legend. This doesn't (yet) affect the legend font size.
   * @param {Function} handleZoom The function that handles the zoom.
   * @param {Function} formatResponse The function that formats the response from JSON into a list of nodes and links.
   */
  constructor(config, handleZoom, formatResponse) {
    super();
    if (!config || !config.height || !config.width || !config.fontSize) {
      console.log(config);
      throw 'The given "configSparqlWidget" configuration is incorrect.';
    }
    this.height = config.height;
    this.width = config.width;
    this.fontSize = config.fontSize;
    this.fontFamily = config.fontFamily;
    this.strokeWidth = config.strokeWidth;
    this.nodeSize = config.nodeSize;
    this.defaultColor = config.defaultColor;
    this.linkColor = config.linkColor;
    this.nodeStrokeColor = config.nodeStrokeColor;
    this.fontSizeLegend = config.fontSizeLegend;

    this.knownNamespaceLabels = config.namespaceLabels;
    this.svg = d3 // the svg in which the graph is displayed
      .create('svg')
      .attr('class', 'd3_graph')
      .attr('id', 'svg')
      .attr('viewBox', [0, 0, this.width, this.height])
      .style('display', 'hidden');
    this.data = new Graph();

    this.tooltip = d3
      .create('div')
      .style('visibility', 'hidden')
      .attr('class', 'tooltip')
      .style('background-color', 'white')
      .style('border', 'solid')
      .style('border-width', '2px')
      .style('border-radius', '5px')
      .style('position', 'absolute')
      .style('padding', '5px');

    if (handleZoom == undefined) {
      this.handleZoom = (ev) => {
        d3.selectAll('g.graph')
          .attr('height', '100%')
          .attr('width', '100%')
          .attr(
            'transform',
            'translate(' +
              ev.transform.x +
              ',' +
              ev.transform.y +
              ') scale(' +
              ev.transform.k +
              ')'
          );
      };
    } else {
      this.handleZoom = handleZoom;
    }

    if (formatResponse == undefined) {
      this.formatResponse = (response, graph) => {
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
        const getNodeColorId = (type) => {
          const colorScale = d3
            .scaleOrdinal()
            .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
            .range(d3.schemeCategory10); // d3.schemeCategory10 returns an array of 10 colors and d3.scaleOrdinal is used to create an ordinal scale
          if (!this.data.typeList.includes(type)) {
            this.data.typeList.push(type);
            this.data.legend.push({
              type: type,
              color: colorScale(this.data.typeList.findIndex((d) => d == type)),
            });
          }
          return colorScale(this.data.typeList.findIndex((d) => d == type));
        };
        for (const triple of response.results.bindings) {
          if (
            // if the subject doesn't exist yet
            graph.nodes.find((n) => n.id == triple.subject.value) == undefined
          ) {
            const node = { id: triple.subject.value };
            if (
              // if there is a subjectType assign a type and color id
              triple.subjectType
            ) {
              node.type = getUriLocalname(triple.subjectType.value);
              node.color_id = getNodeColorId(node.type);
            }
            graph.nodes.push(node);
          }
          if (
            // if the object doesn't exist yet
            graph.nodes.find((n) => n.id == triple.object.value) == undefined
          ) {
            const node = { id: triple.object.value };
            if (
              // if there is an objectType assign a color id
              triple.objectType
            ) {
              node.type = getUriLocalname(triple.objectType.value);
              node.color_id = getNodeColorId(node.type);
            }
            graph.nodes.push(node);
          }
          const link = {
            source: triple.subject.value,
            target: triple.object.value,
            label: triple.predicate.value,
          };
          graph.links.push(link);
        }

        console.debug(graph);
      };
    } else {
      this.formatResponse = formatResponse;
    }
  }

  // / Data Functions ///

  /**
   * Generate the label of a clustered node
   *
   * @param {object} node a node
   * @param {D3GraphCanvas} graph this
   * @returns {string} the desired label of the node
   */
  generateClusterLabel(node, graph) {
    const map = new Map();
    if (graph.possessCycle(node.id, map))
      return (
        getUriLocalname(node.id) + ' [' + node.child.length.toString() + ']'
      );
    return (
      getUriLocalname(node.id) +
      ' [' +
      graph.generateDescendantList(node.id, []).length.toString() +
      ']'
    );
  }

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
   * Return true if the graph possesses a cycle, false otherwise
   *
   * @param {string} node_id a node ID
   * @param {Map} map an empty map at first
   * @returns {boolean} the result
   */
  possessCycle(node_id, map) {
    const allNodes = this.data.nodes.concat(this.data._nodes);
    if (map.size < allNodes.length) {
      for (const node of allNodes) {
        map.set(node.id, 'white');
      }
    }
    const node = allNodes.find((element) => {
      return element.id == node_id;
    });
    if (node != undefined) {
      map.set(node.id, 'grey');
      if (node.child != undefined) {
        for (const child_id of node.child) {
          if (map.get(child_id) == 'grey') {
            return true;
          } else if (map.get(child_id) == 'white') {
            if (this.possessCycle(child_id, map)) {
              return true;
            }
          }
        }
      }
      map.set(node.id, 'black');
      return false;
    }
    console.log('[haveCycle] node undefined');
    return undefined;
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

    let cyclic = false;

    for (const node of this.data.nodes) {
      const map = new Map();
      if (this.possessCycle(node.id, map)) {
        cyclic = true;
      }
    }

    if (!cyclic) {
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
    } else {
      for (const node of this.data.nodes) {
        node.group = 0;
      }
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
          const parent = this.data.nodes.find(
            (element) => element.id == parent_id
          );
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
  changeVisibilityDescendants(node_id) {
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
          let link;
          this.data._links.forEach((element) => {
            if (
              node.child.includes(element.source) &&
              element.source != node.id
            ) {
              link = this.createNewLink(
                node_id,
                element.target,
                node_id + '_children_cluster'
              );
              if (link) link.realLink = false;
            }
            if (
              node.child.includes(element.target) &&
              element.target != node.id
            ) {
              link = this.createNewLink(
                element.source,
                node_id,
                node_id + '_children_cluster'
              );
              if (link) link.realLink = false;
            }
          });
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
          this.data.links.forEach((element) => {
            if (element.label == node_id + '_children_cluster') {
              this.removeLink(element);
            }
          });
        }
      }
      this.setLinkIndexAndNum();
    } else {
      console.debug('[changeVisibilityDescendant] node undefined: ', node_id);
    }
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
        if (node.cluster) {
          for (const child_id of node.child) {
            this.hideNode(child_id);
          }
          for (const child_id of node.child) {
            const nodeLinks = [];
            this.data.links.forEach((element) => {
              if (
                element.source.id == child_id ||
                element.target.id == child_id
              ) {
                nodeLinks.push(element);
              }
            });
            for (const link of nodeLinks) {
              this.hideLink(link);
            }
          }
          let link;
          this.data._links.forEach((element) => {
            if (
              node.child.includes(element.source) &&
              element.source != node.id
            ) {
              link = this.createNewLink(
                node_id,
                element.target,
                node_id + '_children_cluster'
              );
              if (link) link.realLink = false;
            }
            if (
              node.child.includes(element.target) &&
              element.target != node.id
            ) {
              link = this.createNewLink(
                element.source,
                node_id,
                node_id + '_children_cluster'
              );
              if (link) link.realLink = false;
            }
          });
        } else {
          for (const child_id of node.child) {
            if (
              this.OneParentVisible(child_id) &&
              !this.OneParentCluster(child_id)
            ) {
              this.showNode(child_id);
            }
          }
          for (const child_id of node.child) {
            if (
              this.OneParentVisible(child_id) &&
              !this.OneParentCluster(child_id)
            ) {
              const nodeLinks = [];
              this.data._links.forEach((element) => {
                if (
                  (element.source == child_id || element.target == child_id) &&
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
          this.data.links.forEach((element) => {
            if (element.label == node_id + '_children_cluster') {
              this.removeLink(element);
            }
          });
        }
      }
      this.setLinkIndexAndNum();
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
    if (
      source != target &&
      this.data.nodes.find((element) => element.id == source) != undefined &&
      this.data.nodes.find((element) => element.id == target) != undefined
    ) {
      const link = {};
      link.source = source;
      link.target = target;
      link.label = label;
      this.data.links.push(link);
      this.setLinkIndexAndNum();
      return link;
    }
    return null;
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
   * Remove the link from the graph
   *
   * @param {object} link the link
   */
  removeLink(link) {
    this.data.links = this.data.links.filter((d) => d != link);
    this.data._links = this.data._links.filter((d) => d != link);
    this.setLinkIndexAndNum();
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
    const allNodes = this.data.nodes.concat(this.data._nodes);
    for (const node_id of nodes_id) {
      const node = allNodes.find((element) => {
        return element.id == node_id;
      });
      if (!('parent' in node)) {
        node.parent = [cluster_id];
      } else {
        node.parent.push(cluster_id);
      }
    }
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
   * Return a list of the node's children types
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
        const child = this.data.nodes.find((element) => {
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
   * Return a list of the different types of nodes
   *
   * @returns {Array} the list
   */
  getTypeList() {
    const allNodes = this.data.nodes.concat(this.data._nodes);
    const typeList = [];
    for (const node of allNodes) {
      if (
        node != undefined &&
        node.type != undefined &&
        typeList.find((element) => {
          return element == node.type;
        }) == undefined
      ) {
        typeList.push(node.type);
      }
    }
    return typeList;
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
   * Return a list of node IDs whose type is equal to typeName
   *
   * @param {string} typeName the name of the type
   * @returns {Array} the list
   */
  getNodeByType(typeName) {
    const allNodes = this.data.nodes.concat(this.data._nodes);
    const nodes = [];
    for (const node of allNodes) {
      if (node.type == typeName) {
        nodes.push(node.id);
      }
    }
    return nodes;
  }

  /**
   * Set the link index and the number of links between two nodes
   *
   */
  setLinkIndexAndNum() {
    this.linkNum = {};
    for (const link of this.data.links) {
      const source = link.source.id || link.source;
      const target = link.target.id || link.target;
      if (this.linkNum[source + ',' + target] == undefined) {
        this.linkNum[source + ',' + target] = 1;
      } else {
        this.linkNum[source + ',' + target] =
          this.linkNum[source + ',' + target] + 1;
      }
      link.linkindex = this.linkNum[source + ',' + target];
    }
  }

  /**
   * Initialize the d3 SVG canvas based on the data from a graph dataset
   *
   * @param {object} response an RDF JSON object ideally formatted by this.formatResponseData().
   */
  init(response) {
    this.formatResponse(response, this.data);
    this.setLinkIndexAndNum();

    this.addChildParent();
    for (const node of this.data.nodes) {
      node.cluster = false;
      node.realNode = true;
      node.display = true;
    }

    for (const link of this.data.links) {
      link.realLink = true;
    }

    this.g = this.svg.append('g').attr('class', 'graph');
    this.link = this.g.append('g').selectAll('.link');
    this.nodeCircle = this.g.append('g').selectAll('.node');
    this.nodeCluster = this.g.append('g').selectAll('.node');
    this.label = this.svg.append('g').attr('class', 'graph');

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
      if (this.handleZoom.length == 1) {
        this.handleZoom(event);
      } else {
        this.handleZoom(event, this);
      }
    });

    this.svg.call(zoom);

    this.node_label_cluster = this.label.selectAll('.node_label_cluster');
    this.node_label = this.label.selectAll('.node_label');
    this.link_label = this.label.selectAll('.link_label');

    // create legend
    this.svg
      .append('text')
      .attr('x', 12)
      .attr('y', 24)
      .style('font-size', this.fontSizeLegend)
      .style('text-decoration', 'underline')
      .text('Legend');

    // legend colors
    this.svg
      .append('g')
      .attr('stroke', '#111')
      .attr('stroke-width', 1)
      .selectAll('rect')
      .data(this.data.legend)
      .join('rect')
      .attr('x', 12)
      .attr('y', (d, i) => 32 + i * 16)
      .attr('width', 10)
      .attr('height', 10)
      .style('fill', (d) => d.color)
      .append('title')
      .text((d) => d);

    // legend text
    this.svg
      .append('g')
      .selectAll('text')
      .data(this.data.legend)
      .join('text')
      .attr('x', 26)
      .attr('y', (d, i) => 41 + i * 16)
      .text((d) => d.type)
      .style('font-size', this.fontSizeLegend);

    this.svg
      .append('defs')
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '-0 -5 10 10')
      .attr('orient', 'auto')
      .attr('markerWidth', 5)
      .attr('markerHeight', 5)
      .attr('refX', 5)
      .attr('xoverflow', 'visible')
      .append('svg:path')
      .attr('d', 'M 0 0 L 0,5 L 10,0 L 0,-5')
      .attr('fill', this.linkColor)
      .style('stroke', 'none');

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
    const hexToDec = function (hex) {
      const code = hex.charCodeAt(0);
      if (code >= 97) return code - 87;
      return parseInt(hex);
    };

    const htmlTooltip = function (data, propertiesOff = []) {
      let str = '';
      for (const property in data) {
        if (!propertiesOff.includes(property))
          if (property != 'source' && property != 'target')
            str = str + `<strong>${property}:</strong> ${data[property]}<br>`;
          else
            str =
              str + `<strong>${property}:</strong> ${data[property]['id']}<br>`;
      }
      return str;
    };

    const modifyColorTint = function (hex, k) {
      hex = hex.toLowerCase();
      let r = (hexToDec(hex[1]) * 16 + hexToDec(hex[2])) * k;
      if (r > 255) r = 255;
      let g = (hexToDec(hex[3]) * 16 + hexToDec(hex[4])) * k;
      if (g > 255) g = 255;
      let b = (hexToDec(hex[5]) * 16 + hexToDec(hex[6])) * k;
      if (b > 255) b = 255;
      const res =
        'rgb(' + r.toString() + ',' + g.toString() + ',' + b.toString() + ')';
      return res;
    };

    const nodeCircleSize = function (d, graph) {
      if (d.group != undefined) return graph.nodeSize - d.group;
      return graph.nodeSize;
    };

    const nodeCircleColor = function (d, graph) {
      if (d.color_id) return d.color_id;
      return graph.defaultColor;
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
      .attr('r', (d) => nodeCircleSize(d, this))
      .attr('stroke', this.nodeStrokeColor)
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', this.strokeWidth)
      .attr('fill', (d) => nodeCircleColor(d, this))
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
        this.tooltip
          .style('visibility', 'visible')
          .html(
            htmlTooltip(datum, [
              'color_id',
              'cluster',
              'parent',
              'child',
              'realNode',
              'display',
              'index',
              'group',
              'x',
              'y',
              'vx',
              'vy',
              'fx',
              'fy',
            ])
          );
        event.target.style['stroke'] = 'white';
        this.node_label
          .filter((e, j) => {
            return datum.index == j;
          })
          .style('fill', 'white')
          .style('opacity', '1');
        if (datum.child != undefined) {
          const allNodes = this.data.nodes.concat(this.data._nodes);
          for (const child_id of datum.child) {
            const child = allNodes.find((e) => e.id == child_id);
            if (child && child.color_id != undefined)
              this.nodeCircle
                .filter((e) => e.id == child_id)
                .style('fill', modifyColorTint(child.color_id, 1.2));
          }
        }
        this.dispatchEvent({
          type: 'mouseover',
          message: 'node mouseover event',
          event: event,
          datum: datum,
        });
      })
      .on('mouseout', (event, datum) => {
        this.tooltip.style('visibility', 'hidden');
        event.target.style['stroke'] = this.nodeStrokeColor;
        this.node_label
          .filter((e, j) => {
            return datum.index == j;
          })
          .style('fill', 'grey')
          .style('opacity', '0.5');
        if (datum.child != undefined) {
          const allNodes = this.data.nodes.concat(this.data._nodes);
          for (const child_id of datum.child) {
            const child = allNodes.find((e) => e.id == child_id);
            if (child && child.color_id != undefined)
              this.nodeCircle
                .filter((e) => e.id == child_id)
                .style('fill', child.color_id);
          }
        }
        this.dispatchEvent({
          type: 'mouseout',
          message: 'node mouseout event',
          event: event,
          datum: datum,
        });
      })
      .on('mousemove', (event, datum) => {
        this.tooltip
          .style('left', event.pageX + 30 + 'px')
          .style('top', event.pageY + 'px');
        this.dispatchEvent({
          type: 'mousemove',
          message: 'node mousemove event',
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
      .attr('width', this.nodeSize * 2)
      .attr('height', this.nodeSize * 2)
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', this.strokeWidth)
      .attr('stroke', this.nodeStrokeColor)
      .attr('fill', this.defaultColor)
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
        this.tooltip
          .style('visibility', 'visible')
          .html(
            htmlTooltip(datum, [
              'color_id',
              'cluster',
              'realNode',
              'display',
              'index',
              'group',
              'x',
              'y',
              'vx',
              'vy',
              'fx',
              'fy',
            ])
          );
        event.target.style['stroke'] = 'white';
        this.node_label_cluster
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
        this.tooltip.style('visibility', 'hidden');
        event.target.style['stroke'] = this.nodeStrokeColor;
        this.node_label_cluster
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
      .on('mousemove', (event, datum) => {
        this.tooltip
          .style('left', event.pageX + 30 + 'px')
          .style('top', event.pageY + 'px');
        this.dispatchEvent({
          type: 'mousemove',
          message: 'node mousemove event',
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
      .append('path')
      .attr('stroke-width', this.strokeWidth)
      .attr('stroke', this.linkColor)
      .attr('stroke-opacity', 0.8)
      .attr('marker-mid', 'url(#arrowhead)')
      .attr('stroke-dasharray', (d) => {
        let result;
        if (d.realLink) result = undefined;
        else result = '1';
        return result;
      })
      .attr('fill', 'none')
      .style('visibility', (d) => {
        let source;
        let target;
        const allNodes = this.data.nodes.concat(this.data._nodes);
        if (d.source.id == undefined) {
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
        this.tooltip
          .style('visibility', 'visible')
          .html(htmlTooltip(datum, ['index', 'realLink']));
        this.dispatchEvent({
          type: 'mouseover',
          message: 'node mouseover event',
          event: event,
          datum: datum,
        });
      })
      .on('mouseout', (event, datum) => {
        this.tooltip.style('visibility', 'hidden');
        this.dispatchEvent({
          type: 'mouseout',
          message: 'node mouseout event',
          event: event,
          datum: datum,
        });
      })
      .on('mousemove', (event, datum) => {
        this.tooltip
          .style('left', event.pageX + 30 + 'px')
          .style('top', event.pageY + 'px');
        this.dispatchEvent({
          type: 'mousemove',
          message: 'node mousemove event',
          event: event,
          datum: datum,
        });
      })
      .merge(this.link);

    this.node_label = this.node_label.data(
      this.data.nodes.filter((d) => !d.cluster),
      function (d) {
        return d.id;
      }
    );
    this.node_label.exit().remove();
    this.node_label = this.node_label
      .enter()
      .append('text')
      .text(function (d) {
        return getUriLocalname(d.id);
      })
      .style('text-anchor', 'middle')
      .style('font-family', this.fontFamily)
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

    this.node_label_cluster = this.node_label_cluster.data(
      this.data.nodes.filter((d) => d.cluster),
      function (d) {
        return d.id;
      }
    );
    this.node_label_cluster.exit().remove();
    this.node_label_cluster = this.node_label_cluster
      .enter()
      .append('text')
      .text((d) => this.generateClusterLabel(d, this))
      .style('text-anchor', 'middle')
      .style('font-family', this.fontFamily)
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
      .merge(this.node_label_cluster);

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
      .style('font-family', this.fontFamily)
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
   * Getter for retrieving the d3 tooltip div.
   *
   * @returns {d3.div.node} return the D3 tooltip div
   */
  get tooltipDiv() {
    return this.tooltip.node();
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

  ticked(graph) {
    graph.nodeCluster
      .attr('x', (d) => d.x - graph.nodeSize)
      .attr('y', (d) => d.y - graph.nodeSize);

    graph.nodeCircle
      .attr('cx', function (d) {
        return d.x;
      })
      .attr('cy', function (d) {
        return d.y;
      });

    graph.link.attr('d', function (d) {
      const getNormalVec = (A, B) => {
        const n = {
          x: 1,
          y: (A.x - B.x) / (B.y - A.y),
        };
        const norm = Math.sqrt(n.x * n.x + n.y * n.y);
        n.x = n.x / norm;
        n.y = n.y / norm;
        return n;
      };
      const n = getNormalVec(d.source, d.target);
      if (n.y * (d.target.y - d.source.y) < 0) {
        n.y = -1 * n.y;
        n.x = -1 * n.x;
      }
      const k = 5 * d.linkindex;
      const Q = {
        x: (d.source.x + d.target.x) / 2 + n.x * k,
        y: (d.source.y + d.target.y) / 2 + n.y * k,
        n: n,
      };
      const path = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path'
      );
      path.setAttribute(
        'd',
        'M ' +
          d.source.x +
          ' ' +
          d.source.y +
          ' ' +
          'Q ' +
          Q.x +
          ' ' +
          Q.y +
          ' ' +
          d.target.x +
          ' ' +
          d.target.y
      );
      const M = path.getPointAtLength(path.getTotalLength() / 2);
      const n1 = getNormalVec(d.source, M);
      const n2 = getNormalVec(d.target, M);
      if (n1.x * Q.n.x + n1.y * Q.n.y < 0) {
        n1.y = -1 * n1.y;
        n1.x = -1 * n1.x;
      }
      if (n2.x * Q.n.x + n2.y * Q.n.y < 0) {
        n2.y = -1 * n2.y;
        n2.x = -1 * n2.x;
      }
      const k12 = d.linkindex;
      const Q1 = {
        x: (d.source.x + M.x) / 2 + n1.x * k12,
        y: (d.source.y + M.y) / 2 + n1.y * k12,
      };
      const Q2 = {
        x: (d.target.x + M.x) / 2 + n2.x * k12,
        y: (d.target.y + M.y) / 2 + n2.y * k12,
      };
      return (
        'M ' +
        d.source.x +
        ' ' +
        d.source.y +
        ' Q ' +
        Q1.x +
        ' ' +
        Q1.y +
        ' ' +
        M.x +
        ' ' +
        M.y +
        ' Q ' +
        Q2.x +
        ' ' +
        Q2.y +
        ' ' +
        d.target.x +
        ' ' +
        d.target.y
      );
    });

    graph.node_label
      .attr('x', function (d) {
        return d.x;
      })
      .attr('y', function (d) {
        return d.y - graph.nodeSize - 3;
      });

    graph.node_label_cluster
      .attr('x', function (d) {
        return d.x;
      })
      .attr('y', function (d) {
        return d.y - graph.nodeSize - 3;
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
