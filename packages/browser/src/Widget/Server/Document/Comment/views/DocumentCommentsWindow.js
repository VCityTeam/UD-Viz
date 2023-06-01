import { DocumentCommentsService } from '../services/DocumentCommentsService';
import { findChildByID } from '../../../../../HTMLUtil';

import './DocumentCommentsStyle.css';

/**
 * A window to display the comments associated to a document. Also serves as
 * a comments creation interface.
 */
export class DocumentCommentsWindow {
  /**
   * Creates a document comments window to add in the document browser.
   *
   * @param {DocumentCommentsService} documentCommentsService The document comments
   * service.
   */
  constructor(documentCommentsService) {
    this.domElement = document.createElement('div');
    this.domElement.innerHTML = this.innerContentHtml;

    this.documentCommentsService = documentCommentsService;

    findChildByID(this.domElement, 'documentComments_inputButton').onclick =
      this.publishComment.bind(this);
    this.getComments();
  }

  get innerContentHtml() {
    return /* html*/ `
        <div class="innerClass" id="documentComments_innerWindow">
            <div id ="documentComments_left">

            </div>
            <div id ="documentComments_right">
                <form id="documentComments_inputForm">
                    <div class="commentRow">
                        <textarea placeholder="Enter your comment here." id="documentComments_inputComment" name="description" ></textarea>
                    </div>
                    <div class="commentRow">
                        <button type="button" id ="documentComments_inputButton">Comment</button>
                    </div>
                </form>
            </div>
        </div>
        `;
  }

  getComments() {
    return new Promise((resolve, reject) => {
      this.documentCommentsService.getComments().then(
        (comments) => {
          findChildByID(this.domElement, 'documentComments_left').innerHTML =
            '';
          for (const comment of comments) {
            const text =
              typeof comment.description === 'string'
                ? comment.description.replace(/(?:\r\n|\r|\n)/g, '<br>')
                : '';
            const div = document.createElement('div');
            div.className = 'talk-bubble';
            div.innerHTML = `
                    <div class="talktext">
                    <p class="talktext-author">${comment.author.firstName} ${
              comment.author.lastName
            }</p>
                    <p class="talktext-comment">${text}</p>
                    <p class="talktext-date">${new Date(
                      comment.date
                    ).toLocaleString()}</p>
                    </div>
                `;
            findChildByID(this.domElement, 'documentComments_left').appendChild(
              div
            );
          }
          resolve();
        },
        (reason) => {
          alert(reason);
          this.domElement.remove();
          reject();
        }
      );
    });
  }

  async publishComment() {
    const form = findChildByID(this.domElement, 'documentComments_inputForm');
    const form_data = new FormData(form);
    try {
      await this.documentCommentsService.publishComment(form_data).then(() => {
        findChildByID(this.domElement, 'documentComments_inputComment').value =
          '';
        this.getComments();
      });
    } catch (e) {
      alert(e);
    }
  }
}
