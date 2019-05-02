export function DocToValidateService(requestService, config) {

    this.requestService = requestService;

    this.documents = [];
    this.currentDocumentId = 0;

    this.initialize = function () {
        console.log('Doc To Validate Service initialized.');
    }

    this.search = function (filterFormData) {
        //request to fetch docs
        this.documents = [
            {
                id: '1',
                title: 'Title 1',
                subject: 'Subject 1',
                description: 'Description 1',
                type: 'type 1',
                referringDate: '1930-01-01',
                publicationDate: '2018-07-11',
                imgUrl: '../services/pikachu.png'
            },
            {
                id: '2',
                title: 'Title 2',
                subject: 'Subject 2',
                description: 'Description 2',
                type: 'Type 2',
                referringDate: '1930-01-01',
                publicationDate: '2018-07-11',
                imgUrl: '../services/sonic.jpg'
            }
        ];
        this.currentDocumentId = 0;
    }

    this.clearSearch = function () {
        this.documents = [];
        this.currentDocumentId = 0;
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
        console.log('hello : ' + this.currentDocumentId);
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