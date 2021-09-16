import { Window } from '../../../Components/GUI/js/Window';
import { SparqlEndpointResponseProvider } from '../ViewModel/SparqlEndpointResponseProvider';
import { Graph } from './Graph';
import { LayerManager } from '../../../Components/Components';
import { CityObject } from '../../../Components/3DTiles/Model/CityObject';
import './SparqlQueryWindow.css';

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
    this.graph = new Graph(this);

    //TODO: move CityObject functions to a provider or ViewModel class

    /**
     * The current highlighted layer.
     *
     * @type {CityObjectLayer}
     */
    this.cityObjectLayer = undefined;

    /**
     * The selected city object.
     *
     * @type {CityObject}
     */
    this.selectedCityObject = undefined;

    this.selectedTilesManager = undefined;

    this.selectedStyle = undefined;

    /**
     * The style applied to the selected city object.
     *
     * @type {CityObjectStyle | string}
     */
    this.defaultSelectionStyle = { materialProps: { color: 0x13ddef } };

    /**
     * The initial SPARQL query to display upon window initialization.
     *
     * @type {Graph}
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
    this.registerEvent(SparqlQueryWindow.EVENT_FILTERS_UPDATED);
    this.registerEvent(SparqlQueryWindow.EVENT_LAYER_CHANGED);
    this.registerEvent(SparqlQueryWindow.EVENT_CITY_OBJECT_SELECTED);
    this.registerEvent(SparqlQueryWindow.EVENT_CITY_OBJECT_UNSELECTED);
    this.registerEvent(SparqlQueryWindow.EVENT_CITY_OBJECT_CHANGED);
  }

  /**
   * Override the windowCreated function. Sets the SparqlEndpointResponseProvider
   * and graph view. Should be called by `SparqlModuleView`. Once this is done,
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
      (data) => this.updateDataView(data, undefined)
    );
    this.addEventListener(SparqlQueryWindow.EVENT_NODE_SELECTED, (id) =>
      this.selectCityObject(id)
    );
  }

  /**
   * Select a city object based on a URI.
   * @param {string} uri the URI to search by.
   */
  selectCityObject(uri) {
    let tokenizedURI = this.provider.tokenizeURI(uri);
    let cityObject = this.layerManager.pickCityObjectByBatchTable(
      'gml_id',
      tokenizedURI.id
    );
    if (cityObject) {
      if (this.selectedCityObject != cityObject) {
        if (this.selectedCityObject) {
          this.sendEvent(
            SparqlQueryWindow.EVENT_CITY_OBJECT_CHANGED,
            cityObject
          );
          this.unselectCityObject();
        } else {
          this.sendEvent(
            SparqlQueryWindow.EVENT_CITY_OBJECT_SELECTED,
            cityObject
          );
        }
        this.selectedCityObject = cityObject;
        this.selectedTilesManager = this.layerManager.getTilesManagerByLayerID(
          this.selectedCityObject.tile.layer.id
        );
        this.selectedStyle =
          this.selectedTilesManager.styleManager.getStyleIdentifierAppliedTo(
            this.selectedCityObject.cityObjectId
          );
        this.selectedTilesManager.setStyle(
          this.selectedCityObject.cityObjectId,
          'selected'
        );
        this.selectedTilesManager.applyStyles({
          updateFunction: this.selectedTilesManager.view.notifyChange.bind(
            this.selectedTilesManager.view
          ),
        });
        this.removeLayer();
      }
    }
  }

  /**
   * Unset the selected city object and sends an `EVENT_CITY_OBJECT_SELECTED`
   * event.
   * @param {boolean} sendEvent if true, send SparqlQueryWindow.EVENT_CITY_OBJECT_UNSELECTED upon
   */
  unselectCityObject(sendEvent = true) {
    if (this.selectedCityObject) {
      this.selectedTilesManager.setStyle(
        this.selectedCityObject.cityObjectId,
        this.selectedStyle
      );
      this.selectedTilesManager.applyStyles();
    }
    if (sendEvent)
      this.sendEvent(
        SparqlQueryWindow.EVENT_CITY_OBJECT_UNSELECTED,
        this.selectedCityObject
      );
    this.selectedTilesManager = undefined;
    this.selectedStyle = undefined;
    this.selectedCityObject = undefined;
  }

  /**
   * Unsets the current layer. Sends the `EVENT_LAYER_CHANGED` event.
   */
  removeLayer() {
    this.cityObjectLayer = undefined;
    this.sendEvent(SparqlQueryWindow.EVENT_LAYER_CHANGED, undefined);
    this.applyStyles();
  }

  /**
   * Updates the tiles manager so that it has the correct styles associated with
   * the right city objects.
   *
   * @private
   */
  _updateTilesManager() {
    if (this.selectedCityObject) {
      let tileManager = this.layerManager.getTilesManagerByLayerID(this.selectedCityObject.tile.layer.id);

      if (this.cityObjectLayer === undefined) {
        this.layerCityObjectIds = [];
      } else {
        this.layerCityObjectIds = tileManager
          .findAllCityObjects(this.cityObjectLayer.filter.accepts)
          .map((co) => co.cityObjectId);

        tileManager.setStyle(
          this.layerCityObjectIds,
          this.cityObjectLayer.style
        );
      }

      tileManager.setStyle(
        this.selectedCityObject.cityObjectId,
        this.defaultSelectionStyle
      );
    }
  }

  /**
   * Apply the styles to the tiles manager. This function is necessary as the
   * event for tile loading does not exist yet. In the future, it shouldn't be
   * necessary to manually call this function.
   */
  applyStyles() {
    this._updateTilesManager();
    this.layerManager.applyAll3DTilesStyles();
  }

  /**
   * Update the window.
   * @param {Object} data SPARQL query response data.
   * @param {Object} viewType The selected semantic data view type.
   */
  updateDataView(data, viewType) {
    this.graph.update(data);
    this.dataView.style['visibility'] = 'visible';
    this.dataView.append(this.graph.data);
  }

  // SPARQL Window getters //
  get innerContentHtml() {
    return /*html*/ `
      <form id=${this.formId}>
        <label for="${this.queryTextAreaId}">Query:</label></br>
        <textarea id="${this.queryTextAreaId}" rows="10">${this.default_query}</textarea></br>
        <input id="${this.queryButtonId}" type="submit" value="Send"/>
      </form>
      <label>Results Format:</label>
      <select id="${this.resultSelectId}">
        <option value="graph">Graph</option>
        <option value="table">Table</option>
        <option value="json">JSON</option>
        <option value="timeline">Timeline</option>
      </select>
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

  static get EVENT_NODE_SELECTED() {
    return 'EVENT_NODE_SELECTED';
  }

  static get EVENT_FILTERS_UPDATED() {
    return 'EVENT_FILTERS_UPDATED';
  }

  static get EVENT_LAYER_CHANGED() {
    return 'EVENT_LAYER_CHANGED';
  }

  static get EVENT_CITY_OBJECT_SELECTED() {
    return 'EVENT_CITY_OBJECT_SELECTED';
  }

  static get EVENT_CITY_OBJECT_UNSELECTED() {
    return 'EVENT_CITY_OBJECT_UNSELECTED';
  }

  static get EVENT_CITY_OBJECT_CHANGED() {
    return 'EVENT_CITY_OBJECT_CHANGED';
  }
}
