export function DocToValidateService(requestService, config) {

    this.requestService = requestService;

    this.documentToValidateUrl = `${config.server.url}${config.server.documentToValidate}`;
    this.documentUrl = `${config.server.url}${config.server.document}`;
    this.validateUrl = `${config.server.url}${config.server.validate}`;
    this.authorUrl = `${config.server.url}${config.server.user}`
    this.fileRoute = config.server.file;
    this.commentRoute = config.server.comment;

    this.documents = [];
    this.currentDocumentId = 0;
    this.prevFilters;

    this.observers = [];

    this.initialize = function () {
        console.log('Doc To Validate Service initialized.');
    }

    this.search = async function (filterFormData) {
        //request to fetch docs
        let response = (await this.requestService.send('GET', this.documentToValidateUrl)).response;
        let docs = JSON.parse(response);
        this.documents = [];
        for (let doc of docs) {
            doc.imgUrl = `${this.documentUrl}/${doc.id}/${this.fileRoute}`;
            this.documents.push(doc);
        }

        this.prevFilters = filterFormData;

        //Code by mazine
        const keywordFilter = filterFormData.get("keyword");
        const startReferringDateFilter = filterFormData.get("startReferringDate");
        const endReferringDateFilter = filterFormData.get("endReferringDate");
        const startPublicationDateFilter = filterFormData.get("startPublicationDate");
        const endPublicationDateFilter = filterFormData.get("endPublicationDate");
        const subjectFiler = filterFormData.get("subject");

        const result = this.documents.filter(document => (keywordFilter === undefined || keywordFilter === null || keywordFilter === '' ||document.metaData.title.includes(keywordFilter)) &&
        (startReferringDateFilter === undefined || startReferringDateFilter === null || startReferringDateFilter === '' || document.metaData.referringDate > startReferringDateFilter) &&
        (endReferringDateFilter === undefined || endReferringDateFilter === null || endReferringDateFilter === '' || document.metaData.refDate < endReferringDateFilter) &&
        (startPublicationDateFilter === undefined || startPublicationDateFilter === null ||startPublicationDateFilter === '' ||  document.metaData.publicationDate > startPublicationDateFilter) &&
        (endPublicationDateFilter === undefined || endPublicationDateFilter === null || endPublicationDateFilter === '' || document.metaData.publicationDate < endPublicationDateFilter) &&
        (subjectFiler === undefined || subjectFiler === null || subjectFiler === '' || document.metaData.subject === subjectFiler)
        );

        this.documents = result;
        this.currentDocumentId = 0;
        this.notifyObservers();
    }

    this.getComments = async function () {
        let currentDocument = this.currentDocument();
        if(currentDocument !== null && currentDocument !== undefined)
        {
          let url = this.documentUrl+"/"+currentDocument.id+"/"+this.commentRoute;
          let response = (await this.requestService.send('GET',url)).response;
          let jsonResponse = JSON.parse(response);
          for(let element of jsonResponse){
            var url= this.authorUrl+"/"+element.user_id;
            let responseAuthor = (await this.requestService.send('GET',url)).response;
            element.author = JSON.parse(responseAuthor);
          }
          return jsonResponse;
        }
        return [];
    }

    this.publishComment = async function (form_data) {
      let currentDocument = this.currentDocument();
      if(currentDocument !== null && currentDocument !== undefined)
      {
        let url = this.documentUrl+"/"+currentDocument.id+"/"+this.commentRoute;
        let response = (await this.requestService.send('POST',url,form_data)).response;
      }
    }

    this.getAuthor = async () => {
        if (this.getDocumentsCount() > 0) {
            var idAuthor=this.currentDocument().user_id;
            var url= this.authorUrl+"/"+idAuthor;
            let response = (await this.requestService.send('GET',url)).response;
            let author = JSON.parse(response);
            return author;
        } else {
            throw 'No current document';
        }
    }
    this.delete = async function() {
        //request to delete
        let response = await this.requestService.send('DELETE', `${this.documentUrl}/${this.currentDocument().id}`)
        //refetch documents
        await this.search(this.prevFilters);
    }

    this.validate = async function() {
        let formData = new FormData();
        formData.append('id', this.currentDocument().id);
        let response = await this.requestService.send('POST', this.validateUrl, formData);
        await this.search(this.prevFilters);
    }

    this.clearSearch = function () {
        this.documents = [];
        this.currentDocumentId = 0;
        this.notifyObservers();
    }

    // Observers

    this.addObserver = function (observerFunction) {
        this.observers.push(observerFunction);
    }

    this.notifyObservers = function () {
        for (let observer of this.observers) {
            observer();
        }
    }

    // Fetched documents management

    this.getDocuments = function () {
        return this.documents;
    }

    this.getDocumentsCount = function () {
        return this.documents.length;
    }

    this.currentDocument = function () {
        return this.documents[this.currentDocumentId];
    }

    this.getCurrentDocumentId = function() {
        return this.currentDocumentId;
    }

    this.nextDocument = function () {
        this.currentDocumentId = (this.currentDocumentId + 1) % this.documents.length;
        this.notifyObservers();
        return this.currentDocument();
    }

    this.prevDocument = function () {
        this.currentDocumentId = (this.documents.length + this.currentDocumentId - 1) % this.documents.length;
        this.notifyObservers();
        return this.currentDocument();
    }

    this.initialize();
};
