import { RequestService } from '../../../../Components/Request/RequestService';

/**
 * The SPARQL Endpoint Service which contains connection information and functions
 * for fetching data from a specific SPARQL Endpoint.
 */
export class SparqlEndpointService extends RequestService {
  /**
   * Creates a SPARQLEndpointService object for communicating with a SPARQL Endpoint
   * based on a given configuration
   *
   * @param {object} config The configuration of UD-Viz.
   * @param {object} config.sparqlModule The sparqlModule configuration.
   * @param {string} config.sparqlModule.url The SPARQL endpoint url.
   * @param {string} config.sparqlModule.url_parameters The SPARQL endpoint url parameters.
   */
  constructor(config) {
    super();

    if (
      !!config &&
      !!config.sparqlModule &&
      !!config.sparqlModule.url &&
      !!config.sparqlModule.url_parameters
    ) {
      // wget "http://localhost:9999/strabon/Query?handle=download&query=%0ASELECT+*%0AWHERE+%7B+%0A%09%3Fs+%3Fp+%3Fo%09%0A%7D%0A&format=SPARQL/JSON&view=HTML"
      this.url = config.sparqlModule.url;
      this.url_parameters = config.sparqlModule.url_parameters;
    } else {
      throw 'The given "sparqlModule" configuration is incorrect.';
    }
  }

  /**
   * Perform a SPARQL Query. Cache and return the response
   *
   * @async
   * @param {string} query The query to be sent to the SPARQL endpoint.
   * @return {Promise<Object>}
   */
  async querySparqlEndpoint(query) {

    const full_url = this.url + this.url_parameters + encodeURIComponent(query);
    const options = {};

    const request = await this.request('GET', full_url, options);

    if (request.status !== 200) {
      throw 'Could not query SPARQL endpoint: ' + request.statusText;
    }

    return request;
  }
}
