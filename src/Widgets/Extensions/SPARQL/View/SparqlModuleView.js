import { ModuleView } from '../../../Components/ModuleView/ModuleView';
import { SparqlEndpointResponseProvider } from '../ViewModel/SparqlEndpointResponseProvider';
import { SparqlEndpointService } from '../Model/SparqlEndpointService';
import { SparqlQueryWindow } from './SparqlQueryWindow';
import { LayerManager } from '../../../Components/Components';
import { ExtendedCityObjectProvider } from '../ViewModel/ExtendedCityObjectProvider';

/**
 * The SPARQL ModuleView class which manages the SPARQL query window.
 */
export class SparqlModuleView extends ModuleView {
  /**
   * Creates a new SparqlModuleView.
   *
   * @param {SparqlEndpointResponseProvider} sparqlProvider The SPARQL Endpoint Response Provider
   * @param {ExtendedCityObjectProvider} cityObjectProvider The City Object Provider
   * @param {LayerManager} layerManager The UD-Viz LayerManager.
   */
  constructor(sparqlProvider, cityObjectProvider, layerManager) {
    super();

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
     * Contains a SparqlQueryWindow for capturing user input and displaying
     * query results.
     *
     * @type {SparqlQueryWindow}
     */
    this.window = new SparqlQueryWindow(this.sparqlProvider, this.cityObjectProvider, this.layerManager);
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
