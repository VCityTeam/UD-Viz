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

    /** @type {HTMLElement} */
    this.buildingIdInput = null;

    /** @type {HTMLElement} */
    this.showBuildingButton = null;

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

    this.initHtml();

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
      this.updateQueryDropdown(this.queries);
      if (this.queries.length) {
        this.updateQueryTextArea(0);
        this.updateResultDropdown(0);
      }
    });

    this.toggleQueryTextAreaButton.onclick = () => this.toggleQueryTextArea();

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

    // create and initialize a query that will be updated by clicking on graph nodes and on 3D model buildings
    this.explorationQuery = new SparqlQuery();
    this.explorationQuery.prefix.push([
      'bldg',
      'https://dataset-dl.liris.cnrs.fr/rdf-owl-urban-data-ontologies/Ontologies/CityGML/2.0/building#',
    ]);
    this.explorationQuery.prefix.push([
      'skos',
      'http://www.w3.org/2004/02/skos/core#',
    ]);
    this.explorationQuery.prefix.push([
      'data',
      'https://dataset-dl.liris.cnrs.fr/rdf-owl-urban-data-ontologies/Datasets/Villeurbanne/2018/GratteCiel_2018_split#',
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
    console.debug(response);
    this.clearDataView();
    switch (view_type) {
      case 'graph':
        this.d3Graph.init(response);
        this.dataView.append(this.d3Graph.canvas);
        this.dataView.style['height'] = this.d3Graph.height + 'px';
        this.dataView.style['width'] = this.d3Graph.width + 'px';
        this.menuUser.style.display = 'block';
        this.resetButton.style.display = 'block';
        break;
      case 'json':
        this.jsonRenderer.renderjson.set_icons('▶', '▼');
        this.jsonRenderer.renderjson.set_max_string_length(40);
        this.dataView.style['height'] = '100%';
        this.dataView.append(this.jsonRenderer.renderjson(response));
        this.menuUser.style.display = 'none';
        break;
      case 'table':
        this.dataView.append(this.table.domElement);
        this.dataView.style['height'] = '100%';
        this.table.dataAsTable(response.results.bindings, response.head.vars);
        this.table.filterInput.addEventListener('change', (e) =>
          Table.update(this.table, e)
        );
        this.menuUser.style.display = 'none';
        break;
      default:
        console.error('This result format is not supported: ' + view_type);
    }
  }

  /**
   * Clear the DataView of content
   */
  clearDataView() {
    this.dataView.innerText = '';
  }

  toggleQueryTextArea() {
    if (this.queryTextArea.style.display == 'none') {
      this.queryTextArea.style.display = 'inherit';
      this.toggleQueryTextAreaButton.textContent = 'Hide the query ▼';
    } else {
      this.queryTextArea.style.display = 'none';
      this.toggleQueryTextAreaButton.textContent = 'Show the query ▶';
    }
  }

  /**
   * Update the this.queryTextArea with the text of the query that was selected in the dropdown
   *
   * @param {number} index the index of the query in the this.queries array
   */
  updateQueryTextArea(index) {
    if (Number(index) == 0) {
      // only with the exploration query
      this.queryTextArea.value = this.explorationQuery.generateQuery();
    } else {
      this.queryTextArea.value = this.queries[Number(index)].text;
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
   * Initialize the html context menu of the view
   */
  initContextMenu() {
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
    this.optionAddChildren.innerText = 'Add its children';
    this.optionsType = document.createElement('g');
    this.optionCamera = document.createElement('li');
    this.menuList.appendChild(this.optionCamera);
    this.optionCamera.style.display = 'none';
    this.optionCamera.innerText = 'Focus the camera on the building';
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
    this.interfaceElement.appendChild(this.dataView);
    this.interfaceElement.appendChild(this.resetButton);
  }

  /**
   * Initialize the user menu of graph configuration
   */
  initMenuUserGraphConfiguration() {
    this.menuUser = document.createElement('div');
    this.menuUser.className = 'menuUser';
    this.interfaceElement.insertBefore(this.menuUser, this.dataView);

    this.zoom = document.createElement('input');
    this.zoom.setAttribute('type', 'range');
    this.zoom.setAttribute('min', '0.5');
    this.zoom.setAttribute('max', '1.5');
    this.zoom.setAttribute('step', '0.25');
    this.zoom.setAttribute('value', '1');

    this.zoom.oninput = () => {
      this.d3Graph.zoomSensitivity = this.zoom.value;
    };

    const zoomLabel = document.createElement('label');
    zoomLabel.innerText = '\nZoom sensitivity: ';

    const zoomScale = document.createElement('div');
    zoomScale.className = 'scale';

    for (let i = 0.5; i <= 1.5; i += 0.25) {
      const zoomScaleLabel = document.createElement('span');
      zoomScaleLabel.className = 'scale_label';
      zoomScaleLabel.innerText = i;
      zoomScale.appendChild(zoomScaleLabel);
    }

    const menuLabel = document.createElement('label');
    menuLabel.innerText = 'Graph configuration\n';
    menuLabel.className = 'menu-label';

    this.buildingIdInput = document.createElement('input');

    const buildingIdLabel = document.createElement('label');
    buildingIdLabel.innerText = '\nBuilding ID: ';

    this.showBuildingButton = document.createElement('input');
    this.showBuildingButton.setAttribute('type', 'submit');
    this.showBuildingButton.setAttribute('value', 'Show');

    const chargeStrengthConfiguration = document.createElement('input');
    chargeStrengthConfiguration.setAttribute('type', 'range');
    chargeStrengthConfiguration.setAttribute('min', '-80');
    chargeStrengthConfiguration.setAttribute('max', '0');
    chargeStrengthConfiguration.setAttribute('step', '20');
    chargeStrengthConfiguration.setAttribute('value', '-40');

    chargeStrengthConfiguration.oninput = () => {
      this.d3Graph.chargeStrength = chargeStrengthConfiguration.value;
      this.d3Graph.updateForceSimulation();
    };

    const chargeStrengthLabel = document.createElement('label');
    chargeStrengthLabel.innerText = '\n\nStrength of node attraction: ';

    const chargeStrengthScale = document.createElement('div');
    chargeStrengthScale.className = 'scale';

    for (let i = -80; i <= 0; i += 20) {
      const chargeStrengthScaleLabel = document.createElement('span');
      chargeStrengthScaleLabel.className = 'scale_label';
      chargeStrengthScaleLabel.innerText = i;
      chargeStrengthScale.appendChild(chargeStrengthScaleLabel);
    }

    const distanceLinkConfiguration = document.createElement('input');
    distanceLinkConfiguration.setAttribute('type', 'range');
    distanceLinkConfiguration.setAttribute('min', '10');
    distanceLinkConfiguration.setAttribute('max', '50');
    distanceLinkConfiguration.setAttribute('step', '10');
    distanceLinkConfiguration.setAttribute('value', '30');

    distanceLinkConfiguration.oninput = () => {
      this.d3Graph.distanceLink = distanceLinkConfiguration.value;
      this.d3Graph.updateForceSimulation();
    };

    const distanceLinkLabel = document.createElement('label');
    distanceLinkLabel.innerText = '\n Length of links: ';

    const distanceLinkScale = document.createElement('div');
    distanceLinkScale.className = 'scale';

    for (let i = 10; i <= 50; i += 10) {
      const distanceLinkScaleLabel = document.createElement('span');
      distanceLinkScaleLabel.className = 'scale_label';
      distanceLinkScaleLabel.innerText = i;
      distanceLinkScale.appendChild(distanceLinkScaleLabel);
    }

    const forceCenterConfiguration = document.createElement('input');
    forceCenterConfiguration.setAttribute('type', 'range');
    forceCenterConfiguration.setAttribute('min', '0');
    forceCenterConfiguration.setAttribute('max', '0.3');
    forceCenterConfiguration.setAttribute('step', '0.1');
    forceCenterConfiguration.setAttribute('value', '0.1');

    forceCenterConfiguration.oninput = () => {
      this.d3Graph.forceCenter = forceCenterConfiguration.value;
      this.d3Graph.updateForceSimulation();
    };

    const forceCenterLabel = document.createElement('label');
    forceCenterLabel.innerText = '\n Attraction to the graph center: ';

    const forceCenterScale = document.createElement('div');
    forceCenterScale.className = 'scale';

    for (const i of [0, 0.1, 0.2, 0.3]) {
      const forceCenterScaleLabel = document.createElement('span');
      forceCenterScaleLabel.className = 'scale_label';
      forceCenterScaleLabel.innerText = i;
      forceCenterScale.appendChild(forceCenterScaleLabel);
    }

    const zoomCheckBox = document.createElement('input');
    zoomCheckBox.setAttribute('type', 'checkbox');
    zoomCheckBox.setAttribute('id', 'zoom');
    zoomCheckBox.setAttribute('name', 'zoom');
    zoomCheckBox.defaultChecked = true;
    const zoomCheckBoxLabel = document.createElement('label');
    zoomCheckBoxLabel.innerText = ' Zoom Clustering';
    zoomCheckBoxLabel.setAttribute('for', 'zoom');

    zoomCheckBox.oninput = () => {
      this.d3Graph.zoomClustering = zoomCheckBox.checked;
      if (!zoomCheckBox.checked) {
        this.d3Graph.changeVisibilityChildren('zoom');
        this.d3Graph.removeNode('zoom');
      }
    };

    this.menuUser.appendChild(menuLabel);
    this.menuUser.appendChild(zoomLabel);
    this.menuUser.appendChild(this.zoom);
    this.menuUser.appendChild(zoomScale);
    this.menuUser.appendChild(buildingIdLabel);
    this.menuUser.appendChild(this.buildingIdInput);
    this.menuUser.appendChild(this.showBuildingButton);
    this.menuUser.appendChild(chargeStrengthLabel);
    this.menuUser.appendChild(chargeStrengthConfiguration);
    this.menuUser.appendChild(chargeStrengthScale);
    this.menuUser.appendChild(distanceLinkLabel);
    this.menuUser.appendChild(distanceLinkConfiguration);
    this.menuUser.appendChild(distanceLinkScale);
    this.menuUser.appendChild(forceCenterLabel);
    this.menuUser.appendChild(forceCenterConfiguration);
    this.menuUser.appendChild(forceCenterScale);
    this.menuUser.appendChild(zoomCheckBox);
    this.menuUser.appendChild(zoomCheckBoxLabel);
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
    this.initResultDisplay();
    this.initMenuUserGraphConfiguration();
    this.initContextMenu();
  }
}
