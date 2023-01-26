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

    let fold = false;
    foldButton.onclick = () => {
      if (fold) {
        rootHtml.style.transform = 'translate(0%,0%)';
      } else {
        rootHtml.style.transform = 'translate(-100%,0%)';
      }
      fold = !fold;
    };

    this.uiContainer = document.createElement('div');
    this.uiContainer.classList.add('container_pointer_note_ui');
    rootHtml.appendChild(this.uiContainer);

    // bug planar control bug
    // this.context.frame3D.enableItownsViewControls(false);
    rootHtml.onmouseenter = () => {
      this.context.frame3D.enableItownsViewControls(false);
    };
    rootHtml.onmouseleave = () => {
      this.context.frame3D.enableItownsViewControls(true);
    };
  }

  appendToHtml(el) {
    this.uiContainer.appendChild(el);
  }
}
