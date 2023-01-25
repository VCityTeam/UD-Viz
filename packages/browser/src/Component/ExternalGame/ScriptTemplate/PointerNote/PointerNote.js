import { ExternalScriptBase } from '../../Context';
import { Command, Game } from '@ud-viz/core';
import * as THREE from 'three';

export class PointerNote extends ExternalScriptBase {
  init() {
    console.log(this);

    /** @type {boolean} - determine if this is the socket script of the user */
    this.isSocketScript =
      this.variables.socketID == this.context.socketIOWrapper.socket.id;

    if (this.isSocketScript) {
      this.context.inputManager.addMouseCommand(
        'update_pointer_object3D',
        'mousemove',
        (event) => {
          // compute where the avatar should be teleported
          const worldPosition = new THREE.Vector3();
          this.context.frame3D.itownsView.getPickingPositionFromDepth(
            new THREE.Vector2(event.offsetX, event.offsetY),
            worldPosition
          );

          return new Command({
            type: Game.ScriptTemplate.Constants.COMMAND.UPDATE_TRANSFORM,
            data: {
              object3DUUID: this.object3D.uuid,
              position: worldPosition.sub(this.context.object3D.position), // position in game context referential
            },
          });
        }
      );
    }

    // ui
    const rootHtml = document.createElement('div');
    rootHtml.classList.add('root_html_pointer_note');

    // fetch root ui
    // const pointerNoteUI = this.context.
  }
}
