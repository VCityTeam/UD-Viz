import { Window } from '../../../Component/GUI/js/Window';
import { SparqlEndpointResponseProvider } from '../Service/SparqlEndpointResponseProvider';
import { Graph } from '../Model/Graph';
import { Table } from '../Model/Table';
import * as URI from '../Model/URI';
import { LayerManager } from '../../../../Itowns/LayerManager/LayerManager';
import { CityObjectProvider } from '../../../CityObjects/ViewModel/CityObjectProvider';
import { JsonRenderer } from './JsonRenderer';
import { focusCameraOn } from '../../../../Itowns/Component/Component';
import './SparqlQueryWindow.css';

/**
 * The SPARQL query window class which provides the user interface for querying
 * a SPARQL endpoint and displaying the endpoint response.
 */
export class SparqlQueryWindow extends Window {
  /**
   * Creates a SPARQL query window.
   * @param {SparqlEndpointResponseProvider} sparqlProvider The SPARQL Endpoint Response Provider
   * @param {CityObjectProvider} cityObjectProvider The City Object Provider
   * @param {LayerManager} layerManager The UD-Viz LayerManager.
   * @param {object} configSparql The sparqlModule configuration.
   */
  constructor(sparqlProvider, cityObjectProvider, layerManager, sparqlConfig) {
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
    this.graph = new Graph(this, sparqlConfig);

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
    
    this.registerEvent(Graph.EVENT_NODE_CLICKED);
    this.registerEvent(Graph.EVENT_NODE_MOUSEOVER);
    this.registerEvent(Graph.EVENT_NODE_MOUSEOUT);
    this.registerEvent(Table.EVENT_CELL_CLICKED);
  }

