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
    // appel depuis la classe SparqlQueryWindow
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
    this.svg = d3 // le svg dans lequel est affiché le graph
      .create('svg')
      .attr('class', 'd3_graph')
      .attr('viewBox', [0, 0, this.width, this.height])
      .style('display', 'hidden');
    this.data = new Graph(); // objet Graph dans data
    this.colorSetOrScale = d3.scaleOrdinal(d3.schemeCategory10); // d3.schemeCategory10 renvoie un tableau de 10 couleurs & d3.scaleOrdinal sert à créer une échelle ordinale (valeur discrète -> valeur discrète)
  }

  // / Data Functions ///

  /**
   * Add all the descendant's ID of the node
   *
   * @param {string} node_id ID of the node
   * @param {Array} list list of descendant
   * @returns {Array} the list
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
   * Add the childs and the parent of each node
   *
   */
  addChildParent() {
    const links = this.data.links;
    const nodes = this.data.nodes;

    for (const link of links) {
      const source = nodes.find((element) => {
        return element.id == link.source;
      });
      const target = nodes.find((element) => {
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

    for (const node of nodes) {
      if (!('parent' in node)) {
        node.group = 0;
      }
    }

    let modif = true;
    let i = 0;

    while (modif) {
      modif = false;
      for (const node of nodes) {
        if (node.group == i) {
          if (node.child != undefined) {
            for (const childNodeId of node.child) {
              const childNode = nodes.find((element) => {
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
   * @param {string} node_id the ID of the node
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
   * Return true if any parent of the node is visible
   *
   * @param {string} node_id the ID of the node
   * @returns {boolean} the result
   */
  OneParentVisible(node_id) {
    const allNodes = this.data.nodes.concat(this.data._nodes);
    const node = allNodes.find((element) => {
      return element.id == node_id;
    });
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
    return false;
  }

  /**
   * Change the state of the node from simple node to cluster, or the opposite
   *
   * @param {string} node_id ID of the clicked node
   */
  changeVisibilityChildren(node_id) {
    const node = this.data.nodes.find((d) => d.id == node_id);
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
                this.data.nodes.find((d) => d.id == element.target) != undefined
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
  }

  /**
   * Create a new link and add it to the graph.
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
      console.log('Error remove node');
    }
  }

  /**
   * Create a new cluster and add it to the graph
   *
   * @param {string} cluster_id the ID of the created cluster
   * @param {Array} nodes_id an array of nodes ID (string)
   * @param {string} source_id the ID of the node to which the created cluster will be linked
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
    }
    this.changeVisibilityChildren(cluster_id);
    this.update();
  }

  /**
   * Hide the node
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
      /* const nodeLinks = [];
      this.data.links.forEach((element) => {
        if (element.source.id == node_id || element.target.id == node_id) {
          nodeLinks.push(element);
        }
      });
      for (const link of nodeLinks) {
        this.hideLink(link);
      } */
    } else {
      console.log('node undefined' + '' + node_id);
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
      /* const nodeLinks = [];
      this.data._links.forEach((element) => {
        if (element.source == node_id || element.target == node_id) {
          nodeLinks.push(element);
        }
      });
      for (const link of nodeLinks) {
        this.showLink(link);
      } */
    } else {
      console.log('node undefined' + '' + node_id);
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
      console.log('link undefined');
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
      console.log('link undefined');
    }
  }

  /**
   * Return the list of types of the children of the node
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
   * Return the list of children of the node from that type
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
   * Initialize the d3 SVG canvas based on the data from a graph dataset.
   *
   * @param {object} response an RDF JSON object ideally formatted by this.formatResponseData().
   */
  init(response) {
    this.data.formatResponseData(response);
    this.addChildParent();
    for (const node of this.data.nodes) {
      node.cluster = false;
      node.realNode = true;
    }

    const legend = this.prefixLegend(this.data.typeList); // génère les infos sur la légende si la requête génère une typeList (si color_id)
    const colorScale = this.colorSetOrScale;
    const setColor = function (d, default_color, override_color = undefined) {
      // renvoie override_color si pas undefined ou colorScale(d) sinon car colorScale est défini
      if (override_color && colorScale) return override_color;
      else if (colorScale) return colorScale(d); // colorScale prend une color_id en paramètre
      return default_color;
    };

    this.g = this.svg.append('g').attr('class', 'graph');
    this.link = this.g.append('g').selectAll('.link');
    this.nodeCircle = this.g.append('g').selectAll('.node');
    this.nodeCluster = this.g.append('g').selectAll('.node');

    this.simulation = d3
      .forceSimulation(this.data.nodes) // définit les noeuds de la simulation
      .force(
        'link',
        d3.forceLink(this.data.links).id((d) => d.id) // génère les liens entre les noeuds (le .id permet de dire à d3 comment identifier les noeuds)
      )
      .force('charge', d3.forceManyBody().strength(-40)) // ajoute une force de répulsion entre les noeuds
      .force('x', d3.forceX(this.width / 2).strength(0.1))
      .force('y', d3.forceY(this.height / 2).strength(0.1))
      .force('collide', d3.forceCollide(5))
      .force('center', d3.forceCenter(this.width / 2, this.height / 2)) // définit le centre de gravité du graph au centre du canva
      .alphaTarget(1)
      .on('tick', () => this.ticked(this));

    const zoom = d3.zoom().on('zoom', this.handleZoom); // ajoute le "event handler" qui permet de gérer le zoom

    this.svg.call(zoom); // associe le zoom au svg

    this.node_label = this.g.selectAll('.node_label');
    this.link_label = this.g.selectAll('.link_label');

    // Create legend
    this.svg
      .append('text') // ajoute le texte "Legend"
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

    this.update();
  }

  /**
   * Clear and update the d3 SVG canvas based on the data from a graph dataset. Also apply event dispatchers
   *
   *
   */
  update() {
    const colorScale = this.colorSetOrScale;
    const setColor = function (d, default_color, override_color = undefined) {
      // renvoie override_color si pas undefined ou colorScale(d) sinon car colorScale est défini
      if (override_color && colorScale) return override_color;
      else if (colorScale) return colorScale(d); // colorScale prend une color_id en paramètre
      return default_color;
    };

    this.nodeCircle = this.nodeCircle.data(
      this.data.nodes.filter((d) => !d.cluster),
      function (d) {
        return d.id;
      }
    );
    this.nodeCircle.exit().remove();
    this.nodeCircle = this.nodeCircle
      .enter()
      .append('circle')
      .attr('r', 4)
      .attr('stroke', (d) => setColor(d.color_id, '#ddd', '#111')) // ici d correspond à la data jointe à l'élément
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', 0.75)
      .attr('fill', (d) => setColor(d.color_id, 'black'))
      .call(
        d3
          .drag()
          .on('start', (e, d) => this.dragstarted(e, d, this))
          .on('drag', this.dragged)
          .on('end', (e, d) => this.dragended(e, d, this))
      )
      .on('click', (event, datum) => {
        // événement déclenché lors d'un clic sur un élément (datum correspond à la data encore = le node cliqué)
        this.dispatchEvent({
          // à quoi ça sert ?
          type: 'click',
          message: 'node click event',
          event: event,
          datum: datum,
        });
      })
      .on('mouseover', (event, datum) => {
        // événement déclenché lors que la souris est sur l'élément
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
            // ne retient que le label du node concerné
            return datum.index == j;
          })
          .style('fill', 'white')
          .style('opacity', '1'); // passe en blanc le label du node
        this.dispatchEvent({
          type: 'mouseover',
          message: 'node mouseover event',
          event: event,
          datum: datum,
        });
      })
      .on('mouseout', (event, datum) => {
        // événement déclenché lors que la souris quitte l'élément
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
    this.nodeCluster = this.nodeCluster
      .enter()
      .append('rect')
      .attr('fill', 'blue')
      .attr('width', 14)
      .attr('height', 14)
      .attr('stroke-opacity', 0.8)
      .attr('stroke-width', 0.75)
      .attr('stroke', (d) => setColor(d.color_id, '#ddd', '#111')) // ici d correspond à la data jointe à l'élément
      .attr('fill', (d) => setColor(d.color_id, 'black'))
      .call(
        d3
          .drag()
          .on('start', (e, d) => this.dragstarted(e, d, this))
          .on('drag', this.dragged)
          .on('end', (e, d) => this.dragended(e, d, this))
      )
      .on('click', (event, datum) => {
        // événement déclenché lors d'un clic sur un élément (datum correspond à la data encore = le node cliqué)
        this.dispatchEvent({
          // à quoi ça sert ?
          type: 'click',
          message: 'node click event',
          event: event,
          datum: datum,
        });
      })
      .on('mouseover', (event, datum) => {
        // événement déclenché lors que la souris est sur l'élément
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
            // ne retient que le label du node concerné
            return datum.index == j;
          })
          .style('fill', 'white')
          .style('opacity', '1'); // passe en blanc le label du node
        this.link_label
          .filter((e) => {
            return (
              datum.index == e.source.index || datum.index == e.target.index
            );
          })
          .style('fill', 'white')
          .style('opacity', '1'); // passe en blanc le label de tous les links du node
        this.dispatchEvent({
          type: 'mouseover',
          message: 'node mouseover event',
          event: event,
          datum: datum,
        });
      })
      .on('mouseout', (event, datum) => {
        // événement déclenché lors que la souris quitte l'élément
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

    // Apply the general update pattern to the links.
    this.link = this.link.data(this.data.links, function (d) {
      return d.source.id + '-' + d.target.id;
    });
    this.link.exit().remove();
    this.link = this.link
      .enter()
      .append('line')
      .attr('stroke-width', 0.75)
      .attr('stroke', '#999') // couleur du contour
      .attr('stroke-opacity', 0.8) // opacité du contour
      .on('mouseover', (event, datum) => {
        // événement déclenché lors que la souris est sur l'élément
        this.link_label
          .filter((e) => {
            return datum.index == e.index;
          })
          .style('visibility', 'visible');
        this.dispatchEvent({
          type: 'mouseover',
          message: 'node mouseover event',
          event: event,
          datum: datum,
        });
      })
      .on('mouseout', (event, datum) => {
        // événement déclenché lors que la souris est sur l'élément
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
    }); // lié à la data des nodes
    this.node_label.exit().remove();
    this.node_label = this.node_label
      .enter()
      .append('text') // rajoute une balise <text>
      .text(function (d) {
        return getUriLocalname(d.id);
      })
      .style('text-anchor', 'middle')
      .style('font-family', 'Arial')
      .style('font-size', this.fontSize)
      .style('text-shadow', '1px 1px black')
      .style('fill', 'white')
      .style('opacity', '0.3')
      .style('pointer-events', 'none') // node_label pas soumis aux événements du pointer
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

    // Update and restart the simulation.
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
   */
  handleZoom(event) {
    // redimensionne les éléments du svg suivant le zoom
    d3.selectAll('g.graph')
      // .filter((d, i) => i < 2) //pourquoi ?
      .attr('height', '100%')
      .attr('width', '100%')
      // .attr('transform', event.transform) //remplace bien le .attr suivant : pourquoi c'est commenté ?
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

  // Fonction pour le drag
  dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  // Fonction pour terminer le drag
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
