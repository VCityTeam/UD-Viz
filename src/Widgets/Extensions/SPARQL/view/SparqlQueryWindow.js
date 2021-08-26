import { Window } from '../../../Components/GUI/js/Window';
import { SparqlEndpointService } from '../service/SparqlEndpointService';
import { graphView } from './graphView';

/**
 * The SPARQL query window class which provides the user interface for querying
 * a SPARQL endpoint and displaying the endpoint response.
 */
export class SparqlQueryWindow extends Window {
  /**
   * Creates a SPARQL query window.
   * @param {SparqlEndpointService} service the SPARQL endpoint service.
   */
  constructor(service) {
    super('sparqlQueryWindow', 'SPARQL Query');
    const data = {
      nodes: [
        { id: 'a', group: 1 },
        { id: 'b', group: 2 },
        { id: 'c', group: 3 },
      ],
      links: [
        { source: 'a', target: 'b', value: 1 },
        { source: 'b', target: 'c', value: 2 },
      ],
    };

    this.service = service;
    /**
     * Contains the D3 graph view to display RDF data.
     *
     * @type {graphView}
     */
    this.graphView = new graphView(data);
    this.default_query = 'SELECT *\nWHERE {\n  ?s ?o ?p .\n}';
  }

  /**
   * Override the windowCreated function. Sets the SparqlEndpointService and
   * graph view. Should be called by `SparqlModuleView`. Once this is done,
   * the window is actually usable ; service event listerers are set here.
   * @param {SparqlEndpointService} service The SPARQL endpoint service.
   */
  windowCreated() {
    this.graphContainer.append(this.graphView.nodes);
    this.form.onsubmit = () => {
      this.service.queryEndpointService(this.queryTextArea.textContent);
      const newdata = {
        nodes: [
          { id: 'x', group: 1 },
          { id: 'y', group: 2 },
        ],
        links: [{ source: 'x', target: 'y', value: 1 }],
      };
      this.graphView.updateGraph(newdata);
      return false;
    };
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
            <div id=${this.graphContainerId} width="240" height="240"/>
        </div>
      `;
  }

  // SPARQL Window getters //
  get graphContainerId() {
    return `${this.windowId}_graph_container`;
  }

  get graphContainer() {
    return document.getElementById(this.graphContainerId);
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
