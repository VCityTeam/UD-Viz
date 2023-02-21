import { SparqlEndpointResponseProvider } from '../Service/SparqlEndpointResponseProvider';
import { Graph } from '../Model/Graph';
import { Table } from '../Model/Table';
import * as URI from '../Model/URI';
import { JsonRenderer } from './JsonRenderer';
import { focusCameraOn } from '../../../../ItownsUtil';
import { loadTextFile } from '../../../../FileUtil';
import { EventSender } from '@ud-viz/shared';
import { findChildByID } from '../../../../HTMLUtil';
import * as itowns from 'itowns';
import * as THREE from 'three';

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
   * @param {itowns.PlanarView} itownsView view
   * @param {object} configSparqlWidget The sparqlModule view configuration.
   * @param {object} configSparqlWidget.queries Query configurations
   * @param {object} configSparqlWidget.queries.title The query title
   * @param {object} configSparqlWidget.queries.filepath The path to the file which contains the query text
   * @param {object} configSparqlWidget.queries.formats Configuration for which visualizations are allowed
   *                                              with this query. Should be an object of key, value
   *                                              pairs. The keys of these pairs should correspond
   *                                              with the cases in the updateDataView() function.
   */
  constructor(sparqlProvider, itownsView, configSparqlWidget) {
    super();

    /** @type {HTMLElement} */
    this.domElement = document.createElement('div');
    this.domElement.setAttribute('id', '_window_sparqlQueryWindow');
    this.domElement.innerHTML = this.innerContentHtml;

    /**
     * The SPARQL Endpoint Response Provider
     *
     * @type {SparqlEndpointResponseProvider}
     */
    this.sparqlProvider = sparqlProvider;

    /** @type {itowns.PlanarView} */
    this.itownsView = itownsView;

    /**
     * The Temporal Provider
     *
     * @type {TemporalProvider}
     */
    this.temporalProvider = temporalProvider;

    /**
     *A reference to the JsonRenderer class
     *
     * @type {JsonRenderer}
     */
    this.jsonRenderer = new JsonRenderer();

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
     * Contains the D3 table to display RDF data.
     *
     * @type {Table}
     */
    this.workspace = new WorkspaceGraph(this, configSparqlWidget);

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
          findChildByID(this.domElement, this.resultSelectId).value
        )
    );

    const fetchC3DTileFeatureWithNodeText = (node_text) => {
      let result = null;
      this.itownsView
        .getLayers()
        .filter((el) => el.isC3DTilesLayer)
        .forEach((c3DTilesLayer) => {
          for (const [
            // eslint-disable-next-line no-unused-vars
            tileId,
            tileC3DTileFeatures,
          ] of c3DTilesLayer.tilesC3DTileFeatures) {
            // eslint-disable-next-line no-unused-vars
            for (const [batchId, c3DTileFeature] of tileC3DTileFeatures) {
              if (
                c3DTileFeature.getInfo().batchTable['gml_id'] ==
                URI.tokenizeURI(node_text).id
              ) {
                result = {
                  feature: c3DTileFeature,
                  layer: c3DTilesLayer,
                };
                break;
              }
            }
          }
        });

      return result;
    };

    this.addEventListener(Graph.EVENT_NODE_CLICKED, (node_text) => {
      const clickedResult = fetchC3DTileFeatureWithNodeText(node_text);

      if (!clickedResult) return;

      focusCameraOn(
        this.itownsView,
        this.itownsView.controls,
        clickedResult.layer
          .computeWorldBox3(clickedResult.feature)
          .getCenter(new THREE.Vector3()),
        {
          verticalDistance: 200,
          horizontalDistance: 200,
        }
      );
    });

    // this.addEventListener(Graph.EVENT_NODE_MOUSEOVER, (node_text) => {
    //   console.warn('DEPRECATED cant apply style to ', node_text);
    // if this imply some style it should be handle in template or layer should be able to have != styles ?
    // });

    // this.addEventListener(
    //   Graph.EVENT_NODE_MOUSEOUT,
    //   () => console.warn('DEPRECATED') // same reason as above
    // );

    this.addEventListener(Table.EVENT_CELL_CLICKED, (cell_text) => {
      const clickedResult = fetchC3DTileFeatureWithNodeText(cell_text);

      if (!clickedResult) return;

      focusCameraOn(
        this.itownsView,
        this.itownsView.controls,
        clickedResult.layer
          .computeWorldBox3(clickedResult.feature)
          .getCenter(new THREE.Vector3()),
        {
          verticalDistance: 200,
          horizontalDistance: 200,
        }
      );
    });
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
      case 'workspace':
        this.workspace.update(this.workspace.formatResponseDataAsGraph(response));
        this.dataView.append(this.workspace.canvas);
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
    return findChildByID(this.domElement, this.dataViewId);
  }

  get formId() {
    return `sparql_window_form`;
  }

  get form() {
    return findChildByID(this.domElement, this.formId);
  }

  get querySelectId() {
    return `sparql_window_query_select`;
  }

  get querySelect() {
    return findChildByID(this.domElement, this.querySelectId);
  }

  get resultSelectId() {
    return `sparql_window_result_select`;
  }

  get resultSelect() {
    return findChildByID(this.domElement, this.resultSelectId);
  }

  get submitButtonId() {
    return `sparql_window_submit_button`;
  }

  get submitButton() {
    return findChildByID(this.domElement, this.submitButtonId);
  }

  get queryTextAreaId() {
    return `sparql_window_query_text_area`;
  }

  get queryTextArea() {
    return findChildByID(this.domElement, this.queryTextAreaId);
  }

  get toggleQueryTextAreaButtonId() {
    return `sparql_window_toggle_query_text_area_button`;
  }

  get toggleQueryTextAreaButton() {
    return findChildByID(this.domElement, this.toggleQueryTextAreaButtonId);
  }
}
