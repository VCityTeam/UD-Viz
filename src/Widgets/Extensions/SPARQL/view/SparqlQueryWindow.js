import { Window } from '../../../Components/GUI/js/Window';
import { SparqlEndpointResponseProvider } from '../service/SparqlEndpointResponseProvider';
import { Graph } from './graph';
import { LayerManager } from '../../../Components/Components';

/**
 * The SPARQL query window class which provides the user interface for querying
 * a SPARQL endpoint and displaying the endpoint response.
 */
export class SparqlQueryWindow extends Window {
  /**
   * Creates a SPARQL query window.
   * @param {SparqlEndpointResponseProvider} provider the SparqlEndpointResponseProvider.
   * @param {LayerManager} layerManager The UD-Viz LayerManager.
   */
  constructor(provider, layerManager) {
    super('sparqlQueryWindow', 'SPARQL Query');

    /**
     * The SPARQL Endpoint Response Provider.
     *
     * @type {SparqlEndpointResponseProvider}
     */
    this.provider = provider;

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
    this.graph = new Graph();

    /**
     * The initial SPARQL query to display upon window initialization.
     *
     * @type {Graph}
     */
    this.default_query = `SELECT *
WHERE {
  ?subject ?predicate ?object .
}`;
  }

  /**
   * Override the windowCreated function. Sets the SparqlEndpointResponseProvider and
   * graph view. Should be called by `SparqlModuleView`. Once this is done,
   * the window is actually usable ; service event listerers are set here.
   * @param {SparqlEndpointService} service The SPARQL endpoint service.
   */
  windowCreated() {
    this.form.onsubmit = () => {
      this.provider.querySparqlEndpointService(this.queryTextArea.value);
      return false;
    };
    this.provider.addEventListener(
      SparqlEndpointResponseProvider.EVENT_ENDPOINT_RESPONSE_UPDATED,
      (data) => this.updateDataView(data)
    );
  }

  /**
   * Update the window.
   * @param {Object} data SPARQL query response data.
   */
  updateDataView(data) {
    this.graph.updateGraph(data);
    this.dataView.style['visibility'] = 'visible';
    this.dataView.append(this.graph.data);
  }

  get innerContentHtml() {
    return /*html*/ `
      <form id=${this.formId}>
          <label for="${this.queryTextAreaId}">Query:</label></br>
          <textarea id="${this.queryTextAreaId}" rows="10">${this.default_query}</textarea></br>
          <input id="${this.buttonId}" type="submit" value="Send"/>
      </form>
      <label>Results Format:</label>
      <select>
        <option value="graph">Graph</option>
        <option value="table">Table</option>
      </select>
      <div id="${this.dataViewId}"/>`;
  }

  // SPARQL Window getters //
  get dataViewId() {
    return `${this.windowId}_data_view`;
  }

  get dataView() {
    return document.getElementById(this.dataViewId);
  }

  get formId() {
    return `${this.windowId}_form`;
  }

  get form() {
    return document.getElementById(this.formId);
  }

  get buttonId() {
    return `${this.windowId}_query_button`;
  }

  get button() {
    return document.getElementById(this.buttonId);
  }

  get queryTextAreaId() {
    return `${this.windowId}_query_text_area`;
  }

  get queryTextArea() {
    return document.getElementById(this.queryTextAreaId);
  }
}
