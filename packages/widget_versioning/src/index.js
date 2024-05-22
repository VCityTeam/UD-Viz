import {
  D3GraphCanvas,
  SparqlEndpointResponseProvider,
  SparqlQueryWindow,
  Table,
} from '@ud-viz/widget_sparql';

/**
 * The SPARQL Versioning query window class which provides the user interface for querying
 * a Versioning compatible SPARQL endpoint and displaying the endpoint response.
 */
export class SparqlVersioningQueryWindow extends SparqlQueryWindow {
  /**
   * Creates a SPARQL query window.
   *
   * @param {SparqlEndpointResponseProvider} sparqlProvider The Versioning compatible SPARQL Endpoint Response Provider.
   * @param {object} configSparqlWidget The sparqlModule view configuration.
   * @param {object} configSparqlWidget.queries Query configurations
   * @param {object} configSparqlWidget.queries.title The query title
   * @param {object} configSparqlWidget.queries.filepath The path to the file which contains the query text
   * @param {object} configSparqlWidget.queries.formats Configuration for which visualizations are allowed
   *                                                    with this query. Should be an object of key, value
   *                                                    pairs. The keys of these pairs should correspond
   *                                                    with the cases in the updateDataView() function.
   */
  constructor(sparqlProvider, configSparqlWidget) {
    super(sparqlProvider, configSparqlWidget);

    /**
     * Contains the D3 graph views to display versioned RDF data.
     *
     * @type {Array<D3GraphCanvas>}
     */
    this.d3Graphs = [];

    this.resetButton.onclick = () => {
      this.d3Graph.clearCanvas();
      this.d3Graph.data.clear();

      this.d3Graphs.forEach((d3G) => {
        d3G.clearCanvas();
        d3G.data.clear();
      });
    };
  }

  /**
   * Given the uri of a node, return the node object.
   *
   * @param {number} graphId id of the graph
   * @param {number} id of the node
   * @returns {object|null} return
   */
  getNodesByIdGraphAndIdNode(graphId, id) {
    const d3Graph = this.d3Graphs.find((d3G) => d3G.id == graphId);
    if (d3Graph) {
      console.log(d3Graph.data);
      const memberNode = d3Graph.data.nodes[id];
      if (memberNode) {
        return memberNode.id;
      }
    } else {
      console.log(this.d3Graph.data);
      const memberNode = this.d3Graph.data.nodes[id];
      if (memberNode) {
        return memberNode.id;
      }
    }

    console.warn(`No nodes found for node with id: ${id}`);
    return null;
  }

  /**
   * Update the DataView.
   *
   * @param {object} response A JSON object returned by a SparqlEndpointResponseProvider.EVENT_ENDPOINT_RESPONSE_UPDATED event
   * @param {string} view_type The selected semantic data view type.
   */
  updateDataView(response, view_type) {
    console.debug(response);
    this.clearDataView();
    switch (view_type) {
      case 'versioning': {
        const distinctVersion = Array.from(
          new Set(response.results.bindings.map(({ version }) => version.value))
        );
        const distinctGraph = Array.from(
          new Set(response.results.bindings.map(({ graph }) => graph.value))
        );
        const groupByVersionedGraph = Object.groupBy(
          response.results.bindings,
          ({ versionedgraph }) => versionedgraph.value
        );
        const matrix = Array.from(Array(distinctGraph.length), () =>
          Array.from(Array(distinctVersion.length))
        );

        Object.entries(groupByVersionedGraph).forEach(([, elements]) => {
          const d3Graph = new D3GraphCanvas(this.configSparqlWidget);
          d3Graph.svg
            .attr('width', this.configSparqlWidget.width)
            .attr('height', this.configSparqlWidget.height);
          Object.entries(this.eventListeners).forEach(([event, listener]) => {
            d3Graph.addEventListener(event, listener);
          });
          d3Graph.update({
            head: response.head,
            results: { bindings: elements },
          });
          this.d3Graphs.push(d3Graph);
          if (elements.length > 0) {
            matrix[
              distinctGraph.findIndex((g) => g === elements[0].graph.value)
            ][
              distinctVersion.findIndex((v) => v === elements[0].version.value)
            ] = d3Graph.canvas;
          }
        });

        const table = this.buildVersioningTable();
        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
        const empty = document.createElement('th');
        empty.setAttribute(
          'style',
          'border:1px solid;word-wrap: break-word;max-width: 150px;'
        );
        tr.appendChild(empty);
        distinctVersion.forEach((version) => {
          const th = document.createElement('th');
          th.setAttribute('style', 'border:1px solid;');
          th.innerText = 'vers:' + version.split('#').pop();
          tr.appendChild(th);
        });
        thead.appendChild(tr);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        matrix.forEach((row, i) => {
          const tr = document.createElement('tr');
          const td = document.createElement('td');
          td.setAttribute(
            'style',
            'border:1px solid;word-wrap: break-word;max-width: 150px;'
          );
          td.innerText = distinctGraph[i];
          tr.appendChild(td);
          row.forEach((cell) => {
            if (cell) {
              const td = document.createElement('td');
              td.setAttribute('style', 'border:1px solid;');
              td.appendChild(cell);
              tr.appendChild(td);
            }
          });
          tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        this.dataView.append(table);
        break;
      }
      case 'graph':
        Object.entries(this.eventListeners).forEach(([event, listener]) => {
          this.d3Graph.addEventListener(event, listener);
        });
        this.d3Graph.update(response);
        this.dataView.append(this.d3Graph.canvas);
        break;
      case 'json':
        this.jsonRenderer.renderjson.set_icons('▶', '▼');
        this.jsonRenderer.renderjson.set_max_string_length(40);
        this.dataView.append(this.jsonRenderer.renderjson(response));
        break;
      case 'table':
        this.dataView.append(this.table.domElement);
        this.table.dataAsTable(response.results.bindings, response.head.vars);
        this.table.filterInput.addEventListener('change', (e) =>
          Table.update(this.table, e)
        );
        this.dataView.style['height'] = '500px';
        this.dataView.style['width'] = '800px';
        break;
      default:
        console.error('This result format is not supported: ' + view_type);
    }
  }

  /**
   * Create a table element to display versioned graphs
   *
   * @returns {HTMLTableElement} A table element
   */
  buildVersioningTable() {
    const table = document.createElement('table');
    table.setAttribute('style', 'border-collapse:collapse;border:1px solid;');
    const caption = document.createElement('caption');
    caption.innerText =
      'Prefix: vers = https://github.com/VCityTeam/ConVer-G/Version#';
    table.appendChild(caption);
    return table;
  }
}