  /**
   * Override the windowCreated function. Sets the SparqlEndpointResponseProvider
   * and graph view. Should be called by a `SparqlWidgetView`. Once this is done,
   * the window is actually usable ; service event listerers are set here.
   * @param {SparqlEndpointService} service The SPARQL endpoint service.
   */
  windowCreated() {
    this.toggleQueryTextAreaButton.onclick = () => this.toggleQueryTextArea();

    this.querySelect.onchange = () => this.updateQueryTextArea(this.querySelect.value);

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
          document.getElementById(this.resultSelectId).value
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
      )
      if (cityObject) {
        focusCameraOn(
          this.layerManager.view,
          this.layerManager.view.controls,
          cityObject.centroid,
          {
            verticalDistance: 200,
            horizontalDistance: 200
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

  /**
   * Update the DataView.
   * @param {Object} data SPARQL query response data.
   * @param {Object} view_type The selected semantic data view type.
   */
  updateDataView(response, view_type) {
    console.debug(response);
    this.clearDataView();
    switch (view_type) {
      case 'graph':
        this.graph.update(this.graph.formatResponseDataAsGraph(response));
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

  updateQueryTextArea(value) {
    switch (value) {
      case 'versionQuery':
        this.queryTextArea.textContent = this.defaultQueryPrefixes + this.versionQuery;
        break;
      case 'buildingByIDQuery':
        this.queryTextArea.textContent = this.defaultQueryPrefixes + this.buildingByIDQuery;
        break;
      case 'ifcSlabQuery':
        this.queryTextArea.textContent = this.defaultQueryPrefixes + this.ifcSlabQuery;
        break;
      case 'ifcSlabCountQuery':
        this.queryTextArea.textContent = this.defaultQueryPrefixes + this.ifcSlabCountQuery;
        break;
      case 'ifcSlabByIDQuery':
        this.queryTextArea.textContent = this.defaultQueryPrefixes + this.ifcSlabByIDQuery;
        break;
      default:
        console.warn(`Query select dropdown value: ${value} is not recognized`)
        this.queryTextArea.textContent = this.defaultQueryPrefixes + this.defaultQuery;
        break;
    }
  }

  // SPARQL Window getters //
  get innerContentHtml() {
    return /*html*/ `
      <div class="box-section">
        <label>Select Query: </label>
        <select id="${this.querySelectId}">
          <option value="versionQuery">Select Buildings from Version</option>
          <option value="buildingByIDQuery">Select Building by ID</option>
          <option value="ifcSlabQuery">Select Ifc Slabs from Building</option>
          <option value="ifcSlabCountQuery">Count Ifc Slabs in Building</option>
          <option value="ifcSlabByIDQuery">Select Ifc Slab by ID</option>
        </select>
        <button id="${this.toggleQueryTextAreaButtonId}">▶</button>
        <form id=${this.formId}>
          <textarea id="${this.queryTextAreaId}" rows="20" style="display:none">${this.defaultQueryPrefixes}${this.defaultQuery}</textarea>
          <input id="${this.submitButtonId}" type="submit" value="Send"/>
          <label>Results Format: </label>
          <select id="${this.resultSelectId}">
            <option value="graph">Graph</option>
            <option value="table">Table</option>
            <option value="json">JSON</option>
          </select>
        </form>
      </div>
      <div id="${this.dataViewId}" class="box-selection"/>`;
  }

  get defaultQueryPrefixes() {
    return `# Common prefixes
PREFIX rdf:    <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs:   <http://www.w3.org/2000/01/rdf-schema#>
PREFIX owl:    <http://www.w3.org/2002/07/owl#>
PREFIX xsd:    <http://www.w3.org/2001/XMLSchema#>
PREFIX list:   <https://w3id.org/list#>
PREFIX skos:   <http://www.w3.org/2004/02/skos/core#>
PREFIX gml:    <http://www.opengis.net/gml#>
PREFIX gmlowl: <http://www.opengis.net/ont/gml#>
PREFIX units:  <http://www.opengis.net/def/uom/OGC/1.0/>
PREFIX geo:    <http://www.opengis.net/ont/geosparql#>
PREFIX geof:   <http://www.opengis.net/def/function/geosparql/>
PREFIX strdf:  <http://strdf.di.uoa.gr/ontology#>
PREFIX xlink:  <http://www.w3.org/1999/xlink#>

# IFC2x3 Prefixes
PREFIX express: <https://w3id.org/express#>
PREFIX ifc:     <http://standards.buildingsmart.org/IFC/DEV/IFC2x3/TC1/OWL#>

# CityGML 2.0 prefixes
PREFIX core: <https://raw.githubusercontent.com/VCityTeam/UD-Graph/master/Ontologies/CityGML/2.0/core#>
PREFIX bldg: <https://raw.githubusercontent.com/VCityTeam/UD-Graph/master/Ontologies/CityGML/2.0/building#>
PREFIX brid: <https://raw.githubusercontent.com/VCityTeam/UD-Graph/master/Ontologies/CityGML/2.0/bridge#>
PREFIX luse: <https://raw.githubusercontent.com/VCityTeam/UD-Graph/master/Ontologies/CityGML/2.0/landuse#>
PREFIX app:  <https://raw.githubusercontent.com/VCityTeam/UD-Graph/master/Ontologies/CityGML/2.0/appearance#>
PREFIX dem:  <https://raw.githubusercontent.com/VCityTeam/UD-Graph/master/Ontologies/CityGML/2.0/relief#>
PREFIX frn:  <https://raw.githubusercontent.com/VCityTeam/UD-Graph/master/Ontologies/CityGML/2.0/cityfurniture#>
PREFIX gen:  <https://raw.githubusercontent.com/VCityTeam/UD-Graph/master/Ontologies/CityGML/2.0/generics#>
PREFIX grp:  <https://raw.githubusercontent.com/VCityTeam/UD-Graph/master/Ontologies/CityGML/2.0/cityobjectgroup#>
PREFIX tex:  <https://raw.githubusercontent.com/VCityTeam/UD-Graph/master/Ontologies/CityGML/2.0/texturedsurface#>
PREFIX tun:  <https://raw.githubusercontent.com/VCityTeam/UD-Graph/master/Ontologies/CityGML/2.0/tunnel#>
PREFIX veg:  <https://raw.githubusercontent.com/VCityTeam/UD-Graph/master/Ontologies/CityGML/2.0/vegetation#>
PREFIX wtr:  <https://raw.githubusercontent.com/VCityTeam/UD-Graph/master/Ontologies/CityGML/2.0/waterbody#>

# Versioning prefixes
PREFIX vers: <https://raw.githubusercontent.com/VCityTeam/UD-Graph/master/Ontologies/CityGML/3.0/versioning#>
PREFIX type: <https://raw.githubusercontent.com/VCityTeam/UD-Graph/master/Ontologies/Workspace/3.0/transactiontypes#>

# Dataset prefixes
PREFIX vt:    <https://github.com/VCityTeam/UD-Graph/DOUA_BATI_2009-2018_Workspace#>
PREFIX inst:  <https://raw.githubusercontent.com/VCityTeam/Datasets/ifc_doua#>
PREFIX v2009: <https://github.com/VCityTeam/UD-Graph/DOUA_BATI_2009_stripped_split#>
PREFIX v2012: <https://github.com/VCityTeam/UD-Graph/DOUA_BATI_2012_stripped_split#>
PREFIX v2015: <https://github.com/VCityTeam/UD-Graph/DOUA_BATI_2015_stripped_split#>
PREFIX v2018: <https://github.com/VCityTeam/UD-Graph/DOUA_BATI_2018_stripped_split#>
`;
  }

  get defaultQuery() {
    return this.versionQuery;
  }

  get versionQuery() {
    return `
# Return all features (with types) within a version

SELECT ?subject ?subjectType ?predicate ?object ?objectType
WHERE {
  ?subject a core:CityModel ;
    ?predicate ?object ;
    a ?subjectType .
  ?object a bldg:Building .
  ?object a ?objectType .
  vt:version_2018 vers:Version.versionMember ?object .
  
  FILTER(?subjectType != owl:NamedIndividual)
  FILTER(?objectType != owl:NamedIndividual)
}

LIMIT 30`;
  }
  get buildingByIDQuery() {
    return `
# return a CityGML Building matching an ID

SELECT ?subject ?subjectType ?predicate ?object ?objectType
WHERE {
  ?subject ?predicate ?object ;
    a ?subjectType ;
    skos:prefLabel ?id .

  OPTIONAL { ?object a ?objectType }

  FILTER(?id = "VILLEURBANNE_00012_23")

  FILTER(?subjectType != owl:NamedIndividual)
  FILTER(?objectType != owl:NamedIndividual)
}

LIMIT 30`;
  }

  get ifcSlabQuery() {
    return `
# return all IFC Slabs (with types)

SELECT ?subject ?subjectType ?predicate ?object ?objectType
WHERE {
  ?subject  a  ifc:IfcSlab ;
    a ?subjectType ;
    ?predicate ?object .
  OPTIONAL { ?object a ?objectType }
}

LIMIT 30`;
  }

  get ifcSlabCountQuery() {
    return `
# return number of IFC Slabs in the dataset

SELECT (COUNT(?ifcSlab) AS ?NumOfIfcSlab)
WHERE {
  ?ifcSlab a ifc:IfcSlab .
}

LIMIT 30`;
  }

  get ifcSlabByIDQuery() {
    return `
# return an IFC Slab matching an ID

SELECT ?subject ?subjectType ?predicate ?object ?objectType
WHERE {
  ?subject  a  ifc:IfcSlab ;
    a ?subjectType ;
    ?predicate ?object ;
    ifc:globalId_IfcRoot ?id .
  ?id express:hasString "2Q4QvRyEvCrefpeva98EMR" .
  OPTIONAL { ?object a ?objectType }
}

LIMIT 30`;
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

  get querySelectId() {
    return `${this.windowId}_query_select`;
  }

  get querySelect() {
    return document.getElementById(this.querySelectId);
  }

  get resultSelectId() {
    return `${this.windowId}_result_select`;
  }

  get resultSelect() {
    return document.getElementById(this.resultSelectId);
  }

  get submitButtonId() {
    return `${this.windowId}_submit_button`;
  }

  get submitButton() {
    return document.getElementById(this.submitButtonId);
  }

  get queryTextAreaId() {
    return `${this.windowId}_query_text_area`;
  }

  get queryTextArea() {
    return document.getElementById(this.queryTextAreaId);
  }

  get toggleQueryTextAreaButtonId() {
    return `${this.windowId}_toggle_query_text_area_button`
  }

  get toggleQueryTextAreaButton() {
    return document.getElementById(this.toggleQueryTextAreaButtonId);
  }
}
