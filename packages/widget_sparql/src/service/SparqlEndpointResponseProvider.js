/**
 * Creates a SPARQL Endpoint Provider which manages treating SPARQL endpoint
 * responses and events for a specific SPARQL Endpoint. Also contains helper
 * functions for manipulating RDF data.
 */
export class SparqlEndpointResponseProvider {
  /**
   * Creates a SPARQL Endpoint Provider
   *
   * @param {object} configSparqlServer The sparqlModule configuration.
   * @param {string} configSparqlServer.url The SPARQL server url.
   * @param {string} configSparqlServer.url_parameters The SPARQL endpoint url parameters.
   * @param {object} configSparqlServer.options The default options to be sent in a fetch request header.
   */
  constructor(configSparqlServer) {
    if (
      !configSparqlServer ||
      !configSparqlServer.url ||
      !configSparqlServer.options
    ) {
      console.error(
        `The given "configSparqlServer" configuration is incorrect: ${configSparqlServer}`
      );
    }

    this.url = configSparqlServer.url;
    this.url_parameters = configSparqlServer.url_parameters;
    this.default_options = configSparqlServer.options;
  }

  /**
   * Perform a SPARQL Query. Cache and return the response
   *
   * @async
   * @param {string} query The query to be sent to the SPARQL endpoint.
   * @param {object} options optional fetch options
   * @returns {Promise<object>|null} If the request is not successful, it throws an error. If successful, it returns the request.
   */
  async querySparqlEndpointService(query, options = this.default_options) {
    const full_url = this.getFullUrl(query);

    try {
      const request = await this.getFetch(full_url, query, options);
      if (!request.ok) {
        throw new Error('SPARQL Endpoint response was not OK');
      }
      const response = request.json();
      return response;
    } catch (error) {
      console.error(`Could not query SPARQL endpoint: ${error}`);
    }

    return null;
  }

  /**
   * Get the full URL for the SPARQL endpoint in function of the SPARQL endpoint query type.
   *
   * @param {string} query The query to be sent to the SPARQL endpoint.
   * @returns {string} the full URL for the SPARQL endpoint.
   */
  getFullUrl(query) {
    if (
      this.default_options.query === undefined ||
      this.default_options.query === 'parameters'
    ) {
      return this.url + this.url_parameters + encodeURIComponent(query);
    }

    return this.url;
  }

  /**
   * Get the fetch request in function of the SPARQL endpoint query type.
   *
   * @param {string} full_url The full URL for the SPARQL endpoint.
   * @param {string} query The query content to be sent to the SPARQL endpoint.
   * @param {object} options optional fetch options.
   * @returns {Promise<Response>} The fetch request.
   */
  getFetch(full_url, query, options) {
    if (
      this.default_options.query === undefined ||
      this.default_options.query === 'parameters'
    ) {
      return fetch(full_url, options);
    }

    const myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/sparql-query');
    myHeaders.append('Accept', 'application/sparql-results+json');

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: query,
    };

    return fetch(full_url, requestOptions);
  }
}
