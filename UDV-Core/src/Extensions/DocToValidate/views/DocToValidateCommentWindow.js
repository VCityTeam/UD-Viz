import { Window } from '../../../Shared/js/Window';
import '../../../Shared/css/window.css';

export class DocToValidateCommentWindow extends Window {

    constructor(docToValidateService) {
        super('docToValidateComment', 'Commentaires', false);
        this.docToValidateService = docToValidateService;
    }

    get innerContentHtml() {
        return `
        <div class="innerClass" id="innerWindowComment">
        <div id ="docToValidateComment_left">

        </div>
        <div id ="docToValidateComment_right">
          <form id="docToValidateComment_inputForm">
            <textarea id="docToValidateComment_inputComment" name="description" ></textarea>
            <button type="button" id ="docToValidateComment_inputButton"> add comment </button>
          </form>
        </div>
        `;
    }

    getComment() {
        this.docToValidateService.getComments().then((comments) => {
            document.getElementById('docToValidateComment_left').innerHTML = '';
            console.log(comments);
            for (let comment of comments.reverse()) {
                let div = document.createElement('div');
                div.className = 'talk-bubble';
                div.innerHTML = `
            <div class="talktext">
               <b style="color:red">${comment.author.firstName}  ${comment.author.lastName}</b>
               <p> ${comment.description} </p>
            </div>
            `;
                document.getElementById('docToValidateComment_left').appendChild(div);
            }
        });
    }

    windowCreated() {
        this.window.style.setProperty('min-width', '450px');
        this.window.style.setProperty('min-height', '300px');
        this.window.style.setProperty('left', '1100px');
        this.window.style.setProperty('resize', 'none');
        document.getElementById('docToValidateComment_inputButton').onclick = this.publishComment.bind(this);
        this.getComment();
    }

    publishComment() {
        console.log('enter')
        let form = document.getElementById('docToValidateComment_inputForm');
        let form_data = new FormData(form);
        console.log(form_data);
        this.docToValidateService.publishComment(form_data).then(() => {
            this.getComment();
        });
    }
}
