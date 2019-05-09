export class DocumentCommentsService {
    constructor (documentController, requestService, config) {
        this.documentCrontroller = documentController;
        this.requestService = requestService;
        this.documentUrl = `${config.server.url}${config.server.document}`;
        this.commentRoute = config.server.comment;
        this.authorUrl = `${config.server.url}${config.server.user}`;
    }

    async getComments() {
        let currentDocument = this.documentCrontroller.getCurrentDoc();
        if (currentDocument !== null && currentDocument !== undefined) {
            let url = this.documentUrl + "/" + currentDocument.id + "/" + this.commentRoute;
            let response = (await this.requestService.send('GET', url)).response;
            let jsonResponse = JSON.parse(response);
            for (let element of jsonResponse) {
                let url = this.authorUrl + "/" + element.user_id;
                let responseAuthor = (await this.requestService.send('GET', url)).response;
                element.author = JSON.parse(responseAuthor);
            }
            return jsonResponse;
        }
        return [];
    }

    async publishComment(formData) {
        let currentDocument = this.documentCrontroller.getCurrentDoc();
        if (currentDocument !== null && currentDocument !== undefined) {
            let url = this.documentUrl + "/" + currentDocument.id + "/" + this.commentRoute;
            let response = (await this.requestService.send('POST', url, formData)).response;
        }
    }
}