import { dragElement } from './Draggable';

export function DocToValidateCommentWindow(docToValidateView, docToValidateService) {

    this.docToValidateService = docToValidateService;
    this.docToValidateView = docToValidateView;

    this.initialize = function () {
    }

    this.html = function () {
        return `
        <div id="docToValidate_Comment_header" class="docToValidate_Window_header">
            <h2>Document Comments</h2>
            <button class="docToValidate_buttonClose" id="docToValidate_Comment_buttonClose">Close</button>
        </div>
        <div class="innerWindow">
            <div id = "allComments_Window"> </div>
            <div id = "addComment_Window"> 
                <!--form id = "commentForm" >
                    salut 
                    tu vas bien 
                    </br>
                </form--> 
            </div>
        </div>
        `;
    }

    this.appendToElement = function(htmlElement) {
        let div = document.createElement('div');
        div.innerHTML = this.html();
        div.id = "docToValidate_Comment";
        div.className = "docToValidate_Window";
        htmlElement.appendChild(div);
        document.getElementById('docToValidate_Comment_buttonClose').onclick = this.dispose;
        dragElement(div);
    }

    this.dispose = function () {
        let div = document.getElementById('docToValidate_Comment');
        div.parentNode.removeChild(div);
    }

    this.isVisible = function () {
        let div = document.getElementById('docToValidate_Comment');
        return div !== undefined && div !== null;
    }


    this.initialize();
}