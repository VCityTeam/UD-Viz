import { SparqlEndpointResponseProvider } from '../service/SparqlEndpointResponseProvider';
import { D3GraphCanvas } from './D3GraphCanvas';
import { Table } from './Table';
import { JsonRenderer } from './JsonRenderer';

import { loadTextFile } from '@ud-viz/utils_browser';

import { SparqlQuery } from './SparqlQuery';

/**
 * The SPARQL query window class which provides the user interface for querying
 * a SPARQL endpoint and displaying the endpoint response.
 */
export class SparqlQueryWindow {
  /**
   * Creates a SPARQL query window.
   *
   * @param {SparqlEndpointResponseProvider} sparqlProvider The SPARQL Endpoint Response Provider
   * @param {object} configSparqlWidget The sparqlModule view configuration.
   * @param {object} configSparqlWidget.queries Query configurations
   * @param {object} configSparqlWidget.queries.title The query title
   * @param {object} configSparqlWidget.queries.filepath The path to the file which contains the query text
   * @param {object} configSparqlWidget.queries.formats Configuration for which visualizations are allowed
   *                                              with this query. Should be an object of key, value
   *                                              pairs. The keys of these pairs should correspond
   *                                              with the cases in the updateDataView() function.
   * @param  {Function} handleZoom Function to handle the zoom.
   */
  constructor(sparqlProvider, configSparqlWidget, handleZoom = undefined) {
    /** @type {HTMLElement} */
    this.domElement = null;

    /** @type {HTMLElement} */
    this.dataView = null;

    /** @type {HTMLElement} */
    this.form = null;

    /** @type {HTMLElement} */
    this.querySelect = null;

    /** @type {HTMLElement} */
    this.resultSelect = null;

    /** @type {HTMLElement} */
    this.resetButton = null;

    /** @type {HTMLElement} */
    this.queryTextArea = null;

    /** @type {HTMLElement} */
    this.toggleQueryTextAreaButton = null;

    /** @type {HTMLElement} */
    this.menu = null;

    /** @type {HTMLElement} */
    this.menuList = null;

    /**
     * The SPARQL Endpoint Response Provider
     *
     * @type {SparqlEndpointResponseProvider}
     */
    this.sparqlProvider = sparqlProvider;

    this.explorationQuery = undefined;
    this.jsonRenderer = new JsonRenderer();

    /**
     * Contains the D3 graph view to display RDF data.
     *
     * @type {D3GraphCanvas}
     */
    this.d3Graph = new D3GraphCanvas(configSparqlWidget, handleZoom, undefined);

    /**
     * The event listeners for the graphs.
     *
     * @type {object}
     */
    this.eventListeners = {};

    /**
     * The sparqlModule view configuration.
     *
     * @type {object}
     */
    this.configSparqlWidget = configSparqlWidget;

    /**
     * Contains the D3 table to display RDF data.
     *
     * @type {Table}
     */
    this.table = new Table(this);

    /**
     * Store the queries of the SparqlQueryWindow from the config.
     *
     * @type {object}
     */
    this.queries = configSparqlWidget['queries'];

    /**
     * The Sparql exploration query
     *
     * @type {string}
     */

    this.explorationQuery = undefined;

    this.initHtml();

    this.toggleQueryTextAreaButton.onclick = () => this.toggleQueryTextArea();

    /**
     * Sets the SparqlEndpointResponseProvider
     * and graph view. Also updates this.queries with the queries declared in the configuration file
     * Should be called by a `SparqlWidgetView`. Once this is done,
     * the window is actually usable ; service event listerers are set here.
     */

    // Get queries from text files and update the this.queries
    const promises = [];
    this.queries.forEach((query) => {
      if (query.filepath) {
        promises.push(
          loadTextFile(query.filepath).then((result) => {
            query.text = result;
          })
        );
      } else {
        query.text = '';
      }
    });

    Promise.all(promises).then(() => {
      // Once query text is updated, update the query select dropdown
      // and query text area
      this.updateQueryDropdown(this.queries);
      if (this.queries.length) {
        this.updateQueryTextArea(0);
        this.updateResultDropdown(0);
      }
    });

    if (this.queries.length > 1) {
      this.querySelect.onchange = () => {
        this.updateQueryTextArea(this.querySelect.value);
        this.updateResultDropdown(this.querySelect.value);
      };
    }

    this.form.onsubmit = () => {
      console.debug('submit');
      this.sparqlProvider
        .querySparqlEndpointService(this.queryTextArea.value)
        .then((response) =>
          this.updateDataView(response, this.resultSelect.value)
        );
      return false;
    };

    this.resetButton.onclick = () => {
      this.d3Graph.clearCanvas();
      this.d3Graph.data.clear();
    };
  }

