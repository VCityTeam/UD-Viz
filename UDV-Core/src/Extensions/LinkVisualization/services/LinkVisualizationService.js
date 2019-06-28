import { RequestService } from "../../../Utils/Request/RequestService";

export class LinkVisualizationService {
  /**
   * Creates a Link Visualization Service
   * 
   * @param {RequestService} requestService 
   * @param {any} config
   */
  constructor(requestService, config) {
    /**
     * Request service used to perform REST calls.
     */
    this.requestService = requestService;

    /**
     * GET url to retrieve supported link types.  
     * GET url/<type> to retrieve links of this type.  
     * POST url/<type> to create a link of this type.  
     */
    this.linkURL = `${config.server.url}${config.server.link}`;
  }

  /**
   * Return supported link types.
   * 
   * @returns {Promise<Array<string>>} An array containing the supported link
   * types.
   */
  async getSupportedLinkTypes() {
    let req = await this.requestService.request('GET', this.linkURL, {
      authenticate: false
    });
    let types = JSON.parse(req.response);
    return types;
  }

  /**
   * Retrieves all links matching the given link type and filters.
   * 
   * @param {string} linkType A supported link type.
   * @param {FormData} [filters] Filtering criteria for the link. Possible filters
   * are `source_id` (which must be a document id) and `target_id` (an ID of
   * type `linkType`).
   * 
   * @returns {Promise<Array<any>>} An array of links.
   */
  async getLinks(linkType, filters = null) {
    const url = `${this.linkURL}/${linkType}`;
    let req = await this.requestService.request('GET', url, {
      authenticate: false,
      body: filters
    });
    let links = JSON.parse(req.response);
    return links;
  }

  /**
   * Creates a new link with the given type.
   * 
   * @param {string} linkType A supported link type.
   * @param {FormData} formData Properties of the created link. It must include
   * `source_id` (the document id) and `target_id` (ID of the target of type
   * `linkType`)
   */
  async createLink(linkType, formData) {
    const url = `${this.linkURL}/${linkType}`;
    let req = await this.requestService.request('POST', url, {
      authenticate: false,
      body: formData
    });
    let created = JSON.parse(req.response);
    return created;
  }
}