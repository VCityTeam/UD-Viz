import { ExternalScriptBase } from '../../Context';

import './PointerNoteUI.css';

export class PointerNoteUI extends ExternalScriptBase {
  init() {
    const rootHtml = document.createElement('div');
    rootHtml.classList.add('root_pointer_note_ui');
    this.context.frame3D.appendToUI(rootHtml);

    const foldButton = document.createElement('div');
    foldButton.classList.add('fold_button_pointer_note_ui');
    rootHtml.appendChild(foldButton);

    let fold = true;
    foldButton.onclick = () => {
      if (fold) {
        rootHtml.style.transform = 'translate(0%,0%)';
      } else {
        rootHtml.style.transform = 'translate(-100%,0%)';
      }
      fold = !fold;
    };
  }
}
