import { Window } from '../../../Components/GUI/js/Window';
import { SparqlEndpointResponseProvider } from '../ViewModel/SparqlEndpointResponseProvider';
import { Graph } from '../Model/Graph';
import { Table } from '../Model/Table';
import { LayerManager } from '../../../Components/Components';
import { ExtendedCityObjectProvider } from '../ViewModel/ExtendedCityObjectProvider';
import * as renderjson from './JsonRender';
import './SparqlQueryWindow.css';

/**
 * The SPARQL query window class which provides the user interface for querying
 * a SPARQL endpoint and displaying the endpoint response.
 */
export class SparqlQueryWindow extends Window {
  /**
   * Creates a SPARQL query window.
   * @param {SparqlEndpointResponseProvider} sparqlProvider The SPARQL Endpoint Response Provider
   * @param {ExtendedCityObjectProvider} cityObjectProvider The City Object Provider
   * @param {LayerManager} layerManager The UD-Viz LayerManager.
   */
  constructor(sparqlProvider, cityObjectProvider, layerManager) {
    super('sparqlQueryWindow', 'SPARQL Query');

    /**
     * The SPARQL Endpoint Response Provider
     *
     * @type {SparqlEndpointResponseProvider}
     */
    this.sparqlProvider = sparqlProvider;

    /**
     * The Extended City Object Provider
     *
     * @type {ExtendedCityObjectProvider}
     */
    this.cityObjectProvider = cityObjectProvider;

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
    this.graph = new Graph(this);

    /**
     * Contains the D3 table to display RDF data.
     *
     * @type {Table}
     */
    this.table = new Table(this);

    /**
     * The initial SPARQL query to display upon window initialization.
     *
     * @type {string}
     */
    this.default_query = `PREFIX rdf:  <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl:  <http://www.w3.org/2002/07/owl#>
PREFIX xsd:  <http://www.w3.org/2001/XMLSchema#>
PREFIX gmlowl:  <http://www.opengis.net/ont/gml#>
PREFIX units: <http://www.opengis.net/def/uom/OGC/1.0/>
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
PREFIX geof: <http://www.opengis.net/def/function/geosparql/>
PREFIX strdf: <http://strdf.di.uoa.gr/ontology#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX core: <http://www.opengis.net/citygml/2.0/core#>
PREFIX bldg: <http://www.opengis.net/citygml/building/2.0/building#>

# Return all CityGML City Objects
SELECT *
WHERE {
  ?subject a core:CityModel ;
    ?predicate ?object .
  ?subject a ?subjectType .
  ?object a bldg:Building .
  ?object a ?objectType .
  
  FILTER(?subjectType != <http://www.w3.org/2002/07/owl#NamedIndividual>)
  FILTER(?objectType != <http://www.w3.org/2002/07/owl#NamedIndividual>)
}`;
    this.registerEvent(SparqlQueryWindow.EVENT_NODE_SELECTED);
  }

  /**
   * Override the windowCreated function. Sets the SparqlEndpointResponseProvider
   * and graph view. Should be called by `SparqlModuleView`. Once this is done,
   * the window is actually usable ; service event listerers are set here.
   * @param {SparqlEndpointService} service The SPARQL endpoint service.
   */
  windowCreated() {
    this.form.onsubmit = () => {
      this.sparqlProvider.querySparqlEndpointService(this.queryTextArea.value);
      return false;
    };

    this.sparqlProvider.addEventListener(
      SparqlEndpointResponseProvider.EVENT_ENDPOINT_RESPONSE_UPDATED,
      (data) => this.updateDataView(data, document.getElementById(this.resultSelectId).value)
    );

    this.addEventListener(Graph.EVENT_NODE_SELECTED, (uri) =>
      this.cityObjectProvider.selectCityObjectByBatchTable(
        'gml_id',
        this.sparqlProvider.tokenizeURI(uri).id
      )
    );
  }

  /**
   * Update the DataView.
   * @param {Object} data SPARQL query response data.
   * @param {Object} viewType The selected semantic data view type.
   */
  updateDataView(data, viewType) {
    console.debug(data)
    this.clearDataView();
    switch(viewType){
      case 'graph':
        this.graph.update(data);
        this.dataView.append(this.graph.node);
        break;
      case 'json':
        this.dataView.append(
          renderjson
            .set_icons('▶', '▼')
            .set_max_string_length(40)
          (data));
        break;
      case 'table':
        this.table.dataAsTable(data.nodes, ['id', 'namespace'], this.filterSelect);
        this.dataView.style['height'] = '500px';
        this.dataView.style['overflow'] = 'scroll';
        break;
      default:
        console.error('This result format is not supported: ' + viewType);
    }
  }

  /**
   * Clear the DataView of content.
   */
  clearDataView() {
    this.dataView.innerHTML="";
    this.dataView.style['height'] = '100%';
    this.dataView.style['overflow'] = 'auto';
  }

  // SPARQL Window getters //
  get innerContentHtml() {
    return /*html*/ `
      <form id=${this.formId}>
        <label for="${this.queryTextAreaId}">Query:</label></br>
        <textarea id="${this.queryTextAreaId}" rows="10">${this.default_query}</textarea></br>
        <input id="${this.queryButtonId}" type="submit" value="Send"/>
        <label>Results Format: </label>
        <select id="${this.resultSelectId}">
          <option value="graph">Graph</option>
          <option value="table">Table</option>
          <option value="json">JSON</option>
          <option value="timeline">Timeline</option>
        </select>
      </form>
      <hr/>
      <div id="${this.dataViewId}"/>`;
  }

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

  get resultSelectId() {
    return `${this.windowId}_resultSelect`;
  }

  get resultSelect() {
    return document.getElementById(this.resultSelectId);
  }

  get queryButtonId() {
    return `${this.windowId}_query_button`;
  }

  get queryButton() {
    return document.getElementById(this.queryButtonId);
  }

  get queryTextAreaId() {
    return `${this.windowId}_query_text_area`;
  }

  get queryTextArea() {
    return document.getElementById(this.queryTextAreaId);
  }
}
