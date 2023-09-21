import { DocumentCommentsService } from '../services/DocumentCommentsService';

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

    this.commentsLeft = document.createElement('div');
    this.domElement.appendChild(this.commentsLeft);

    this.commentsRight = document.createElement('div');
    this.domElement.appendChild(this.commentsRight);

    this.form = document.createElement('form');
    this.commentsRight.appendChild(this.form);

    this.textArea = document.createElement('textarea');
    this.textArea.setAttribute('placeholder', 'Enter your comment here.');
    this.textArea.setAttribute('name', 'description');
    this.form.appendChild(this.textArea);

    this.buttonComment = document.createElement('button');
    this.buttonComment.setAttribute('type', 'button');
    this.buttonComment.innerText = 'Comment';
    this.form.appendChild(this.buttonComment);

    this.documentCommentsService = documentCommentsService;

    this.buttonComment.onclick = this.publishComment.bind(this);
    this.getComments();
  }

  getComments() {
    return new Promise((resolve, reject) => {
      this.documentCommentsService.getComments().then(
        (comments) => {
          this.commentsLeft.innerHTML = '';
          for (const comment of comments) {
            const text =
              typeof comment.description === 'string'
                ? comment.description.replace(/(?:\r\n|\r|\n)/g, '<br>')
                : '';
            const div = document.createElement('div');
            div.innerHTML = `
                    <div >
                    <p >${comment.author.firstName} ${
              comment.author.lastName
            }</p>
                    <p >${text}</p>
                    <p >${new Date(comment.date).toLocaleString()}</p>
                    </div>
                `;
            this.commentsLeft.appendChild(div);
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
    const form_data = new FormData(this.form);
    try {
      await this.documentCommentsService.publishComment(form_data).then(() => {
        this.textArea.value = '';
        this.getComments();
      });
    } catch (e) {
      alert(e);
    }
  }
}
