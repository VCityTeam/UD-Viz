import { dragElement } from './Draggable';

export function DocToValidateSearchWindow(docToValidateView, docToValidateService) {

    this.docToValidateService = docToValidateService;
    this.docToValidateView = docToValidateView;

    this.initialize = function () {
    }

    this.html = function () {
        return `
            <div id="docToValidate_Search_header" class="docToValidate_Window_header">
                <h2>Research</h2>
                <button id="docToValidate_buttonClose">Close</button>
            </div>
            <div class="innerWindow">
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
        `;
    }

    this.appendToElement = function(htmlElement) {
        let div = document.createElement('div');
        div.innerHTML = this.html();
        div.id = "docToValidate_Search";
        div.className = "docToValidate_Window";
        htmlElement.appendChild(div);
        document.getElementById('docToValidate_buttonClose').onclick = this.docToValidateView.dispose;
        console.log(this.docToValidateView.dispose);
        document.getElementById('docToValidate_searchForm_submit').onclick = this.search.bind(this);
        dragElement(div);
    }

    this.dispose = function () {
        let div = document.getElementById('docToValidate_Search');
        div.parentNode.removeChild(div);
    }

    this.isVisible = function () {
        let div = document.getElementById('docToValidate_Search');
        return div !== undefined && div !== null;
    }

    this.search = function () {
        const form = document.getElementById('docToValidate_searchForm');
        const formData = new FormData(form);
        this.docToValidateService.search(formData)
            .then((result) => {
                this.docToValidateService.notifyObservers();
            });
    }

    this.initialize();
}