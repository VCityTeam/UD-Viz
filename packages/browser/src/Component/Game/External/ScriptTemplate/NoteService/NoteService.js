import { ExternalScriptBase } from '../../Context';
import { Command, Game } from '@ud-viz/shared';
import * as THREE from 'three';

import './NoteService.css';
import { moveHtmlToWorldPosition } from '../Component/Util';

/** @classdesc - Manage note for a specific socket */
export class NoteService extends ExternalScriptBase {
  init() {
    /** 
     *  determine if this is the socket script of the user
     *  
     @type {boolean} */
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

      const sendCommandScale = (value) => {
        this.context.sendCommandToGameContext([
          new Command({
            type: Game.ScriptTemplate.Constants.COMMAND.UPDATE_TRANSFORM,
            data: {
              object3DUUID: pointerObject.uuid,
              scale: {
                x: value,
                y: value,
                z: value,
              },
            },
          }),
        ]);
      };

      sphereScale.onchange = () => {
        sendCommandScale(sphereScale.value);
      };

      this.context.inputManager.addKeyInput('+', 'keypress', () => {
        let newValue = pointerObject.scale.x + stepScale;
        newValue = Math.max(Math.min(newValue, maxScale), minScale);
        sendCommandScale(newValue);
        sphereScale.value = newValue; // update ui
      });

      this.context.inputManager.addKeyInput('-', 'keypress', () => {
        let newValue = pointerObject.scale.x - stepScale;
        newValue = Math.max(Math.min(newValue, maxScale), minScale);
        sendCommandScale(newValue);
        sphereScale.value = newValue; // update ui
      });

      // update pointer note position
      this.context.inputManager.addMouseCommand(
        'update_pointer_object3D',
        'mousemove',
        (event) => {
          const mouse = new THREE.Vector2(event.clientX, event.clientY);

          const worldPosition = new THREE.Vector3();
          this.context.frame3D.itownsView.getPickingPositionFromDepth(
            mouse,
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

      /** 
       * menu to edit note
       *  
       @type {MenuEditNote} */
      this.menuEditNote = null;
      this.context.inputManager.addKeyInput('n', 'keyup', () => {
        if (this.menuEditNote) return; // there is already a this.menuEditNote

        // register position and scale cursor
        const p = pointerObject.position.clone();
        const s = pointerObject.scale.clone();

        this.menuEditNote = new MenuEditNote(
          pointerObject.getWorldPosition(new THREE.Vector3())
        );

        this.menuEditNote.setAddNoteButtonCallback((message) => {
          this.menuEditNote.html().remove();
          this.menuEditNote = null;

          this.context.sendCommandToGameContext([
            new Command({
              type: Game.ScriptTemplate.Constants.COMMAND.ADD_NOTE,
              data: {
                socketID: this.variables.socketID,
                position: p,
                scale: s,
                color: colorPointer,
                message: message,
              },
            }),
          ]);
        });

        this.menuEditNote.setCloseButtonCallback(() => {
          this.menuEditNote.html().remove();
          this.menuEditNote = null;
        });

        this.context.frame3D.appendToUI(this.menuEditNote.html());
      });
    }
  }

  tick() {
    if (this.menuEditNote) {
      moveHtmlToWorldPosition(
        this.menuEditNote.html(),
        this.menuEditNote.getWorldPosition().clone(),
        this.context.frame3D.camera
      );
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

class MenuEditNote {
  /**
   *
   * @param {THREE.Vector3} worldPosition - where in scene this menu should be
   */
  constructor(worldPosition) {
    /** @type {THREE.Vector3} */
    this.worldPosition = worldPosition;

    this.rootHtml = document.createElement('div');
    this.rootHtml.classList.add('root_menu_message_note');

    this.textAreaMessage = document.createElement('textarea');
    this.rootHtml.appendChild(this.textAreaMessage);

    this.closeButton = document.createElement('button');
    this.closeButton.innerHTML = 'Close';
    this.rootHtml.appendChild(this.closeButton);

    this.addNoteButton = document.createElement('button');
    this.addNoteButton.innerHTML = 'Add note';
    this.rootHtml.appendChild(this.addNoteButton);

    this.textAreaMessage.focus(); // cant focus textarea force it there (patch)
  }

  /**
   *
   * @returns {THREE.Vector3} - menu position in world
   */
  getWorldPosition() {
    return this.worldPosition;
  }

  /**
   *
   * @returns {HTMLElement} - root html menu
   */
  html() {
    return this.rootHtml;
  }

  /**
   *
   * @param {Function} f - callback call when close button is clicked
   */
  setCloseButtonCallback(f) {
    this.closeButton.onclick = f;
  }

  /**
   * @callback addButtonNoteCallback
   * @param {string} textAreaValue - current value of the textarea
   */
  /**
   *
   * @param {addButtonNoteCallback} f - callback call when add note button is clicked (first param is the textarea value of menu)
   */
  setAddNoteButtonCallback(f) {
    this.addNoteButton.onclick = () => {
      f(this.textAreaMessage.value);
    };
  }
}
