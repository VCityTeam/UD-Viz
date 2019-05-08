import { dragElement } from './Draggable';
import * as THREE from 'three';

export function DocToValidateBrowserWindow(docToValidateView, docToValidateService) {

    this.docToValidateService = docToValidateService;
    this.docToValidateView = docToValidateView;
    this.parent;

    this.initialize = function () {
    }

    this.html = function () {
        return `
        <div id="docToValidate_Browser_header" class="docToValidate_Window_header">
            <h2>Document navigator</h2>
        </div>
        <div class="innerWindow" id="docToValidate_Browser_innerWindow">
            <h3 id="docToValidate_Browser_title">Title<h3>
            <h4>Author</h4>
            <p id="docToValidate_Browser_author_name"></p>
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
                <button type="button" id="docToValidate_Browser_buttonUpdate">Update</button>
                <button type="button" id="docToValidate_Browser_buttonOrient">Orient document</button>
                <button type="button" id="docToValidate_Browser_buttonDelete">Delete</button>
                <button type="button" id="docToValidate_Browser_buttonValidate">Validate</button>
                <button type ="button" id="docToValidate_Browser_buttonComment">Comments</button>
            </div>
        </div>
        `;
    }

    this.appendToElement = function(htmlElement) {
        this.parent = htmlElement;
        let div = document.createElement('div');
        div.innerHTML = this.html();
        div.id = "docToValidate_Browser";
        div.className = "docToValidate_Window";
        htmlElement.appendChild(div);
        this.browserButtonBinding();
        dragElement(div);
        this.update();
    }

    this.browserButtonBinding = function() {
        document.getElementById('docToValidate_Browser_buttonPrev').onclick = this.prevDocument.bind(this);
        document.getElementById('docToValidate_Browser_buttonNext').onclick = this.nextDocument.bind(this);
        document.getElementById('docToValidate_Browser_buttonReset').onclick = this.resetResearch.bind(this);
        document.getElementById('docToValidate_Browser_buttonUpdate').onclick = this.displayUpdate.bind(this);
        document.getElementById('docToValidate_Browser_buttonOrient').onclick = this.orientDocument.bind(this);
        document.getElementById('docToValidate_Browser_buttonDelete').onclick = this.deleteDocument.bind(this);
        document.getElementById('docToValidate_Browser_buttonValidate').onclick = this.validateDocument.bind(this);
        document.getElementById('docToValidate_Browser_buttonComment').onclick = this.commentDocument.bind(this);
    }

    this.dispose = function () {
        let div = document.getElementById('docToValidate_Browser');
        div.parentNode.removeChild(div);
    }

    this.isVisible = function () {
        let div = document.getElementById('docToValidate_Browser');
        return div !== undefined && div !== null;
    }

    this.update = async () => {
        const currentDocument = this.docToValidateService.currentDocument();
        const currentDocumentId = this.docToValidateService.getCurrentDocumentId();
        const documentsCount = this.docToValidateService.getDocumentsCount();
        if (currentDocument !== undefined && currentDocument !== null) {
            const author = await this.docToValidateService.getAuthor();
            document.getElementById('docToValidate_Browser_title').innerHTML = currentDocument.metaData.title;
            document.getElementById('docToValidate_Browser_description').innerHTML = currentDocument.metaData.description;
            document.getElementById('docToValidate_Browser_referringDate').innerHTML = currentDocument.metaData.refDate;
            document.getElementById('docToValidate_Browser_author_name').innerHTML = author.firstName + " " + author.lastName + " (" + author.email +")";
            document.getElementById('docToValidate_Browser_publicationDate').innerHTML = currentDocument.metaData.publicationDate;
            document.getElementById('docToValidate_Browser_type').innerHTML = currentDocument.metaData.type;
            document.getElementById('docToValidate_Browser_subject').innerHTML = currentDocument.metaData.subject;
            document.getElementById('docToValidate_Browser_file').src = currentDocument.imgUrl;

            document.getElementById('docToValidate_Browser_buttonPrev').disabled = false;
            document.getElementById('docToValidate_Browser_buttonNext').disabled = false;
            document.getElementById('docToValidate_Browser_buttonReset').disabled = false;
            document.getElementById('docToValidate_Browser_buttonUpdate').disabled = false;
            document.getElementById('docToValidate_Browser_buttonOrient').disabled = false;
            document.getElementById('docToValidate_Browser_buttonDelete').disabled = false;
            document.getElementById('docToValidate_Browser_buttonValidate').disabled = false;
            document.getElementById('docToValidate_Browser_buttonComment').disabled = false;

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
            document.getElementById('docToValidate_Browser_buttonUpdate').disabled = true;
            document.getElementById('docToValidate_Browser_buttonOrient').disabled = true;
            document.getElementById('docToValidate_Browser_buttonDelete').disabled = true;
            document.getElementById('docToValidate_Browser_buttonValidate').disabled = true;
            document.getElementById('docToValidate_Browser_buttonComment').disabled = true;

            document.getElementById('docToValidate_Browser_currentDocument').innerHTML = `No documents found.`;
        }
    }

    this.orientDocument = function() {
        document.getElementById('docFull').style.display = 'block';
        console.log('----------------');
        console.log(this.docToValidateView.documentController.serverModel);
        let currentDocument = this.docToValidateService.currentDocument();
        let currentMetadata = currentDocument.metaData;
        console.log(currentMetadata);
        let src = this.docToValidateView.documentController.url + this.docToValidateView.documentController.serverModel.document + '/' + currentMetadata.id + '/' + this.docToValidateView.documentController.serverModel.file;
        document.getElementById('docFullImg').src = currentDocument.imgUrl;
        document.getElementById('docBrowserPreviewImg').src = currentDocument.imgUrl;
        document.getElementById('docFullImg').style.opacity = 50;
        document.getElementById('docOpaSlider').value = 0;
        document.querySelector('#docOpacity').value = 50;
        document.getElementById('docFull').style.display = 'block';
        document.getElementById('docFullPanel').style.display = 'block';

      // if we have valid data, initiate the animated travel to orient the camera
        if (!isNaN(currentDocument.visualization.positionX) &&
                            !isNaN(currentDocument.visualization.quaternionX)) {
            var docViewPos = new THREE.Vector3();
            docViewPos.x = parseFloat(currentDocument.visualization.positionX);
            docViewPos.y = parseFloat(currentDocument.visualization.positionY);
            docViewPos.z = parseFloat(currentDocument.visualization.positionZ);

          // camera orientation for the oriented view
            var docViewQuat = new THREE.Quaternion();
            docViewQuat.x = parseFloat(currentDocument.visualization.quaternionX);
            docViewQuat.y = parseFloat(currentDocument.visualization.quaternionY);
            docViewQuat.z = parseFloat(currentDocument.visualization.quaternionZ);
            docViewQuat.w = parseFloat(currentDocument.visualization.quaternionW);
            this.docToValidateView.documentController.controls.initiateTravel(docViewPos, 'auto',
                                                              docViewQuat, true);
        }

        // adjust the current date if we use temporal
        if (this.docToValidateView.documentController.temporal) {
            var docDate = new moment(currentMetadata.refDate);
            this.docToValidateView.documentController.temporal.changeTime(docDate);
        }

        this.isOrientingDoc = true;
        this.isFadingDoc = false;

        this.docToValidateView.documentController.view.notifyChange();
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

    this.commentDocument = function () {
        if(this.docToValidateView.commentWindow.isVisible) {
            this.docToValidateView.commentWindow.dispose();
        } else {
            this.docToValidateView.commentWindow.appendTo(this.parent);
        }
    }

    this.displayUpdate = function () {
        let div = document.getElementById('docToValidate_Browser_innerWindow');
        div.innerHTML = `
        <form id="docToValidate_udpateForm">
            <label for="docToValidate_updateForm_description">Description</label>
            <input type="text" id="docToValidate_updateForm_description" name="description">
            <label for="docToValidate_updateForm_referringDate">Referring date</label>
            <input type="date" id="docToValidate_updateForm_referringDate" name="refDate">
            <label for="docToValidate_updateForm_publicationDate">Publication date</label>
            <input type="date" id="docToValidate_updateForm_publicationDate" name="publicationDate">
            <label for="docToValidate_updateForm_subject">Subject</label>
            <select id="docToValidate_updateForm_subject" name="subject" form="docToValidate_updateForm">
                <option value>None</option>
                <option value="Architecture">Architecture</option>
                <option value="Tourism">Tourism</option>
                <option value="Urbanism">Urbanism</option>
            </select>
            <hr>
            <button type="button" id="docToValidate_updateFrom_cancel">Cancel</button>
            <button type="button" id="docToValidate_updateForm_submit">Update</button>
        </form>
        `;

        document.getElementById('docToValidate_updateFrom_cancel').onclick = this.displayBrowser.bind(this);
        document.getElementById('docToValidate_updateForm_submit').onclick = this.updateDocument.bind(this);
        let doc = this.docToValidateService.currentDocument();
        console.log(doc);
        document.getElementById('docToValidate_updateForm_description').value = doc.metaData.description;
        document.getElementById('docToValidate_updateForm_referringDate').value = doc.metaData.refDate;
        document.getElementById('docToValidate_updateForm_publicationDate').value = doc.metaData.publicationDate;
        document.getElementById('docToValidate_updateForm_subject').value = doc.metaData.subject;
    }

    this.displayBrowser = function () {
        let div = document.getElementById('docToValidate_Browser_innerWindow');
        div.innerHTML = `
            <h3 id="docToValidate_Browser_title">Title<h3>
            <h4>Author</h4>
            <p id="docToValidate_Browser_author_name"></p>
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
                <button type="button" id="docToValidate_Browser_buttonUpdate">Update</button>
                <button type="button" id="docToValidate_Browser_buttonOrient">Orient document</button>
                <button type="button" id="docToValidate_Browser_buttonDelete">Delete</button>
                <button type="button" id="docToValidate_Browser_buttonValidate">Validate</button>
                <button type ="button" id="docToValidate_Browser_buttonComment">Comments</button>
            </div>
        `;
        this.browserButtonBinding();
        this.docToValidateView.searchWindow.search();
    }

    this.updateDocument = function () {
        let form = document.getElementById('docToValidate_udpateForm');
        let formData = new FormData(form);

        this.docToValidateService.update(formData).then((result) => {
            this.displayBrowser();
        });
    }

    this.initialize();
}
