import { ExternalScriptBase } from '../../Context';
import { Game, Command } from '@ud-viz/core';
import * as THREE from 'three';

import './Note.css';
import { CameraManager } from '../CameraManager';

export class Note extends ExternalScriptBase {
  init() {
    // html message note
    this.noteMessageHtml = document.createElement('div');
    this.noteMessageHtml.classList.add('note_message');
    this.noteMessageHtml.innerHTML = this.variables.message;

    // close note button
    const closeNoteButton = document.createElement('button');
    closeNoteButton.innerHTML = 'Close';
    this.noteMessageHtml.appendChild(closeNoteButton);

    closeNoteButton.onclick = (event) => {
      event.stopImmediatePropagation();
      this.noteMessageHtml.remove();
    };

    this.containerButtons = document.createElement('div');

    // create ui button in parent object
    const noteButton = document.createElement('button');

    const threshold = 10;
    if (this.variables.message.length <= threshold) {
      noteButton.innerHTML = this.variables.message + '';
    } else {
      noteButton.innerHTML = this.variables.message.slice(0, threshold) + '...'; // display a part of the message
    }

    /** @type {CameraManager} - camera manager */
    this.cameraManager = this.context.findExternalScriptWithID('CameraManager');
    noteButton.onclick = () => {
      this.context.frame3D.enableItownsViewControls(false);
      this.cameraManager
        .moveToBoundingBox(new THREE.Box3().setFromObject(this.object3D), 1500)
        .then(() => {
          this.context.frame3D.enableItownsViewControls(true);
          this.context.frame3D.itownsView.notifyChange(
            this.context.frame3D.camera
          );
          this.displayNoteMessageHtml();
        });
    };

    this.containerButtons.appendChild(noteButton);

    // parent script
    const scriptParent = this.object3D.parent
      .getComponent(Game.Component.ExternalScript.TYPE)
      .getController()
      .getScripts()['NoteService'];

    scriptParent.addNoteButton(this.containerButtons);

    if (scriptParent.isSocketScript) {
      const deleteNoteButton = document.createElement('button');
      deleteNoteButton.innerHTML = 'Delete';
      this.containerButtons.appendChild(deleteNoteButton);

      deleteNoteButton.onclick = () => {
        this.context.sendCommandToGameContext([
          new Command({
            type: Game.ScriptTemplate.Constants.COMMAND.REMOVE_OBJECT3D,
            data: {
              object3DUUID: this.object3D.uuid,
            },
          }),
        ]);
      };
    }
  }

  displayNoteMessageHtml() {
    this.context.frame3D.appendToUI(this.noteMessageHtml);
  }

  tick() {
    if (this.noteMessageHtml.parentElement) {
      // compute position on screen
      const widthHalf = window.innerWidth / 2,
        heightHalf = window.innerHeight / 2;
      const pOnScreen = this.object3D.getWorldPosition(new THREE.Vector3());
      pOnScreen.project(this.context.frame3D.camera);
      pOnScreen.x = pOnScreen.x * widthHalf + widthHalf;
      pOnScreen.y = -(pOnScreen.y * heightHalf) + heightHalf;

      this.noteMessageHtml.style.left = pOnScreen.x + 'px';
      this.noteMessageHtml.style.top = pOnScreen.y + 'px';
    }
  }

  onRemove() {
    this.noteMessageHtml.remove();
    this.containerButtons.remove();
  }
}