  /**
   * Update query to add node's children
   *
   * @param {string} node_id a node ID
   */
  updateExplorationQuery(node_id) {
    this.explorationQuery.where_conditions.push([
      '?subject ?predicate ?object ;a ?subjectType .',
      'OPTIONAL { ?object a ?objectType }',
      'FILTER (?subject = data:' + node_id + ')',
    ]);
    this.queryTextArea.value = this.explorationQuery.generateQuery();
    this.d3Graph.clearCanvas();
    this.d3Graph.data.clear();
    this.sparqlProvider
      .querySparqlEndpointService(this.queryTextArea.value)
      .then((response) =>
        this.updateDataView(response, this.resultSelect.value)
      );
  }

  /**
   * Update the DataView
   *
   * @param {object} response a JSON object returned by a SparqlEndpointResponseProvider.EVENT_ENDPOINT_RESPONSE_UPDATED event
   * @param {string} view_type the selected semantic data view type
   */
  updateDataView(response, view_type) {
    this.clearDataView();
    switch (view_type) {
      case 'graph':
        this.d3Graph.init(response);
        Object.entries(this.eventListeners).forEach(([event, listener]) => {
          this.d3Graph.addEventListener(event, listener);
        });
        this.d3Graph.update(response);
        this.dataView.append(this.d3Graph.canvas);
        this.dataView.style['height'] = this.d3Graph.height + 'px';
        this.dataView.style['width'] = this.d3Graph.width + 'px';
        this.resetButton.style.display = 'block';
        break;
      case 'json':
        this.jsonRenderer.renderjson.set_icons('▶', '▼');
        this.jsonRenderer.renderjson.set_max_string_length(40);
        this.dataView.style['height'] = '100%';
        this.dataView.append(this.jsonRenderer.renderjson(response));
        break;
      case 'table':
        this.dataView.append(this.table.domElement);
        this.dataView.style['height'] = '100%';
        this.table.dataAsTable(response.results.bindings, response.head.vars);
        this.table.filterInput.addEventListener('change', (e) =>
          Table.update(this.table, e)
        );
        break;
      default:
        console.error('This result format is not supported: ' + view_type);
    }
  }

  /**
   * Add event listeners to the graphs
   *
   * @param {object} eventListeners An object containing event listeners to be added to the graph
   */
  addEventListeners(eventListeners) {
    this.eventListeners = eventListeners;
  }

  /**
   * Clear the DataView of content
   */
  clearDataView() {
    this.dataView.innerText = '';
  }

  toggleQueryTextArea() {
    if (!this.queryTextArea.style.display || this.queryTextArea.style.display == 'none') {
      this.queryTextArea.style.display = 'inherit';
      this.toggleQueryTextAreaButton.textContent = 'Hide the query ▼';
    } else {
      this.queryTextArea.style.display = 'none';
      this.toggleQueryTextAreaButton.textContent = 'Show the query ▶';
    }
  }

