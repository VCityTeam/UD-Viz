export class GeocodingService {
  constructor(requestService) {
    this.requestService = requestService;
  }

  /**
   * Retrieves the coordinates based on the search string parameter.
   * 
   * @param {String} searchString Either an address or the name of a place.
   */
  getCoordinates(searchString) {
    return {
      lat: 45.756730,
      long: 4.831850
    };
  }
}