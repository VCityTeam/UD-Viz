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
            <div class="commentRow">
                <textarea placeholder="Enter your comment here." id="docToValidateComment_inputComment" name="description" ></textarea>
            </div>
            <div class="commentRow">
                <button type="button" id ="docToValidateComment_inputButton">Comment</button>
            </div>
          </form>
        </div>
        `;
    }

    getComment() {
        this.docToValidateService.getComments().then((comments) => {
            document.getElementById('docToValidateComment_left').innerHTML = '';
            console.log(comments);
            for (let comment of comments.reverse()) {
                let text = (typeof comment.description === 'string') ? comment.description.replace(/(?:\r\n|\r|\n)/g, '<br>') : '';
                let div = document.createElement('div');
                div.className = 'talk-bubble';
                div.innerHTML = `
                    <div class="talktext">
                    <p class="talktext-author">${comment.author.firstName} ${comment.author.lastName}</p>
                    <p class="talktext-comment">${text}</p>
                    </div>
                `;
                document.getElementById('docToValidateComment_left').appendChild(div);
            }
        });
    }

    windowCreated() {
        this.window.style.setProperty('width', '500px');
        this.window.style.setProperty('height', '500px');
        this.window.style.setProperty('left', '1100px');
        this.window.style.setProperty('top', '80px');
        this.window.style.setProperty('resize', 'both');
        document.getElementById('docToValidateComment_inputButton').onclick = this.publishComment.bind(this);
        this.getComment();
    }

    publishComment() {
        console.log('enter')
        let form = document.getElementById('docToValidateComment_inputForm');
        let form_data = new FormData(form);
        this.docToValidateService.publishComment(form_data).then(() => {
            document.getElementById('docToValidateComment_inputComment').value = '';
            this.getComment();
        });
    }
}
