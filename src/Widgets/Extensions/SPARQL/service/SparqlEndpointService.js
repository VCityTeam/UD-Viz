import { RequestService } from "../../../../Components/Request/RequestService";

export class SparqlEndpointService extends RequestService {

    /**
     * Creates a SPARQL Endpoint Service which contains connection information for
     * a specific SPARQL Endpoint.
     *
     * @param {object} config The configuration of UD-Viz.
     * @param {object} config.sparqlModule The sparqlModule configuration.
     * @param {string} config.sparqlModule.url The SPARQL endpoint url.
     * @param {string} config.sparqlModule.url_parameters The SPARQL endpoint url parameters.
     */
    constructor(config) {
        super();

        this.url = config.sparqlModule.url;
        this.url_parameters = config.sparqlModule.url_parameters;
        // wget "http://localhost:9999/strabon/Query?handle=download&query=%0ASELECT+*%0AWHERE+%7B+%0A%09%3Fs+%3Fp+%3Fo%09%0A%7D%0A&format=SPARQL/JSON&view=HTML"
    }

    /**
     * Perform a SPARQL Query
     * 
     * @async
     * @param {string} query The query to be sent to the SPARQL endpoint.
     * @returns {Promise<Array<String>>}
     */
    async queryEndpointService(query) {
        let full_url = this.url + this.url_parameters + encodeURI(query);
        let options = {};
        
        let request = await this.request('GET', full_url, options);
        
        if (request.status !== 200) {
            throw 'Could not query SPARQL endpoint: ' + request.statusText;
        }
        
        let response = JSON.parse(request.responseText);
        console.log(query);
        console.log(response);

        return response;
    } 
}