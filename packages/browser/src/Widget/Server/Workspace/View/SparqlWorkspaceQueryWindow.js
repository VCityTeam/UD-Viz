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
    this.d3Graph = new D3WorkspaceCanvas(configSparqlWidget);

    /** @type {Map<string,Temporal3DTilesLayerWrapper>} */
    this.temporalWrappers = new Map();
    itownsView
      .getLayers()
      .filter((el) => el.isC3DTilesLayer)
      .forEach((layer) => {
        if (
          layer.registeredExtensions.isExtensionRegistered('3DTILES_temporal')
        ) {
          this.temporalWrappers.set(
            layer.id,
            new Temporal3DTilesLayerWrapper(layer)
          );
        }
      });
  }
}
