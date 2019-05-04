export function DocToValidateService(requestService, config) {

    this.requestService = requestService;

    this.documentToValidateUrl = `${config.server.url}${config.server.documentToValidate}`;
    this.documentUrl = `${config.server.url}${config.server.document}`;
    this.validateUrl = `${config.server.url}${config.server.validate}`;
    this.fileRoute = config.server.file;

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
            let document = {
                id: doc.id,
                title: doc.metaData.title,
                subject: doc.metaData.subject,
                description: doc.metaData.description,
                type: doc.metaData.type,
                referringDate: doc.metaData.refDate,
                publicationDate: doc.metaData.publicationDate,
                imgUrl: `${this.documentUrl}/${doc.id}/${this.fileRoute}`
            };
            this.documents.push(document);
        }

        this.prevFilters = filterFormData;

        //Code by mazine
        const keywordFilter = filterFormData.get("keyword"); 
        const startReferringDateFilter = filterFormData.get("startReferringDate");
        const endReferringDateFilter = filterFormData.get("endReferringDate");
        const startPublicationDateFilter = filterFormData.get("startPublicationDate");
        const endPublicationDateFilter = filterFormData.get("endPublicationDate");
        
        const result = this.documents.filter(document => (keywordFilter === undefined || keywordFilter === null || keywordFilter === '' ||document.title.includes(keywordFilter)) &&
        (startReferringDateFilter === undefined || startReferringDateFilter === null || startReferringDateFilter === '' || document.referringDate > startReferringDateFilter) && 
        (endReferringDateFilter === undefined || endReferringDateFilter === null || endReferringDateFilter === '' || document.referringDate < endReferringDateFilter) &&
        (startPublicationDateFilter === undefined || startPublicationDateFilter === null ||startPublicationDateFilter === '' ||  document.publicationDate > startPublicationDateFilter) && 
        (endPublicationDateFilter === undefined || endPublicationDateFilter === null || endPublicationDateFilter === '' || document.publicationDate < endPublicationDateFilter) 
        );

        this.documents = result;
        this.currentDocumentId = 0; 
    }

    this.delete = async function() {
        //request to delete
        //let response = await this.requestService.send('DELETE', `${this.documentUrl}/${this.currentDocument().id}`)
        let response = await this.requestService.send('GET', `http://localhost:5000/deleteDocument/${this.currentDocument().id}`);
        //refetch documents
        await this.search(this.prevFilters);
    }

    this.validate = async function() {
        //let response = await this.requestService.send('POST', this.validateUrl);
        let response = await this.requestService.send('GET', `${this.validateUrl}/${this.currentDocument().id}`)
        console.log('validate');
        console.log(response);
        await this.search(this.prevFilters);
    }

    this.clearSearch = function () {
        this.documents = [];
        this.currentDocumentId = 0;
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
        return this.currentDocument();
    }

    this.prevDocument = function () {
        this.currentDocumentId = (this.documents.length + this.currentDocumentId - 1) % this.documents.length;
        return this.currentDocument();
    }

    this.initialize();
};