  /**
   * Update the this.queryTextArea with the text of the query that was selected in the dropdown, or the exploration query
   *
   * @param {number} index the index of the query in the this.queries array
   */
  updateQueryTextArea(index) {
    const query = this.queries[Number(index)];
    if (query.exploration != undefined) {
      this.explorationQuery = new SparqlQuery();
      this.explorationQuery.prefix = query.exploration.prefix;
      this.explorationQuery.select_variable = query.exploration.select_variable;
      this.explorationQuery.options = query.exploration.options;
      this.queryTextArea.value = this.explorationQuery.generateQuery();
    } else {
      this.explorationQuery = undefined;
      this.queryTextArea.value = query.text;
    }
  }

  /**
   * Update this.querySelect options using an array of queries. For each element in the array,
   * create an option element, set the innerText of the option to the query's title,
   * set the value of the option to the index of the query in the array, then append
   * the option to this.querySelect
   *
   * @param {Array<object>} queries - An array of objects that contain a query title and the query text itself
   */
  updateQueryDropdown(queries) {
    if (this.queries.length > 1) {
      for (let index = 0; index < queries.length; index++) {
        const option = document.createElement('option');
        option.innerText = queries[index].title;
        option.value = index;
        this.querySelect.appendChild(option);
      }
    }
  }

  /**
   * Remove all the children of this.resultSelect, then adds new children options based
   * on the formats declared in each query configuration from from this.queries
   *
   * @param {number} index - the index of the query in the queries array
   */
  updateResultDropdown(index) {
    // this is a weird work around to do this.resultSelect.children.forEach(...)
    while (this.resultSelect.children.length > 0) {
      this.resultSelect.removeChild(this.resultSelect.children.item(0));
    }

    const formats = Object.entries(this.queries[Number(index)].formats);
    formats.forEach(([k, v]) => {
      const option = document.createElement('option');
      option.value = k;
      option.innerText = v;
      this.resultSelect.appendChild(option);
    });
  }

  /**
   * Initialize the query text area of the view
   */
  initQueryTextAreaForm() {
    if (this.queries.length > 1) {
      const selectLabel = document.createElement('label');
      selectLabel.innerText = 'Select Query: ';
      this.interfaceElement.appendChild(selectLabel);
      this.querySelect = document.createElement('select');
      this.interfaceElement.appendChild(this.querySelect);
    }
    this.toggleQueryTextAreaButton = document.createElement('button');
    this.toggleQueryTextAreaButton.innerText = 'Show the query ▶';
    this.interfaceElement.appendChild(this.toggleQueryTextAreaButton);
    this.form = document.createElement('form');
    this.interfaceElement.appendChild(this.form);
    this.queryTextArea = document.createElement('textarea');
    this.form.appendChild(this.queryTextArea);
    const submitButton = document.createElement('input');
    submitButton.setAttribute('type', 'submit');
    submitButton.setAttribute('value', 'Send');
    this.form.appendChild(submitButton);
  }

  /**
   * Initialize the displaying of the result
   */
  initResultDisplay() {
    const formatLabel = document.createElement('label');
    formatLabel.innerText = 'Results Format: ';
    this.interfaceElement.appendChild(formatLabel);
    this.resultSelect = document.createElement('select');
    this.interfaceElement.appendChild(this.resultSelect);
    this.resetButton = document.createElement('button');
    this.resetButton.innerText = 'Clear Graph';
    this.resetButton.style['width'] = this.d3Graph.width + 'px';
    this.resetButton.style.display = 'none';
    this.dataView = document.createElement('div');
    this.dataView.className = 'box-selection';
    this.dataView.setAttribute('style', 'display:flex');
    this.interfaceElement.appendChild(this.dataView);
    this.interfaceElement.appendChild(this.resetButton);
  }

  /**
   * Initialize the html of the view
   */
  initHtml() {
    this.domElement = document.createElement('div');
    this.interfaceElement = document.createElement('div');
    this.interfaceElement.className = 'box-section';
    this.domElement.appendChild(this.interfaceElement);
    this.initQueryTextAreaForm();
    this.toggleQueryTextArea();
    this.initResultDisplay();
  }
}
