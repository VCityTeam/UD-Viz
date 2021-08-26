import { Window } from '../../../Components/GUI/js/Window';
import { SparqlEndpointResponseProvider } from '../service/SparqlEndpointResponseProvider';
import { Graph } from './graph';

/**
 * The SPARQL query window class which provides the user interface for querying
 * a SPARQL endpoint and displaying the endpoint response.
 */
export class SparqlQueryWindow extends Window {
  /**
   * Creates a SPARQL query window.
   * @param {SparqlEndpointResponseProvider} provider the SparqlEndpointResponseProvider.
   */
  constructor(provider) {
    super('sparqlQueryWindow', 'SPARQL Query');

    /**
     * The SPARQL Endpoint Response Provider.
     *
     * @type {SparqlEndpointResponseProvider}
     */

    this.provider = provider;
    /**
     * Contains the D3 graph view to display RDF data.
     *
     * @type {Graph}
     */
    this.graph = new Graph();
    this.default_query = 'SELECT *\nWHERE {\n  ?subject ?predicate ?object .\n}';
  }

  /**
   * Override the windowCreated function. Sets the SparqlEndpointResponseProvider and
   * graph view. Should be called by `SparqlModuleView`. Once this is done,
   * the window is actually usable ; service event listerers are set here.
   * @param {SparqlEndpointService} service The SPARQL endpoint service.
   */
  windowCreated() {
    this.dataView.append(this.graph.nodes);
    this.form.onsubmit = () => {
      this.provider.querySparqlEndpointService(this.queryTextArea.textContent);
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
  }

  get innerContentHtml() {
    return /*html*/ `
        <div>
            <form id=${this.formId}>
                <label for="${this.queryTextAreaId}">Query:</label></br>
                <textarea id="${this.queryTextAreaId}" rows="10" cols="27">${this.default_query}</textarea></br>
                <input id="${this.buttonId}" type="submit" value="Send"/>
            </form>
            <label>Results:</label>
            <div id=${this.dataViewId} width="240" height="240"/>
        </div>
      `;
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
