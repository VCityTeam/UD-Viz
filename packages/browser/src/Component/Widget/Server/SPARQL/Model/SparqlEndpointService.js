import { RequestService } from '../../Component/RequestService';

/**
 * The SPARQL Endpoint Service which contains connection information and functions
 * for fetching data from a specific SPARQL Endpoint.
 */
export class SparqlEndpointService extends RequestService {
  /**
   * Creates a SPARQLEndpointService object for communicating with a SPARQL Endpoint
   * based on a given configuration
   *
   * @param {object} configSparql The sparqlModule configuration.
   * @param {string} configSparql.url The SPARQL endpoint url.
   * @param {string} configSparql.url_parameters The SPARQL endpoint url parameters.
   */
  constructor(configSparql) {
    super();

    if (!!configSparql && !!configSparql.url && !!configSparql.url_parameters) {
      // Wget "http://localhost:9999/strabon/Query?handle=download&query=%0ASELECT+*%0AWHERE+%7B+%0A%09%3Fs+%3Fp+%3Fo%09%0A%7D%0A&format=SPARQL/JSON&view=HTML"
      this.url = configSparql.url;
      this.url_parameters = configSparql.url_parameters;
    } else {
      throw 'The given "sparqlModule" configuration is incorrect.';
    }
  }

  /**
   * Perform a SPARQL Query. Cache and return the response
   *
   * @async
   * @param {string} query The query to be sent to the SPARQL endpoint.
   * @returns {Promise<object>}
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
