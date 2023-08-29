import { SparqlEndpointResponseProvider } from '../../SPARQL/Service/SparqlEndpointResponseProvider';
import { getUriLocalname } from '../../SPARQL/Model/URI';
import { SparqlQueryWindow } from '../../SPARQL/View/SparqlQueryWindow';
import { D3WorkspaceCanvas } from './D3WorkspaceCanvas';
import * as itowns from 'itowns';
import { Temporal3DTilesLayerWrapper } from '../../../Temporal/Temporal';

/**
 * The SPARQL query window class which provides the user interface for querying
 * a SPARQL endpoint and displaying the endpoint response.
 */
export class SparqlWorkspaceQueryWindow extends SparqlQueryWindow {
  /**
   * Creates a SPARQL query window.
   *
   * @param {SparqlEndpointResponseProvider} sparqlProvider The SPARQL Endpoint Response Provider.
   * @param {itowns.PlanarView} itownsView itowns view
   * @param {object} configSparqlWidget The sparqlModule view configuration.
   * @param {object} configSparqlWidget.queries Query configurations
   * @param {object} configSparqlWidget.queries.title The query title
   * @param {object} configSparqlWidget.queries.filepath The path to the file which contains the query text
   * @param {object} configSparqlWidget.queries.formats Configuration for which visualizations are allowed
   *                                                    with this query. Should be an object of key, value
   *                                                    pairs. The keys of these pairs should correspond
   *                                                    with the cases in the updateDataView() function.
   */
  constructor(sparqlProvider, itownsView, configSparqlWidget) {
    super(sparqlProvider, itownsView, configSparqlWidget);
    /**
     * Contains the D3 graph view to display Workspace RDF data.
     *
     * @type {D3WorkspaceCanvas}
     */
    this.d3Graph = new D3WorkspaceCanvas(this, configSparqlWidget);

    /** @type {Map<string,Temporal3DTilesLayerWrapper>} */
    const temporalWrappers = new Map();
    itownsView
      .getLayers()
      .filter((el) => el.isC3DTilesLayer)
      .forEach((layer) => {
        if (
          layer.registeredExtensions.isExtensionRegistered('3DTILES_temporal')
        ) {
          temporalWrappers.set(
            layer.id,
            new Temporal3DTilesLayerWrapper(layer)
          );
        }
      });

    this.d3Graph.addEventListener('click', (event, datum) => {
      const nodeData = this.d3Graph.data.getNodeByIndex(datum.index);
      const nodeType = getUriLocalname(nodeData.type);
      if (nodeType == 'Version' || nodeType == 'VersionTransition') {
        /* find the first scenario that contains the clicked node,
         * find the temporal the geometry layer with the same name, and
         * set the current time to the averaged timestamps linked to the node
         */
        const scenarioLayer = this.d3Graph.data.getScenarioLayerByIndex(
          datum.index,
          this.itownsView
        );

        console.debug(scenarioLayer);

        // if a layer is found, make sure it is visible and hide all other layers
        if (scenarioLayer) {
          itownsView
            .getLayers()
            .filter((el) => el.isC3DTilesLayer)
            .forEach((layer) => (layer.visible = layer == scenarioLayer));

          // Calculate the average timestamp of the clicked node
          const timestamps = this.d3Graph.data.getBitemporalTimestampsByIndex(
            datum.index
          );
          const timestampAverage =
            (timestamps.validTo - timestamps.validFrom) / 2 +
            timestamps.validFrom;

          // set style temporal layer with the date
          temporalWrappers.get(scenarioLayer.id).update(timestampAverage);

          itownsView.notifyChange();
        }
      }
    });
  }
}
