import { Window } from '../../../Shared/js/Window';
import '../../../Shared/css/window.css';

export class DocToValidateCommentWindow extends Window {

    constructor() {
        super('docToValidateComment', 'Commentaires', false);
    }

    get innerContentHtml() {
        return `
            <p>
                Fenêtre de commentaires
            </p>
        `;
    }

    windowCreated() {
        // évènements des boutons gérés ici
    }
}