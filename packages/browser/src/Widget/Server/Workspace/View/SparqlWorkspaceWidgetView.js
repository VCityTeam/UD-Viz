import { SparqlEndpointResponseProvider, SparqlWidgetView } from '../../Server';
import { CityObjectProvider } from '../../../CityObjects/ViewModel/CityObjectProvider';
import { SparqlWorkspaceQueryWindow } from './SparqlWorkspaceQueryWindow';
import { LayerManager } from '../../../../Itowns/LayerManager/LayerManager';

/**
 * The SPARQL WidgetView class which manages the SPARQL query window.
 */
export class SparqlWorkspaceWidgetView extends SparqlWidgetView {
  /**
   * Creates a new SparqlWidgetView.
   *
   * @param {SparqlEndpointResponseProvider} sparqlProvider The SPARQL Endpoint Response Provider
   * @param {CityObjectProvider} cityObjectProvider The City Object Provider
   * @param {LayerManager} layerManager The UD-Viz LayerManager.
   * @param {object} configSparqlWidget The sparqlModule view configuration.
   * @param {Array<TemporalProvider>} temporalProviders The Temporal Providers associated with each potential scenario
   */
  constructor(
    sparqlProvider,
    cityObjectProvider,
    layerManager,
    configSparqlWidget,
    temporalProviders
  ) {
    super(sparqlProvider, cityObjectProvider, layerManager, configSparqlWidget);
    /**
     * Contains a SparqlWorkspaceQueryWindow for capturing user input and displaying
     * query results.
     *
     * @type {SparqlWorkspaceQueryWindow}
     */
    this.window = new SparqlWorkspaceQueryWindow(
      sparqlProvider,
      cityObjectProvider,
      layerManager,
      configSparqlWidget,
      temporalProviders
    );
  }

  /**
   * Display the view
   */
  enableView() {
    this.window.appendTo(this.parentElement);
  }

  /**
   *  Close the view
   */
  disableView() {
    this.window.dispose();
  }
}
