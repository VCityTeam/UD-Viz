import { Window } from '../../../Components/GUI/js/Window';
import { SparqlEndpointService } from '../service/SparqlEndpointService';

    /**
     * Creates a SPARQL query window.
     */
export class SparqlQueryWindow extends Window {
    constructor(service) {
        super('sparqlQueryWindow', 'SPARQL Query');

        /**
         * The SPARQL query endpoint service.
         * 
         * @type {SparqlEndpointService}
         */
        this.service = service;
        /**
         * The default SPARQL query to display upon opening the query window.
         * 
         * @member {string}
         */
        this.default_query = `
SELECT *
WHERE {
    ?s ?o ?p .
}`;
    }

    /**
     * Override the windowCreated function. Sets the SparqlEndpointService.
     * Should be called by `SparqlModuleView`. Once this is done, the window is
     * actually usable ; service event listerers are set here.
     * @param {SparqlEndpointService} service The SPARQL endpoint service.
     */
    windowCreated() {
        this.form.onsubmit = () => {
            this.service.queryEndpointService(this.queryTextArea.textContent);
            return false;
        }
    }

    get innerContentHtml() {
        return /*html*/ `
        <div>
            <form id=${this.formId}>
                <label for="${this.queryTextAreaId}">Query:</label><br>
                <textarea id="${this.queryTextAreaId}" rows="10" cols="27">${this.default_query}</textarea>
                <input id="${this.buttonId}" type="submit" value="Send" >
            </form>
        </div>
      `;
    }

    // SPARQL Window getters //
    get formId() {
        return `${this.windowId}_form`;
    }

    get form() {
        return document.getElementById(this.formId);
    }

    get queryTextAreaId() {
        return `${this.windowId}_query_text_area`;
    }

    get queryTextArea() {
        return document.getElementById(this.queryTextAreaId);
    }

    get buttonId() {
        return `${this.windowId}_query_button`;
    }

    get button() {
        return document.getElementById(this.buttonId);
    }
}