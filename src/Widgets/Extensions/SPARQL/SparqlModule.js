import { SparqlEndpointService } from './service/SparqlEndpointService';
import { SparqlModuleView } from './view/SparqlModuleView';
import { SparqlQueryWindow } from './view/SparqlQueryWindow';

export class SparqlModule {
    /**
     * Creates a new SparqlModule.
     *
     * @param {object} config The configuration of UD-Viz.
     * @param {object} config.sparqlModule The sparqlModule configuration.
     * @param {string} config.sparqlModule.url The SPARQL endpoint url.
     */
    constructor(config) {

        this.config = config;

        /**
         * Contains connection information for the SPARQL endpoint service.
         *
         * @type {SparqlEndpointService}
         */
        this.service = new SparqlEndpointService(this.config);
        /**
         * Contains a SparqlQueryWindow for capturing user input.
         *
         * @type {SparqlQueryWindow}
         */
        this.view = new SparqlModuleView(this.service);
    }
}