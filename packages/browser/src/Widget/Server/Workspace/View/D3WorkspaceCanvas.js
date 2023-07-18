import { SparqlQueryWindow } from '../../SPARQL/View/SparqlQueryWindow';
import { D3GraphCanvas } from '../../SPARQL/View/D3GraphCanvas';
import { Workspace } from '../Model/Workspace';

export class D3WorkspaceCanvas extends D3GraphCanvas {
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
    super(window, configSparqlWidget);
    this.data = new Workspace();
  }
}
