import { DocumentModule } from "../../Modules/Documents/DocumentModule";
import { DocumentSource } from "../../Modules/Documents/Model/DocumentFetcher";
import { ValidationService } from "./Service/ValidationService";

export class DocumentValidation {
  /**
   * 
   * @param {DocumentModule} documentModule The documents module. 
   */
  constructor(documentModule, requestService, config) {
    this.oldSource;

    this.validationService = new ValidationService(requestService, config);

    this.validationSource = new ValidationDocumentSource(config);

    documentModule.addDocumentsExtension('Validation State', {
      type: 'panel',
      html: () => `Currently seeing : ${!this.oldSource ? 'validated documents' : 'documents in validation'}`
    });

    documentModule.addDocumentsExtension('Toggle Validation', {
      type: 'button',
      html: () => this.oldSource ? 'See validated documents' : 'See documents in validation',
      callback: () => {
        if (!this.oldSource) {
          this.oldSource = documentModule.provider.fetcher.source;
          documentModule.provider.fetcher.authenticate = true;
          documentModule.provider.fetcher.setSource(this.validationSource);
          documentModule.addBrowserExtension('Validate', {
            type: 'button',
            html: () => 'Validate',
            callback: (doc) => {
              if (!confirm('Are you sure do validate this document ? ' +
                'This operation is irreversible.')) {
                return;
              }
              this.validationService.validate(doc).catch((reason) => {
                alert(reason.statusText);
              }).then(() => {
                documentModule.provider.refreshDocumentList();
              });
          }});
        } else {
          documentModule.provider.fetcher.authenticate = false;
          documentModule.provider.fetcher.setSource(this.oldSource);
          this.oldSource = undefined;
          documentModule.view.browserWindow.removeDocumentExtension('Validate');
        }

        documentModule.provider.refreshDocumentList().catch((reason) => {
          alert(reason);
          documentModule.provider.fetcher.authenticate = false;
          documentModule.provider.fetcher.setSource(this.oldSource);
          this.oldSource = undefined;
          documentModule.view.browserWindow.removeDocumentExtension('Validate');
        });
    }});
  }
}

class ValidationDocumentSource extends DocumentSource {
  constructor(config) {
    super();
    this.documentToValidateUrl = `${config.server.url}${config.server.documentToValidate}`;
    this.documentUrl = `${config.server.url}${config.server.document}`;
    this.fileRoute = config.server.file;
  }

  getDocumentUrl() {
    return this.documentToValidateUrl;
  }

  getImageUrl(doc) {
    return this.documentUrl + '/' + doc.id + '/' + this.fileRoute;
  }
}