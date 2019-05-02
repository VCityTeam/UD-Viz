import "./DocToValidateStyle.css"

export function DocToValidateWindow(docToValidateService) {

    this.docToValidateService = docToValidateService;

    this.initialize = function () {
        console.log('Doc To Validate Window initialized.');
    }

    this.html = function () {
        return `
            <div id="docToValidate_Window_header">
                <h2>Documents to validate</h2>
                <button id="docToValidate_buttonClose">Close</button>
            </div>
            <div class="innerWindow">
                <div id="docToValidate_Search">
                    <h3>Research</32>
                    <form id="docToValidate_searchForm">
                        <label for="docToValidate_searchForm_keyword">Keyword</label>
                        <input type="text" id="docToValidate_searchForm_keyword" name="keyword">
                        <label for="docToValidate_searchForm_startReferringDate">Start referring date</label>
                        <input type="date" id="docToValidate_searchForm_startReferringDate" name="startReferringDate">
                        <label for="docToValidate_searchForm_endReferringDate">End referring date</label>
                        <input type="date" id="docToValidate_searchForm_endReferringDate" name="endReferringDate">
                        <label for="docToValidate_searchForm_startPublicationDate">Start publication date</label>
                        <input type="date" id="docToValidate_searchForm_startPublicationDate" name="startPublicationDate">
                        <label for="docToValidate_searchForm_endPublicationDate">End publication date</label>
                        <input type="date" id="docToValidate_searchForm_endPublicationDate" name="endPublicationDate">
                        <button type="button" id="docToValidate_searchForm_submit">Search</button>
                    </form>
                </div>
                <div id="docToValidate_Browser">
                    <h3>Document navigator</h3>
                    <h4 id="docToValidate_Browser_title">Title<h4>
                    <h5>Description</h5>
                    <p id="docToValidate_Browser_description"></p>
                    <h5>Referring date</h5>
                    <p id="docToValidate_Browser_referringDate"></p>
                    <h5>Publication date</h5>
                    <p id="docToValidate_Browser_publicationDate"></p>
                    <h5>Type</h5>
                    <p id="docToValidate_Browser_type"></p>
                    <h5>Subject</h5>
                    <p id="docToValidate_Browser_subject"></p>
                    <img id="docToValidate_Browser_file"></img>
                    <div id="docToValidate_Browser_navigation">
                        <div id="docToValidate_Browser_currentDocument"></div>
                        <button type="button" id="docToValidate_Browser_buttonPrev">⇦</button>
                        <button type="button" id="docToValidate_Browser_buttonNext">⇨</button>
                        <button type="button" id="docToValidate_Browser_buttonReset">Reset research</button>
                        <button type="button" id="docToValidate_Browser_buttonOrient">Orient document</button>
                    </div>
                </div>
            </div>
        `;
    }

    this.appendToElement = function (htmlElement) {
        let newDiv = document.createElement('div');
        newDiv.id = "docToValidate_Window";
        newDiv.innerHTML = this.html();
        htmlElement.appendChild(newDiv);
        document.getElementById('docToValidate_buttonClose').onclick = this.dispose.bind(this);
        document.getElementById('docToValidate_searchForm_submit').onclick = this.search.bind(this);
        document.getElementById('docToValidate_Browser_buttonPrev').onclick = this.prevDocument.bind(this);
        document.getElementById('docToValidate_Browser_buttonNext').onclick = this.nextDocument.bind(this);
        document.getElementById('docToValidate_Browser_buttonReset').onclick = this.resetResearch.bind(this);
        dragElement(newDiv);
        this.updateBrowser();
    }

    this.dispose = function () {
        let thisWindow = document.getElementById('docToValidate_Window');
        thisWindow.parentNode.removeChild(thisWindow);
    }

    this.isVisible = function () {
        let thisWindow = document.getElementById('docToValidate_Window');
        return thisWindow !== undefined && thisWindow !== null;
    }

    this.search = function () {
        const form = document.getElementById('docToValidate_searchForm');
        const formData = new FormData(form);
        console.log("search :");
        for (let entry of formData.entries()) {
            console.log(entry);
        }
        this.docToValidateService.search(formData);
        console.log(this.updateBrowser);
        this.updateBrowser();
    }

    this.nextDocument = function() {
        this.docToValidateService.nextDocument();
        this.updateBrowser();
    }

    this.prevDocument = function() {
        this.docToValidateService.prevDocument();
        this.updateBrowser();
    }

    this.resetResearch = function () {
        this.docToValidateService.clearSearch();
        this.updateBrowser();
    }

    this.updateBrowser = function () {
        const currentDocument = this.docToValidateService.currentDocument();
        const currentDocumentId = this.docToValidateService.getCurrentDocumentId();
        const documentsCount = this.docToValidateService.getDocumentsCount();

        console.log('update');
        console.log(currentDocument);
        console.log(currentDocumentId);
        console.log(documentsCount);

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

            document.getElementById('docToValidate_Browser_currentDocument').innerHTML = `Document ${currentDocumentId + 1} out of ${documentsCount}`;
        } else {
            document.getElementById('docToValidate_Browser_buttonPrev').disabled = true;
            document.getElementById('docToValidate_Browser_buttonNext').disabled = true;
            document.getElementById('docToValidate_Browser_buttonReset').disabled = true;
            document.getElementById('docToValidate_Browser_buttonOrient').disabled = true;

            document.getElementById('docToValidate_Browser_currentDocument').innerHTML = `No documents found.`;
        }
    }

    this.initialize();
};

// Code from https://www.w3schools.com/howto/howto_js_draggable.asp
// Make the DIV element draggable:
function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "_header")) {
        // if present, the header is where you move the DIV from:
        console.log('header');
        document.getElementById(elmnt.id + "_header").onmousedown = dragMouseDown;
    } else {
        console.log('pas header');
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}