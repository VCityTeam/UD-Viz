export class ValidationService {
  constructor(requestService, config) {
    this.requestService = requestService;
    this.validateUrl = `${config.server.url}${config.server.validate}`;
  }

  async validate(doc) {
    let formData = new FormData();
    formData.append('id', doc.id);
    let response = await this.requestService.request('POST', this.validateUrl, {
      body: formData
    });
  };
}