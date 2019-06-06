import { RequestService } from "../../../Utils/Request/RequestService";

export class GeocodingService {
  /**
   * 
   * @param {RequestService} requestService 
   * @param {*} config 
   */
  constructor(requestService, extent, config) {
    this.requestService = requestService;
    this.extent = extent.as('EPSG:4326');
    this.geocodingUrl = config.geocoding.url;
    this.parameters = config.geocoding.parameters;
  }

  /**
   * Retrieves the coordinates based on the search string parameter.
   * 
   * @param {String} searchString Either an address or the name of a place.
   */
  async getCoordinates(searchString) {
    //URL parameters
    const queryString = encodeURIComponent(searchString);
    const bounds = `${this.extent.west()},${this.extent.south()}|${this.extent.east()},${this.extent.north()}`;

    //build the URL according to parameter description (in config file)
    let url = this.geocodingUrl + '?';
    for (let [paramName, param] of Object.entries(this.parameters)) {
      if (param.fill === "value") {
        url += `${paramName}=${param.value}&`;
      } else if (param.fill === "query") {
        url += `${paramName}=${queryString}&`;
      } else if (param.fill === "extent") {
        url += `${paramName}=${bounds}&`;
      }
    }

    //make the request
    const req = await this.requestService.request('GET', url);
    const response = JSON.parse(req.response);
    const results = response.results
      .map(res => res.geometry.location);
    if (results.length > 0) {
      return results;
    } else {
      throw 'No result found';
    }
  }
}