import { RequestService } from "../../../Utils/Request/RequestService";

export class GeocodingService {
  /**
   * 
   * @param {RequestService} requestService 
   * @param {*} config 
   */
  constructor(requestService, config) {
    this.requestService = requestService;
    this.geocodingUrl = 'https://api.opencagedata.com/geocode/v1/json?key=fdef3b663bb243d19bffbe475c4dc230';
  }

  /**
   * Retrieves the coordinates based on the search string parameter.
   * 
   * @param {String} searchString Either an address or the name of a place.
   */
  async getCoordinates(searchString) {
    const queryString = encodeURIComponent(searchString);
    const url = `${this.geocodingUrl}&q=${queryString}`;
    const req = await this.requestService.request('GET', url);
    const response = JSON.parse(req.response);
    console.log(response);
    if (response.results.length > 0) {
      return response.results[0].geometry;
    } else {
      throw 'No result found';
    }
  }
}