import { RequestService } from '../../../../../RequestService';
import { Document } from '../../Core/Model/Document';

/**
 * This class is responsible for the validation requests.
 */
export class ValidationService {
  /**
   * Constructs a validation service.
   *
   * @param {RequestService} requestService The request service.
   * @param {object} configServer The configuration for the server.
   * @param {string} configServer.url The base URL of the server.
   * @param {string} configServer.validate The route to validating documents.
   */
  constructor(requestService, configServer) {
    this.requestService = requestService;
    this.validateUrl = `${configServer.url}${configServer.validate}`;
  }

  /**
   * Sends the request to validate the document.
   *
   * @param {Document} doc The document to validate.
   */
  async validate(doc) {
    const formData = new FormData();
    formData.append('id', doc.id);
    // eslint-disable-next-line no-unused-vars
    const response = await this.requestService.request(
      'POST',
      this.validateUrl,
      {
        body: formData,
      }
    );
  }
}
