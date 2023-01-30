import { ExternalScriptBase } from '../../Context';
import { Command, Game } from '@ud-viz/core';
import * as THREE from 'three';

import './NoteService.css';

export class NoteService extends ExternalScriptBase {
  init() {
    /** @type {boolean} - determine if this is the socket script of the user */
    this.isSocketScript =
      this.variables.socketID == this.context.socketIOWrapper.socket.id;

    const pointerObject = this.object3D.getObjectByProperty(
      'uuid',
      this.variables.pointerUUID
    );

    // ui
    this.rootHtml = document.createElement('div');
    this.rootHtml.classList.add('root_html_pointer_note');
    // fetch root ui
    const noteUI = this.context.findExternalScriptWithID('NoteUI');
    noteUI.appendToHtml(this.rootHtml);

    // color
    const renderComp = pointerObject.getComponent(Game.Component.Render.TYPE);
    const colorPointer = renderComp.getModel().getColor();

    const contrastedColor = function (r, g, b) {
      // https://stackoverflow.com/a/3943023/112731
      return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? '#000000' : '#FFFFFF';
    };
    this.rootHtml.style.color = contrastedColor(
      colorPointer[0] * 255,
      colorPointer[1] * 255,
      colorPointer[2] * 255
    );
    this.rootHtml.style.backgroundColor =
      'rgb(' +
      colorPointer[0] * 255 +
      ',' +
      colorPointer[1] * 255 +
      ',' +
      colorPointer[2] * 255 +
      ')';

    if (this.isSocketScript) {
      const nameInput = document.createElement('input');
      nameInput.setAttribute('type', 'text');
      nameInput.value = this.variables.nameSocket;
      this.rootHtml.appendChild(nameInput);

      // to not conflict with other key event while typing
      nameInput.onfocus = () => {
        this.context.inputManager.setPause(true);
      };
      nameInput.onblur = () => {
        this.context.inputManager.setPause(false);
      };

      // edit name
      nameInput.onchange = () => {
        this.context.sendCommandToGameContext([
          new Command({
            type: Game.ScriptTemplate.Constants.COMMAND
              .UPDATE_EXTERNALSCRIPT_VARIABLES,
            data: {
              object3DUUID: this.object3D.uuid,
              variableName: 'nameSocket',
              variableValue: nameInput.value,
            },
          }),
        ]);
      };
    } else {
      this.nameLabel = document.createElement('div');
      this.nameLabel.innerHTML = this.variables.nameSocket;
      this.rootHtml.appendChild(this.nameLabel);
    }

    // edit pointer sphere attr ui
    if (this.isSocketScript) {
      const stepScale = 2;
      const minScale = 1;
      const maxScale = 500;

      const sphereScale = document.createElement('input');
      sphereScale.type = 'range';
      sphereScale.step = stepScale;
      sphereScale.min = minScale;
      sphereScale.max = maxScale;
      sphereScale.value = pointerObject.scale.x; // scale is the same on all dim
      this.rootHtml.appendChild(sphereScale);

      sphereScale.onchange = () => {
        this.context.sendCommandToGameContext([
          new Command({
            type: Game.ScriptTemplate.Constants.COMMAND.UPDATE_TRANSFORM,
            data: {
              object3DUUID: pointerObject.uuid,
              scale: {
                x: sphereScale.value,
                y: sphereScale.value,
                z: sphereScale.value,
              },
            },
          }),
        ]);
      };

      this.context.inputManager.addKeyInput('+', 'keypress', () => {
        let newValue = pointerObject.scale.x + stepScale;
        newValue = Math.max(Math.min(newValue, maxScale), minScale);
        this.context.sendCommandToGameContext([
          new Command({
            type: Game.ScriptTemplate.Constants.COMMAND.UPDATE_TRANSFORM,
            data: {
              object3DUUID: pointerObject.uuid,
              scale: {
                x: newValue,
                y: newValue,
                z: newValue,
              },
            },
          }),
        ]);
        sphereScale.value = newValue; // update ui
      });

      this.context.inputManager.addKeyInput('-', 'keypress', () => {
        let newValue = pointerObject.scale.x - stepScale;
        newValue = Math.max(Math.min(newValue, maxScale), minScale);
        this.context.sendCommandToGameContext([
          new Command({
            type: Game.ScriptTemplate.Constants.COMMAND.UPDATE_TRANSFORM,
            data: {
              object3DUUID: pointerObject.uuid,
              scale: {
                x: newValue,
                y: newValue,
                z: newValue,
              },
            },
          }),
        ]);
        sphereScale.value = newValue; // update ui
      });

      // update pointer note position
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
              object3DUUID: pointerObject.uuid,
              position: worldPosition.sub(this.context.object3D.position), // position in game context referential
            },
          });
        }
      );

      // leave a note
      let menu = null;
      this.context.inputManager.addKeyInput('n', 'keyup', () => {
        if (menu) return; // there is already a menu
        this.context.frame3D.enableItownsViewControls(false);

        // register position and scale cursor
        const p = pointerObject.position.clone();
        const s = pointerObject.scale.clone();

        // compute position on screen
        const widthHalf = window.innerWidth / 2,
          heightHalf = window.innerHeight / 2;
        const pOnScreen = pointerObject.getWorldPosition(new THREE.Vector3());
        pOnScreen.project(this.context.frame3D.camera);
        pOnScreen.x = pOnScreen.x * widthHalf + widthHalf;
        pOnScreen.y = -(pOnScreen.y * heightHalf) + heightHalf;

        // create a menu to edit message note
        menu = document.createElement('div');
        menu.classList.add('root_menu_message_note');
        menu.style.left = pOnScreen.x + 'px';
        menu.style.top = pOnScreen.y + 'px';
        this.context.frame3D.appendToUI(menu);

        const textAreaMessage = document.createElement('textarea');
        menu.appendChild(textAreaMessage);

        const cancelButton = document.createElement('button');
        cancelButton.innerHTML = 'Cancel';
        menu.appendChild(cancelButton);

        const closeMenu = () => {
          this.context.frame3D.enableItownsViewControls(true);
          menu.remove();
          menu = null;
        };

        cancelButton.onclick = closeMenu;

        const addNoteButton = document.createElement('button');
        addNoteButton.innerHTML = 'Add note';
        menu.appendChild(addNoteButton);

        addNoteButton.onclick = () => {
          closeMenu();
          this.context.sendCommandToGameContext([
            new Command({
              type: Game.ScriptTemplate.Constants.COMMAND.ADD_NOTE,
              data: {
                socketID: this.variables.socketID,
                position: p,
                scale: s,
                color: colorPointer,
                message: textAreaMessage.value,
              },
            }),
          ]);
        };
      });
    }
  }

  addNoteButton(el) {
    this.rootHtml.appendChild(el);
  }

  onOutdated() {
    if (this.nameLabel) {
      // update innerHtml name
      this.nameLabel.innerHTML = this.variables.nameSocket;
    }
  }

  onRemove() {
    this.rootHtml.remove();
  }
}
