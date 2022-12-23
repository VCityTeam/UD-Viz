import { RequestService } from '../../Component/RequestService';
import { Data } from '@ud-viz/core';

export class GeocodingService {
  /**
   * Instantiates the geocoding service.
   *
   * @param {RequestService} requestService The request service.
   * @param {*} extent The iTwons extent.
   * @param {*} configGeocoding
   */
  constructor(requestService, extent, configGeocoding) {
    this.requestService = requestService;
    this.extent = extent.as('EPSG:4326');
    this.geocodingUrl = configGeocoding.url;
    this.parameters = configGeocoding.parameters;
    this.basePath = configGeocoding.basePath;
    this.latPath = configGeocoding.result.lat;
    this.lngPath = configGeocoding.result.lng;
    this.credit = configGeocoding.credit;
    this.requestTimeIntervalMs = configGeocoding.requestTimeIntervalMs;
    this.canDoRequest = true;
  }

  /**
   * Retrieves the coordinates based on the search string parameter.
   *
   * @param {string} searchString Either an address or the name of a place.
   */
  async getCoordinates(searchString) {
    if (!!this.requestTimeIntervalMs && !this.canDoRequest) {
      throw 'Cannot perform a request for now.';
    }

    // URL parameters
    const queryString = encodeURIComponent(searchString);

    // Build the URL according to parameter description (in config file)
    let url = this.geocodingUrl + '?';
    for (const [paramName, param] of Object.entries(this.parameters)) {
      if (param.fill === 'value') {
        url += `${paramName}=${param.value}`;
      } else if (param.fill === 'query') {
        url += `${paramName}=${queryString}`;
      } else if (param.fill === 'extent') {
        url +=
          paramName +
          '=' +
          param.format
            .replace('SOUTH', this.extent.south)
            .replace('WEST', this.extent.west)
            .replace('NORTH', this.extent.north)
            .replace('EAST', this.extent.east);
      }
      url += '&';
    }

    // Make the request
    const req = await this.requestService.request('GET', url, {
      authenticate: false,
    });
    const response = JSON.parse(req.response);
    const results = (this.basePath ? response[this.basePath] : response).map(
      (res) => {
        return {
          lat: Number(Data.getAttributeByPath(res, this.latPath)),
          lng: Number(Data.getAttributeByPath(res, this.lngPath)),
        };
      }
    );

    if (this.requestTimeIntervalMs) {
      this.canDoRequest = false;
      setTimeout(() => {
        this.canDoRequest = true;
      }, Number(this.requestTimeIntervalMs));
    }

    if (results.length > 0) {
      return results;
    }
    throw 'No result found';
  }
}
