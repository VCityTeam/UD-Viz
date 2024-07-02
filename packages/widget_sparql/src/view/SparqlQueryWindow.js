import { SparqlEndpointResponseProvider } from '../service/SparqlEndpointResponseProvider';
import { D3GraphCanvas } from './D3GraphCanvas';
import { Table } from './Table';
import { JsonRenderer } from './JsonRenderer';

import { loadTextFile, getUriLocalname } from '@ud-viz/utils_browser';

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
   */
  constructor(sparqlProvider, configSparqlWidget) {
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

    this.initHtml();

    /**
     * The SPARQL Endpoint Response Provider
     *
     * @type {SparqlEndpointResponseProvider}
     */
    this.sparqlProvider = sparqlProvider;

    /**
     *A reference to the JsonRenderer class
     *
     * @type {JsonRenderer}
     */
    this.jsonRenderer = new JsonRenderer();

    /**
     * Contains the D3 graph view to display RDF data.
     *
     * @type {D3GraphCanvas}
     */
    this.d3Graph = new D3GraphCanvas(configSparqlWidget);

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
     * Sets the SparqlEndpointResponseProvider
     * and graph view. Also updates this.queries with the queries declared in the configuration file
     * Should be called by a `SparqlWidgetView`. Once this is done,
     * the window is actually usable ; service event listerers are set here.
     */

    // Get queries from text files and update the this.queries
    const promises = [];
    this.queries.forEach((query) => {
      promises.push(
        loadTextFile(query.filepath).then((result) => {
          query.text = result;
        })
      );
    });

    Promise.all(promises).then(() => {
      // Once query text is updated, update the query select dropdown
      // and query text area
      // console.log(this.queries);
      this.updateQueryDropdown(this.queries);
      if (this.queries.length) {
        this.updateQueryTextArea(0);
        this.updateResultDropdown(0);
      }
    });

    this.toggleQueryTextAreaButton.onclick = () => this.toggleQueryTextArea();
    this.querySelect.onchange = () => {
      this.updateQueryTextArea(this.querySelect.value);
      this.updateResultDropdown(this.querySelect.value);
    };

    this.form.onsubmit = () => {
      // fonction exécutée quand le form est submitted
      console.log('submit');
      console.debug(this.queryTextArea.value);
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
      this.explorationQuery.where_conditions = [
        [
          '?subject ?predicate ?object ;a ?subjectType .',
          'OPTIONAL { ?object a ?objectType }',
          'FILTER (?subject = data:69266BC115)',
        ],
      ]; // exemple de bâtiment
      this.updateQueryTextArea(this.querySelect.value);
    };

    this.explorationQuery = new SparqlQuery();
    this.explorationQuery.prefix.push([
      'bldg',
      'https://dataset-dl.liris.cnrs.fr/rdf-owl-urban-data-ontologies/Ontologies/CityGML/3.0/building#',
    ]);
    this.explorationQuery.prefix.push([
      'skos',
      'http://www.w3.org/2004/02/skos/core#',
    ]);
    this.explorationQuery.prefix.push([
      'data',
      'https://dataset-dl.liris.cnrs.fr/rdf-owl-urban-data-ontologies/Datasets/GratteCiel_Workspace_2009_2018/3.0/GratteCiel_2018_split#',
    ]);
    this.explorationQuery.select_variable.push(
      'subject',
      'subjectType',
      'predicate',
      'object',
      'objectType'
    );
    this.explorationQuery.options.push(
      ['FILTER', '?subjectType != owl:NamedIndividual'],
      ['FILTER', '!bound(?objectType) || ?objectType != owl:NamedIndividual'],
      ['FILTER', '?subject != owl:NamedIndividual'],
      ['FILTER', '?object != owl:NamedIndividual']
    );
    this.explorationQuery.where_conditions.push([
      '?subject ?predicate ?object ;a ?subjectType .',
      'OPTIONAL { ?object a ?objectType }',
      'FILTER (?subject = data:69266BC115)',
    ]); // exemple de bâtiment
  }

  /**
   * Update the query to add the children of the node
   *
   * @param {string} node_id the ID of the node
   */
  updateExplorationQuery(node_id) {
    this.explorationQuery.where_conditions.push([
      '?subject ?predicate ?object ;a ?subjectType .',
      'OPTIONAL { ?object a ?objectType }',
      'FILTER (?subject = data:' + getUriLocalname(node_id) + ')',
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
   * Update the DataView.
   *
   * @param {object} response A JSON object returned by a SparqlEndpointResponseProvider.EVENT_ENDPOINT_RESPONSE_UPDATED event
   * @param {string} view_type The selected semantic data view type.
   */
  updateDataView(response, view_type) {
    console.debug(response);
    this.clearDataView();
    switch (view_type) {
      case 'graph':
        this.d3Graph.init(response); // a remplacé update
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
   * Clear the DataView of content.
   */
  clearDataView() {
    this.dataView.innerText = '';
    this.dataView.style['height'] = '100%';
    this.dataView.style['overflow'] = 'auto';
  }

  toggleQueryTextArea() {
    if (this.queryTextArea.style.display == 'none') {
      this.queryTextArea.style.display = 'inherit';
      this.toggleQueryTextAreaButton.textContent = '▼';
    } else {
      this.queryTextArea.style.display = 'none';
      this.toggleQueryTextAreaButton.textContent = '▶';
    }
  }

  /**
   * Update the this.queryTextArea with the text of the query that was selected in the dropdown
   *
   * @param {number} index - The index of the query in the this.queries array
   */
  updateQueryTextArea(index) {
    this.queryTextArea.value = this.queries[Number(index)].text;
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
    for (let index = 0; index < queries.length; index++) {
      const option = document.createElement('option');
      option.innerText = queries[index].title;
      option.value = index;
      this.querySelect.appendChild(option);
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
   * Initialize the html of the view
   */
  initHtml() {
    this.domElement = document.createElement('div');
    const interfaceElement = document.createElement('div');
    interfaceElement.className = 'box-section';
    this.domElement.appendChild(interfaceElement);
    const selectLabel = document.createElement('label');
    selectLabel.innerText = 'Select Query: ';
    interfaceElement.appendChild(selectLabel);
    this.querySelect = document.createElement('select');
    interfaceElement.appendChild(this.querySelect);
    this.toggleQueryTextAreaButton = document.createElement('button');
    this.toggleQueryTextAreaButton.innerText = '▶';
    interfaceElement.appendChild(this.toggleQueryTextAreaButton);
    this.form = document.createElement('form');
    interfaceElement.appendChild(this.form);
    this.queryTextArea = document.createElement('textarea');
    this.queryTextArea.setAttribute('rows', '20');
    this.queryTextArea.setAttribute('style', 'display:none');
    this.form.appendChild(this.queryTextArea);
    const submitButton = document.createElement('input');
    submitButton.setAttribute('type', 'submit'); // quand le bouton est pressé alors la fonction associée à l'argument onsubmit de this.form est exécutée
    submitButton.setAttribute('value', 'Send');
    this.form.appendChild(submitButton);
    const formatLabel = document.createElement('label');
    formatLabel.innerText = 'Results Format: ';
    interfaceElement.appendChild(formatLabel);
    this.resultSelect = document.createElement('select');
    interfaceElement.appendChild(this.resultSelect);
    this.resetButton = document.createElement('button');
    this.resetButton.innerText = 'Clear Graph';
    interfaceElement.appendChild(this.resetButton);
    this.dataView = document.createElement('div');
    this.dataView.className = 'box-selection';
    interfaceElement.appendChild(this.dataView);
    this.menu = document.createElement('div');
    this.menu.setAttribute('id', 'context-menu');
    this.domElement.appendChild(this.menu);
    this.menuList = document.createElement('ul');
    this.menu.appendChild(this.menuList);
    this.optionCluster = document.createElement('li');
    this.menuList.appendChild(this.optionCluster);
    this.optionCluster.style.display = 'none';
    this.optionAddChildren = document.createElement('li');
    this.menuList.appendChild(this.optionAddChildren);
    this.optionAddChildren.style.display = 'none';
    this.optionAddChildren.innerText = 'Ajouter ses enfants';
    this.optionAnnuler = document.createElement('li');
    this.menuList.appendChild(this.optionAnnuler);
    this.optionAnnuler.innerText = 'Annuler';
    this.optionAnnuler.onclick = () => {
      this.menu.style.display = 'none';
      this.optionAddChildren.display = 'none';
      this.optionCluster.display = 'none';
    };
    this.optionsType = document.createElement('g');
  }
}
