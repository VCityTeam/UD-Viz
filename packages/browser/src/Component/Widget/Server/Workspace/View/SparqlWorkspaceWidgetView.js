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
   * @param {Array<TemporalProvider>} temporalProviders The Temporal Providers associated with each potential scenario
   * @param {LayerManager} layerManager The UD-Viz LayerManager.
   * @param {object} configSparqlWidget The sparqlModule view configuration.
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
     * Contains a SparqlWorkspaceQueryWindow for capturing user input and displaying
     * query results.
     *
     * @type {SparqlWorkspaceQueryWindow}
     */
    this.window = new SparqlWorkspaceQueryWindow(
      sparqlProvider,
      cityObjectProvider,
      temporalProviders,
      layerManager,
      configSparqlWidget
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
