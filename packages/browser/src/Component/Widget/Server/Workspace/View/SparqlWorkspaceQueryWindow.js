import { SparqlEndpointResponseProvider } from '../../SPARQL/Service/SparqlEndpointResponseProvider';
import { D3GraphCanvas } from '../../SPARQL/View/D3GraphCanvas';
import { getUriLocalname } from '../../SPARQL/Model/URI';
import { LayerManager } from '../../../../Itowns/LayerManager/LayerManager';
import { CityObjectProvider } from '../../../CityObjects/ViewModel/CityObjectProvider';
import { TemporalProvider } from '../../../Temporal/ViewModel/TemporalProvider';
import { SparqlQueryWindow } from '../../SPARQL/View/SparqlQueryWindow';
import { D3WorkspaceCanvas } from './D3WorkspaceCanvas';

/**
 * The SPARQL query window class which provides the user interface for querying
 * a SPARQL endpoint and displaying the endpoint response.
 */
export class SparqlWorkspaceQueryWindow extends SparqlQueryWindow {
  /**
   * Creates a SPARQL query window.
   *
   * @param {SparqlEndpointResponseProvider} sparqlProvider The SPARQL Endpoint Response Provider
   * @param {CityObjectProvider} cityObjectProvider The City Object Provider
   * @param {Array<TemporalProvider>} temporalProviders The Temporal Providers associated with each potential scenario
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
    temporalProviders,
    layerManager,
    configSparqlWidget
  ) {
    super(
      sparqlProvider,
      cityObjectProvider,
      temporalProviders,
      layerManager,
      configSparqlWidget
    );
    /**
     * Contains the D3 graph view to display Workspace RDF data.
     *
     * @type {D3WorkspaceCanvas}
     */
    this.d3Graph = new D3WorkspaceCanvas(this, configSparqlWidget);
  }

  /**
   * Override the windowCreated function. Sets the SparqlEndpointResponseProvider
   * and graph view. Also updates this.queries with the queries declared in the configuration file
   * Should be called by a `SparqlWorkspaceQueryView`. Once this is done,
   * the window is actually usable ; service event listerers are set here.
   */
  windowCreated() {
    super.windowCreated();
    this.addEventListener(D3GraphCanvas.EVENT_NODE_CLICKED, (index) => {
      const nodeData = this.d3Graph.data.getNodeByIndex(index);
      const nodeType = getUriLocalname(nodeData.type);
      if (nodeType == 'Version' || nodeType == 'VersionTransition') {
        /* find the first scenario that contains the clicked node,
         * find the temporal the geometry layer with the same name, and
         * set the current time to the averaged timestamps linked to the node
         */
        const scenarioLayer = this.d3Graph.data.getScenarioLayerByIndex(
          index,
          this.layerManager
        );
        const scenarioTemporalProvider = this.temporalProviders.find(
          (provider) => {
            return provider.tilesManager.layer == scenarioLayer;
          }
        );
        console.debug(`found a scenarioLayer and a matching temporalProvider`);
        console.debug(scenarioLayer);
        console.debug(scenarioTemporalProvider);

        // if a layer is found, make sure it is visible and hide all other layers
        if (scenarioLayer) {
          this.layerManager.changeVisibility(false)
          scenarioLayer.visible = true;
          this.layerManager.notifyChange();
          
          const timestamps =
            this.d3Graph.data.getBitemporalTimestampsByIndex(index);
          const timestampAverage =
            (timestamps.validTo - timestamps.validFrom) / 2 +
            timestamps.validFrom;
          console.debug(`timestamp average: ${timestampAverage}`);
          scenarioTemporalProvider.currentTime = parseInt(timestampAverage);
          scenarioTemporalProvider.changeVisibleTilesStates();
        }

      }
    });
  }
}
