import { Window } from '../../../Utils/GUI/js/Window';
import '../../../Utils/GUI/css/window.css';

export class DocToValidateSearchWindow extends Window {

    constructor(docToValidateView, docToValidateService) {
        super('docToValidateSearch', 'Research', false);
        this.docToValidateService = docToValidateService;
        this.docToValidateView = docToValidateView;
        this.addListener((event) => {
            if (event === Window.EVENT_DESTROYED) {
                this.docToValidateView.disable();
            }
        });
    }

    get innerContentHtml() {
        return `
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
                <label for="docToValidate_searchForm_subject">Subject</label>
                <select id="docToValidate_searchForm_subject" name="subject" form="docToValidate_searchForm">
                    <option value>None</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Tourism">Tourism</option>
                    <option value="Urbanism">Urbanism</option>
                </select>
                <hr>
                <button type="button" id="docToValidate_searchForm_submit">Search</button>
            </form>
        `;
    }

    windowCreated() {
        document.getElementById('docToValidate_searchForm_submit').onclick = this.search.bind(this);
        this.window.style.setProperty('top', '80px');
        this.window.style.setProperty('left', '310px');
        this.window.style.setProperty('width', '380px');
        this.window.style.setProperty('height', '360px');
    }

    search() {
        const form = document.getElementById('docToValidate_searchForm');
        const formData = new FormData(form);
        for (let entry of formData.entries()) {
            console.log(entry);
        }
        this.docToValidateService.search(formData);
    }
}