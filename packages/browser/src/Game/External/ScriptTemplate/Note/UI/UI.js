import { ExternalScriptBase } from '../../../Context';
import { checkParentChild } from '../../../../../HTMLUtil';
import * as THREE from 'three';
import { Game } from '@ud-viz/shared';

import './UI.css';
import { Element } from '../Note';

/** @classdesc - Manage global ui of the note feature */
export class UI extends ExternalScriptBase {
  init() {
    const domElement = document.createElement('div');
    domElement.classList.add('root_note_ui');
    this.context.frame3D.domElementUI.appendChild(domElement);

    const foldButton = document.createElement('div');
    foldButton.classList.add('fold_button_note_ui');
    domElement.appendChild(foldButton);

    let fold = false;
    foldButton.onclick = () => {
      if (fold) {
        domElement.style.transform = 'translate(0%,0%)';
      } else {
        domElement.style.transform = 'translate(-100%,0%)';
      }
      fold = !fold;
    };

    this.uiContainer = document.createElement('div');
    this.uiContainer.classList.add('container_note_ui');
    domElement.appendChild(this.uiContainer);

    // instruction
    const intructionsHtml = document.createElement('div');
    intructionsHtml.innerHTML =
      'n : Add Note<br>- : Decrease pointer scale<br>+ : Increase pointer scale';
    this.uiContainer.appendChild(intructionsHtml);

    // allow to click on note
    const raycaster = new THREE.Raycaster();
    this.context.inputManager.addMouseInput(
      this.context.frame3D.domElementWebGL,
      'click',
      (event) => {
        if (checkParentChild(event.target, this.context.frame3D.ui)) return;

        const mouse = new THREE.Vector2(
          -1 +
            (2 * event.offsetX) /
              (this.context.frame3D.domElementWebGL.clientWidth -
                parseInt(this.context.frame3D.domElementWebGL.offsetLeft)),
          1 -
            (2 * event.offsetY) /
              (this.context.frame3D.domElementWebGL.clientHeight -
                parseInt(this.context.frame3D.domElementWebGL.offsetTop))
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
          const externalScriptComp = closestNote.getComponent(
            Game.Component.ExternalScript.TYPE
          );
          externalScriptComp
            .getController()
            .getScripts()
            [Element.ID_SCRIPT].displayNoteMessageHtml();
        }
      }
    );
  }

  appendToHtml(el) {
    this.uiContainer.appendChild(el);
  }

  static get ID_SCRIPT() {
    return Game.ScriptTemplate.Constants.ID_SCRIPT.NoteUI;
  }
}
