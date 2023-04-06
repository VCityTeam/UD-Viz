import { RequestService } from '../../../../RequestService';

/**
 * The SPARQL Endpoint Service which contains connection information and functions
 * for fetching data from a specific SPARQL Endpoint.
 */
export class SparqlEndpointService extends RequestService {
  /**
   * Creates a SPARQLEndpointService object for communicating with a SPARQL Endpoint
   * based on a given configuration
   *
   * @param {object} configSparqlServer The sparqlModule configuration.
   * @param {string} configSparqlServer.url The SPARQL server url.
   * @param {string} configSparqlServer.url_parameters The SPARQL endpoint url parameters.
   */
  constructor(configSparqlServer) {
    super();

    if (
      !configSparqlServer ||
      !configSparqlServer.url ||
      !configSparqlServer.url_parameters
    ) {
      console.log(configSparqlServer);
      throw 'The given "configSparqlServer" configuration is incorrect.';
    }
    // wget "http://localhost:9999/strabon/Query?handle=download&query=%0ASELECT+*%0AWHERE+%7B+%0A%09%3Fs+%3Fp+%3Fo%09%0A%7D%0A&format=SPARQL/JSON&view=HTML"
    this.url = configSparqlServer.url;
    this.url_parameters = configSparqlServer.url_parameters;
  }

  /**
   * Perform a SPARQL Query. Cache and return the response
   *
   * @async
   * @param {string} query The query to be sent to the SPARQL endpoint.
   * @returns {Promise<object>} If the request is not successful, it throws an error. If successful, it returns the request.
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
