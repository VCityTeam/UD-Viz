import { imageToBase64 } from '../../../Utils/DataProcessing/DataProcessing';

export function DocToValidateService(requestService, config) {

    this.requestService = requestService;

    this.documentToValidateUrl = `${config.server.url}${config.server.documentToValidate}`;
    this.documentUrl = `${config.server.url}${config.server.document}`;
    this.validateUrl = `${config.server.url}${config.server.validate}`;
    this.authorUrl = `${config.server.url}${config.server.user}`;
    this.fileRoute = config.server.file;
    this.commentRoute = config.server.comment;

    //All documents represents all the document the user can potentially access
    // with its current permission (ie. its own submissions or all submissions
    // if it's an admin)
    this.allDocuments = [];
    //Filtered documents is the filtered version of all documents. To avoid
    // requesting the server each time the user want to filter its documents,
    // we store them in allDocuments and filter this locally stored data.
    this.filteredDocuments = [];
    this.currentDocumentId = 0;

    this.observers = [];

    this.initialize = function () {
        console.log('Doc To Validate Service initialized.');
    };

    this.getDocumentsToValidate = async function () {
        //request to fetch docs
        let response = (await this.requestService.send('GET', this.documentToValidateUrl)).response;
        let docs = JSON.parse(response);
        this.allDocuments = [];
        for (let doc of docs) {
            doc.imgUrl = `${this.documentUrl}/${doc.id}/${this.fileRoute}`;
            this.allDocuments.push(doc);
        }
        this.filteredDocuments = this.allDocuments;
        this.currentDocumentId = 0;
        this.notifyObservers();
    }

    this.search = async function (filterFormData) {
        this.filteredDocuments = this.allDocuments;

        // Get values from the fields of the search form
        // A filter is an object with three properties : {
        //    text: the content of the field in the form = the filter value
        //    type: the method of comparison (can be 'includes', 'greater', 'smaller', 'equals')
        //    property: the name of the metadata field that will be compared to the filter value
        // }
        let filters = [];
        filters.push({ text: filterFormData.get("keyword"), type: 'includes', property: 'title' });
        filters.push({ text: filterFormData.get("startReferringDate"), type: 'greater', property: 'refDate' });
        filters.push({ text: filterFormData.get("endReferringDate"), type: 'smaller', property: 'refDate' });
        filters.push({ text: filterFormData.get("startPublicationDate"), type: 'greater', property: 'publicationDate' });
        filters.push({ text: filterFormData.get("endPublicationDate"), type: 'smaller', property: 'publicationDate' });
        filters.push({ text: filterFormData.get("subject"), type: 'equals', property: 'subject' });

        // Filters the fetched documents according to the fields of the
        // search form
        const filtered = this.filteredDocuments.filter((document) => {
            for (let filter of filters) {
                if (filter.text !== undefined && filter.text !== null && filter.text !== '') {
                    let documentProp = document.metaData[filter.property];
                    if (filter.type === 'includes'
                            && (typeof(documentProp) !== 'string'
                            || !documentProp.toLowerCase()
                                .includes(filter.text.toLowerCase())) ||
                        filter.type === 'greater'
                            && !(documentProp >= filter.text) ||
                        filter.type === 'smaller'  
                            && !(documentProp <= filter.text) ||
                        filter.type === 'equals'   
                            && !(documentProp == filter.text)) {
                        return false;
                    }
                }
            }
            return true;
        });

        this.filteredDocuments = filtered;
        this.currentDocumentId = 0;
        this.notifyObservers();
    };

    this.getComments = async function () {
        let currentDocument = this.currentDocument();
        if (currentDocument !== null && currentDocument !== undefined) {
            let url = this.documentUrl + "/" + currentDocument.id + "/" + this.commentRoute;
            let response = (await this.requestService.send('GET', url)).response;
            let jsonResponse = JSON.parse(response);
            for (let element of jsonResponse) {
                var url = this.authorUrl + "/" + element.user_id;
                let responseAuthor = (await this.requestService.send('GET', url)).response;
                element.author = JSON.parse(responseAuthor);
            }
            return jsonResponse;
        }
        return [];
    };

    this.publishComment = async function (form_data) {
        let currentDocument = this.currentDocument();
        if (currentDocument !== null && currentDocument !== undefined) {
            let url = this.documentUrl + "/" + currentDocument.id + "/" + this.commentRoute;
            let response = (await this.requestService.send('POST', url, form_data)).response;
        }
    };

    this.getAuthor = async () => {
        if (this.getDocumentsCount() > 0) {
            var idAuthor = this.currentDocument().user_id;
            var url = this.authorUrl + "/" + idAuthor;
            let response = (await this.requestService.send('GET', url)).response;
            let author = JSON.parse(response);
            return author;
        } else {
            throw 'No current document';
        }
    };

    this.getImageData = async () => {
        let currentDocument = this.currentDocument();
        if (!!currentDocument) {
            let req = await this.requestService.request('GET',
                        currentDocument.imgUrl, {responseType: 'arraybuffer'});
            if (req.status >= 200 && req.status < 300) {
                return imageToBase64(req.response,
                                     req.getResponseHeader('Content-Type'));
            }
            throw 'Could not get the file';
        }
        throw 'No document is loaded';
    }

    this.update = async function (formData) {
        let response = (await this.requestService.send('PUT', `${this.documentUrl}/${this.currentDocument().id}`, formData)).response;
        this.getDocumentsToValidate();
        return response;
    };

    this.delete = async function () {
        //request to delete
        let response = await this.requestService.send('DELETE', `${this.documentUrl}/${this.currentDocument().id}`)
        //refetch documents
        this.getDocumentsToValidate();
    };

    this.validate = async function () {
        let formData = new FormData();
        formData.append('id', this.currentDocument().id);
        let response = await this.requestService.send('POST', this.validateUrl, formData);
        this.getDocumentsToValidate();
    };

    this.clearSearch = function () {
        this.getDocumentsToValidate();
    };

    // Observers

    this.addObserver = function (observerFunction) {
        this.observers.push(observerFunction);
    };

    this.notifyObservers = function () {
        for (let observer of this.observers) {
            observer();
        }
    };

    // Fetched documents management

    this.getDocuments = function () {
        return this.filteredDocuments;
    };

    this.getDocumentsCount = function () {
        return this.filteredDocuments.length;
    };

    this.currentDocument = function () {
        return this.filteredDocuments[this.currentDocumentId];
    };

    this.getCurrentDocumentId = function () {
        return this.currentDocumentId;
    };

    this.nextDocument = function () {
        this.currentDocumentId = (this.currentDocumentId + 1) % this.filteredDocuments.length;
        this.notifyObservers();
        return this.currentDocument();
    };

    this.prevDocument = function () {
        this.currentDocumentId = (this.filteredDocuments.length + this.currentDocumentId - 1) % this.filteredDocuments.length;
        this.notifyObservers();
        return this.currentDocument();
    };

    this.initialize();
}
