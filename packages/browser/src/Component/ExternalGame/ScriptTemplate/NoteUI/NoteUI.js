import { ExternalScriptBase } from '../../Context';
import { checkParentChild } from '../../../HTMLUtil';
import * as THREE from 'three';

import './NoteUI.css';

export class NoteUI extends ExternalScriptBase {
  init() {
    const rootHtml = document.createElement('div');
    rootHtml.classList.add('root_note_ui');
    this.context.frame3D.appendToUI(rootHtml);

    const foldButton = document.createElement('div');
    foldButton.classList.add('fold_button_note_ui');
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
    this.uiContainer.classList.add('container_note_ui');
    rootHtml.appendChild(this.uiContainer);

    // bug planar control bug
    // this.context.frame3D.enableItownsViewControls(false);
    rootHtml.onmouseenter = () => {
      this.context.frame3D.enableItownsViewControls(false);
    };
    rootHtml.onmouseleave = () => {
      this.context.frame3D.enableItownsViewControls(true);
    };

    // allow to click on note
    const raycaster = new THREE.Raycaster();
    this.context.inputManager.addMouseInput(
      this.context.frame3D.rootWebGL,
      'click',
      (event) => {
        if (checkParentChild(event.target, this.context.frame3D.ui)) return;

        const mouse = new THREE.Vector2(
          -1 +
            (2 * event.offsetX) /
              (this.context.frame3D.getRootWebGL().clientWidth -
                parseInt(this.context.frame3D.getRootWebGL().offsetLeft)),
          1 -
            (2 * event.offsetY) /
              (this.context.frame3D.getRootWebGL().clientHeight -
                parseInt(this.context.frame3D.getRootWebGL().offsetTop))
        );

        raycaster.setFromCamera(mouse, this.context.frame3D.camera);

        let minDist = Infinity;
        let closestNote = null;
        this.context.object3D.traverse((child) => {
          if (!child.userData.isNote) return;
          const i = raycaster.intersectObject(child, true);
          if (i.length && i[0].distance < minDist) {
            minDist = i[0].distance;
            closestNote = child;
          }
        });

        if (closestNote) {
          console.log(closestNote.userData.message);
        }
      }
    );
  }

  appendToHtml(el) {
    this.uiContainer.appendChild(el);
  }
}
