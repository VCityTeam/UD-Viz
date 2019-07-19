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

    documentModule.addFilteredDocumentsCommand('Documents in validation', () => {
      if (!this.oldSource) {
        console.log('show documents in validation');
        this.oldSource = documentModule.provider.fetcher.source;
        documentModule.provider.fetcher.authenticate = true;
        documentModule.provider.fetcher.setSource(this.validationSource);
        documentModule.view.browserWindow.addDocumentCommand('Validate', (doc) => {
          if (!confirm('Are you sure do validate this document ? ' +
            'This operation is irreversible.')) {
            return;
          }
          this.validationService.validate(doc).catch((reason) => {
            alert(reason.statusText);
          }).then(() => {
            documentModule.provider.refreshDocumentList();
          });
        });
      } else {
        console.log('hide documents in validation');
        documentModule.provider.fetcher.authenticate = false;
        documentModule.provider.fetcher.setSource(this.oldSource);
        this.oldSource = undefined;
        documentModule.view.browserWindow.removeDocumentCommand('Validate');
      }

      documentModule.provider.refreshDocumentList().catch((reason) => {
        alert(reason);
        documentModule.provider.fetcher.authenticate = false;
        documentModule.provider.fetcher.setSource(this.oldSource);
        this.oldSource = undefined;
        documentModule.view.browserWindow.removeDocumentCommand('Validate');
      });
    });
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