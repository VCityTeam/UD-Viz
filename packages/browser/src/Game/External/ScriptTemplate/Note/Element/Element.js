import { ExternalScriptBase } from '../../../Context';
import { Game, Command } from '@ud-viz/shared';
import * as THREE from 'three';

import './Element.css';
import { CameraManager } from '../../CameraManager';
import { moveHtmlToWorldPosition } from '../../Component/Util';
import { SocketService } from '../SocketService/SocketService';

/** @classdesc - note game object script handle ui and some camera movement */
export class Element extends ExternalScriptBase {
  init() {
    // html message note
    this.noteMessageDomElement = document.createElement('div');
    this.noteMessageDomElement.classList.add('note_message');
    this.noteMessageDomElement.innerHTML = this.variables.message;

    // close note button
    const closeNoteButton = document.createElement('button');
    closeNoteButton.innerHTML = 'Close';
    this.noteMessageDomElement.appendChild(closeNoteButton);

    closeNoteButton.onclick = (event) => {
      event.stopImmediatePropagation();
      this.noteMessageDomElement.remove();
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

    /** 
     *
     * camera manager
     *  
     @type {CameraManager} */
    this.cameraManager = this.context.findExternalScriptWithID(
      CameraManager.ID_SCRIPT
    );
    noteButton.onclick = () => {
      this.context.frame3D.itownsView.controls.enabled = false;
      this.cameraManager
        .moveToBoundingBox(new THREE.Box3().setFromObject(this.object3D), 1500)
        .then(() => {
          this.context.frame3D.itownsView.controls.enabled = true;
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
      .getScripts()[SocketService.ID_SCRIPT];

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
    this.context.frame3D.domElementUI.appendChild(this.noteMessageDomElement);
  }

  tick() {
    if (this.noteMessageDomElement.parentElement) {
      moveHtmlToWorldPosition(
        this.noteMessageDomElement,
        this.object3D.getWorldPosition(new THREE.Vector3()),
        this.context.frame3D.camera
      );
    }
  }

  onRemove() {
    this.noteMessageDomElement.remove();
    this.containerButtons.remove();
  }

  static get ID_SCRIPT() {
    return Game.ScriptTemplate.Constants.ID_SCRIPT.NoteElement;
  }
}
