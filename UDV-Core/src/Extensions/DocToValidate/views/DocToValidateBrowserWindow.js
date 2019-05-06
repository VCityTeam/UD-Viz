import { dragElement } from './Draggable';

export function DocToValidateBrowserWindow(docToValidateView, docToValidateService) {

    this.docToValidateService = docToValidateService;
    this.docToValidateView = docToValidateView;

    this.initialize = function () {
    }

    this.html = function () {
        return `
        <div id="docToValidate_Browser_header" class="docToValidate_Window_header">
            <h2>Document navigator</h2>
        </div>
        <div class="innerWindow">
            <h3 id="docToValidate_Browser_title">Title<h3>
            <h4>Description</h4>
            <p id="docToValidate_Browser_description"></p>
            <h4>Referring date</h4>
            <p id="docToValidate_Browser_referringDate"></p>
            <h4>Publication date</h4>
            <p id="docToValidate_Browser_publicationDate"></p>
            <h4>Type</h4>
            <p id="docToValidate_Browser_type"></p>
            <h4>Subject</h4>
            <p id="docToValidate_Browser_subject"></p>
            <img id="docToValidate_Browser_file"></img>
            <div id="docToValidate_Browser_navigation">
                <div id="docToValidate_Browser_currentDocument"></div>
                <button type="button" id="docToValidate_Browser_buttonPrev">⇦</button>
                <button type="button" id="docToValidate_Browser_buttonNext">⇨</button>
                <button type="button" id="docToValidate_Browser_buttonReset">Reset research</button>
                <button type="button" id="docToValidate_Browser_buttonOrient">Orient document</button>
                <button type="button" id="docToValidate_Browser_buttonDelete">Delete</button>
                <button type="button" id="docToValidate_Browser_buttonValidate">Validate</button>
            </div>
        </div>
        `;
    }

    this.appendToElement = function(htmlElement) {
        let div = document.createElement('div');
        div.innerHTML = this.html();
        div.id = "docToValidate_Browser";
        div.className = "docToValidate_Window";
        htmlElement.appendChild(div);
        document.getElementById('docToValidate_Browser_buttonPrev').onclick = this.prevDocument.bind(this);
        document.getElementById('docToValidate_Browser_buttonNext').onclick = this.nextDocument.bind(this);
        document.getElementById('docToValidate_Browser_buttonReset').onclick = this.resetResearch.bind(this);
        document.getElementById('docToValidate_Browser_buttonDelete').onclick = this.deleteDocument.bind(this);
        document.getElementById('docToValidate_Browser_buttonValidate').onclick = this.validateDocument.bind(this);
        dragElement(div);
        this.update;
    }

    this.dispose = function () {
        let div = document.getElementById('docToValidate_Browser');
        div.parentNode.removeChild(div);
    }

    this.isVisible = function () {
        let div = document.getElementById('docToValidate_Browser');
        return div !== undefined && div !== null;
    }

    this.update = () => {
        const currentDocument = this.docToValidateService.currentDocument();
        const currentDocumentId = this.docToValidateService.getCurrentDocumentId();
        const documentsCount = this.docToValidateService.getDocumentsCount();

        if (currentDocument !== undefined && currentDocument !== null) {
            document.getElementById('docToValidate_Browser_title').innerHTML = currentDocument.title;
            document.getElementById('docToValidate_Browser_description').innerHTML = currentDocument.description;
            document.getElementById('docToValidate_Browser_referringDate').innerHTML = currentDocument.referringDate;
            document.getElementById('docToValidate_Browser_publicationDate').innerHTML = currentDocument.publicationDate;
            document.getElementById('docToValidate_Browser_type').innerHTML = currentDocument.type;
            document.getElementById('docToValidate_Browser_subject').innerHTML = currentDocument.subject;
            document.getElementById('docToValidate_Browser_file').src = currentDocument.imgUrl;

            document.getElementById('docToValidate_Browser_buttonPrev').disabled = false;
            document.getElementById('docToValidate_Browser_buttonNext').disabled = false;
            document.getElementById('docToValidate_Browser_buttonReset').disabled = false;
            document.getElementById('docToValidate_Browser_buttonOrient').disabled = false;
            document.getElementById('docToValidate_Browser_buttonDelete').disabled = false;
            document.getElementById('docToValidate_Browser_buttonValidate').disabled = false;

            document.getElementById('docToValidate_Browser_currentDocument').innerHTML = `Document ${currentDocumentId + 1} out of ${documentsCount}`;
        } else {
            document.getElementById('docToValidate_Browser_title').innerHTML = '';
            document.getElementById('docToValidate_Browser_description').innerHTML = '';
            document.getElementById('docToValidate_Browser_referringDate').innerHTML = '';
            document.getElementById('docToValidate_Browser_publicationDate').innerHTML = '';
            document.getElementById('docToValidate_Browser_type').innerHTML = '';
            document.getElementById('docToValidate_Browser_subject').innerHTML = '';
            document.getElementById('docToValidate_Browser_file').src = '';

            document.getElementById('docToValidate_Browser_buttonPrev').disabled = true;
            document.getElementById('docToValidate_Browser_buttonNext').disabled = true;
            document.getElementById('docToValidate_Browser_buttonReset').disabled = true;
            document.getElementById('docToValidate_Browser_buttonOrient').disabled = true;
            document.getElementById('docToValidate_Browser_buttonDelete').disabled = true;
            document.getElementById('docToValidate_Browser_buttonValidate').disabled = true;

            document.getElementById('docToValidate_Browser_currentDocument').innerHTML = `No documents found.`;
        }
    }

    this.nextDocument = function() {
        this.docToValidateService.nextDocument();
    }

    this.prevDocument = function() {
        this.docToValidateService.prevDocument();
    }

    this.resetResearch = function () {
        this.docToValidateService.clearSearch();
    }

    this.deleteDocument = function () {
        let confirmDeletion = confirm('You are about to delete this document. This operation cannot be undone. Are you sure ?');
        if (confirmDeletion) {
            this.docToValidateService.delete();
        }
    }

    this.validateDocument = function () {
        let confirmValidation = confirm('Do you want to validate this document ? It will disapear from the documents to validate, and appear in the documents list.');
        if (confirmValidation) {
            this.docToValidateService.validate();
        }
    }

    this.initialize();
}