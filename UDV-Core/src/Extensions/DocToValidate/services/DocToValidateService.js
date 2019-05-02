export function DocToValidateService(requestService, config) {

    this.requestService = requestService;

    this.documents = [];
    this.sampleDocuments = []; 
    this.currentDocumentId = 0;

    this.observers = [];

    this.initialize = function () {
        console.log('Doc To Validate Service initialized.');
        this.sampleDocuments = [
            {
                id: '1',
                title: 'Title 1',
                subject: 'Subject 1',
                description: 'Description 1',
                type: 'type 1',
                referringDate: '2017-01-01',
                publicationDate: '2018-07-11',
                imgUrl: '../services/pikachu.png'
            },
            {
                id: '2',
                title: 'Title 2',
                subject: 'Subject 2',
                description: 'Description 2',
                type: 'Type 2',
                referringDate: '2020-01-01',
                publicationDate: '2021-07-11',
                imgUrl: '../services/sonic.jpg'
            }
        ];
    }

    this.search = function (filterFormData) {
        //request to fetch docs
        this.documents = this.sampleDocuments;

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