import { ExternalScriptBase } from '../Context';
import { Game, Command } from '@ud-viz/core';
import { Cameraman } from './ScriptTemplate';
import * as THREE from 'three';

export class Note extends ExternalScriptBase {
  init() {
    this.containerButtons = document.createElement('div');

    // create ui button in parent object
    const noteButton = document.createElement('button');

    const threshold = 10;
    if (this.variables.message.length <= threshold) {
      noteButton.innerHTML = this.variables.message + '';
    } else {
      noteButton.innerHTML = this.variables.message.slice(0, threshold) + '...'; // display a part of the message
    }

    this.cameraman = new Cameraman(this.context.frame3D.camera);
    noteButton.onclick = () => {
      this.context.frame3D.enableItownsViewControls(false);
      this.cameraman
        .moveToBoundingBox(new THREE.Box3().setFromObject(this.object3D), 1500)
        .then(() => {
          this.context.frame3D.enableItownsViewControls(true);
          this.context.frame3D.itownsView.notifyChange(
            this.context.frame3D.camera
          );
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

  tick() {
    this.cameraman.tick(this.context.dt);
  }

  onRemove() {
    this.containerButtons.remove();
  }
}
