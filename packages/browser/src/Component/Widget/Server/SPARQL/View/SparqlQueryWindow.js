import { SparqlEndpointResponseProvider } from '../Service/SparqlEndpointResponseProvider';
import { Graph } from '../Model/Graph';
import { Table } from '../Model/Table';
import * as URI from '../Model/URI';
import { LayerManager } from '../../../../Itowns/LayerManager/LayerManager';
import { CityObjectProvider } from '../../../CityObjects/ViewModel/CityObjectProvider';
import { JsonRenderer } from './JsonRenderer';
import { focusCameraOn } from '../../../../Itowns/Component/Component';
import { loadTextFile } from '../../../../FileUtil';
import { EventSender } from '@ud-viz/shared';
import { findChildByID } from '../../../../HTMLUtil';

import './SparqlQueryWindow.css';

/**
 * The SPARQL query window class which provides the user interface for querying
 * a SPARQL endpoint and displaying the endpoint response.
 */
export class SparqlQueryWindow extends EventSender {
  /**
   * Creates a SPARQL query window.
   *
   * @param {SparqlEndpointResponseProvider} sparqlProvider The SPARQL Endpoint Response Provider
   * @param {CityObjectProvider} cityObjectProvider The City Object Provider
   * @param {LayerManager} layerManager The UD-Viz LayerManager.
   * @param {object} configSparqlWidget The sparqlModule view configuration.
   * @param {object} configSparqlWidget.queries Query configurations
   * @param {object} configSparqlWidget.queries.title The query title
   * @param {object} configSparqlWidget.queries.filepath The path to the file which contains the query text
   * @param {object} configSparqlWidget.queries.formats Configuration for which visualizations are allowed
   *                                              with this query. Should be an object of key, value
   *                                              pairs. The keys of these pairs should correspond
   *                                              with the cases in the updateDataView() function.
   */
  constructor(
    sparqlProvider,
    cityObjectProvider,
    layerManager,
    configSparqlWidget
  ) {
    super();

    /** @type {HTMLElement} */
    this.rootHtml = document.createElement('div');
    this.rootHtml.setAttribute('id', '_window_sparqlQueryWindow');
    this.rootHtml.innerHTML = this.innerContentHtml;

    /**
     * The SPARQL Endpoint Response Provider
     *
     * @type {SparqlEndpointResponseProvider}
     */
    this.sparqlProvider = sparqlProvider;

    /**
     * The Extended City Object Provider
     *
     * @type {CityObjectProvider}
     */
    this.cityObjectProvider = cityObjectProvider;

    /**
     *A reference to the JsonRenderer class
     *
     * @type {JsonRenderer}
     */
    this.jsonRenderer = new JsonRenderer();

    /**
     * The UD-Viz LayerManager.
     *
     * @type {LayerManager}
     */
    this.layerManager = layerManager;

    /**
     * Contains the D3 graph view to display RDF data.
     *
     * @type {Graph}
     */
    this.graph = new Graph(this, configSparqlWidget);

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

    this.registerEvent(Graph.EVENT_NODE_CLICKED);
    this.registerEvent(Graph.EVENT_NODE_MOUSEOVER);
    this.registerEvent(Graph.EVENT_NODE_MOUSEOUT);
    this.registerEvent(Table.EVENT_CELL_CLICKED);

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
      this.updateQueryTextArea(0);
      this.updateResultDropdown(0);
    });

    this.toggleQueryTextAreaButton.onclick = () => this.toggleQueryTextArea();
    this.querySelect.onchange = () => {
      this.updateQueryTextArea(this.querySelect.value);
      this.updateResultDropdown(this.querySelect.value);
    };

    this.form.onsubmit = () => {
      console.log('submit');
      this.sparqlProvider.querySparqlEndpointService(this.queryTextArea.value);
      return false;
    };

    this.sparqlProvider.addEventListener(
      SparqlEndpointResponseProvider.EVENT_ENDPOINT_RESPONSE_UPDATED,
      (response) =>
        this.updateDataView(
          response,
          findChildByID(this.rootHtml, this.resultSelectId).value
        )
    );

    this.addEventListener(Graph.EVENT_NODE_CLICKED, (node_text) => {
      this.cityObjectProvider.selectCityObjectByBatchTable(
        'gml_id',
        URI.tokenizeURI(node_text).id
      );
      const cityObject = this.layerManager.pickCityObjectByBatchTable(
        'gml_id',
        URI.tokenizeURI(node_text).id
      );
      if (cityObject) {
        focusCameraOn(
          this.layerManager.view,
          this.layerManager.view.controls,
          cityObject.centroid,
          {
            verticalDistance: 200,
            horizontalDistance: 200,
          }
        );
      }
    });

    this.addEventListener(Graph.EVENT_NODE_MOUSEOVER, (node_text) =>
      this.cityObjectProvider.selectCityObjectByBatchTable(
        'gml_id',
        URI.tokenizeURI(node_text).id
      )
    );

    this.addEventListener(Graph.EVENT_NODE_MOUSEOUT, () =>
      this.cityObjectProvider.unselectCityObject()
    );

    this.addEventListener(Table.EVENT_CELL_CLICKED, (cell_text) =>
      this.cityObjectProvider.selectCityObjectByBatchTable(
        'gml_id',
        URI.tokenizeURI(cell_text).id
      )
    );
  }

  html() {
    return this.rootHtml;
  }

  dispose() {
    this.rootHtml.remove();
  }

  /**
   * Update the DataView.
   *
   * @param {object} response A JSON object returned by a SparqlEndpointResponseProvider.EVENT_ENDPOINT_RESPONSE_UPDATED event
   * @param {string} view_type The selected semantic data view type.
   */
  updateDataView(response, view_type) {
    console.info(response);
    this.clearDataView();
    switch (view_type) {
      case 'graph':
        this.graph.update(response);
        this.dataView.append(this.graph.canvas);
        break;
      case 'json':
        this.jsonRenderer.renderjson.set_icons('▶', '▼');
        this.jsonRenderer.renderjson.set_max_string_length(40);
        this.dataView.append(this.jsonRenderer.renderjson(response));
        break;
      case 'table':
        this.table.dataAsTable(response.results.bindings, response.head.vars);
        this.table.filterInput.addEventListener('change', (e) =>
          Table.update(this.table, e)
        );
        this.dataView.style['height'] = '500px';
        this.dataView.style['overflow'] = 'scroll';
        break;
      default:
        console.error('This result format is not supported: ' + view_type);
    }
  }

  /**
   * Clear the DataView of content.
   */
  clearDataView() {
    this.dataView.innerHTML = '';
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
    this.queryTextArea.textContent = this.queries[Number(index)].text;
  }

  /**
   * Update this.querySelect options using an array of queries. For each element in the array,
   * create an option element, set the innerHTML of the option to the query's title,
   * set the value of the option to the index of the query in the array, then append
   * the option to this.querySelect
   *
   * @param {Array<object>} queries - An array of objects that contain a query title and the query text itself
   */
  updateQueryDropdown(queries) {
    for (let index = 0; index < queries.length; index++) {
      const option = document.createElement('option');
      option.innerHTML = queries[index].title;
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
      option.innerHTML = v;
      this.resultSelect.appendChild(option);
    });
  }

  // SPARQL Window getters //
  get innerContentHtml() {
    return /* html*/ `
      <div class="box-section">
        <label>Select Query: </label>
        <select id="${this.querySelectId}"></select>
        <button id="${this.toggleQueryTextAreaButtonId}">▶</button>
        <form id=${this.formId}>
          <textarea id="${this.queryTextAreaId}" rows="20" style="display:none"></textarea>
          <input id="${this.submitButtonId}" type="submit" value="Send"/>
          <label>Results Format: </label>
          <select id="${this.resultSelectId}"></select>
        </form>
      </div>
      <div id="${this.dataViewId}" class="box-selection"/>`;
  }

  get dataViewId() {
    return `sparql_window_data_view`;
  }

  get dataView() {
    return findChildByID(this.rootHtml, this.dataViewId);
  }

  get formId() {
    return `sparql_window_form`;
  }

  get form() {
    return findChildByID(this.rootHtml, this.formId);
  }

  get querySelectId() {
    return `sparql_window_query_select`;
  }

  get querySelect() {
    return findChildByID(this.rootHtml, this.querySelectId);
  }

  get resultSelectId() {
    return `sparql_window_result_select`;
  }

  get resultSelect() {
    return findChildByID(this.rootHtml, this.resultSelectId);
  }

  get submitButtonId() {
    return `sparql_window_submit_button`;
  }

  get submitButton() {
    return findChildByID(this.rootHtml, this.submitButtonId);
  }

  get queryTextAreaId() {
    return `sparql_window_query_text_area`;
  }

  get queryTextArea() {
    return findChildByID(this.rootHtml, this.queryTextAreaId);
  }

  get toggleQueryTextAreaButtonId() {
    return `sparql_window_toggle_query_text_area_button`;
  }

  get toggleQueryTextAreaButton() {
    return findChildByID(this.rootHtml, this.toggleQueryTextAreaButtonId);
  }
}
