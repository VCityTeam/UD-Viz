import { UI } from '../note';
import { moveHtmlToWorldPosition } from '../../utils';

import { ScriptBase } from '@ud-viz/game_browser';
import { Command, RenderComponent } from '@ud-viz/game_shared';
import { constant } from '@ud-viz/game_shared_template';
import * as THREE from 'three';

import './style.css';

/** @classdesc - Manage note for a specific socket */
export class SocketService extends ScriptBase {
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
    this.domElement = document.createElement('div');
    this.domElement.classList.add('root_html_pointer_note');
    // fetch root ui

    const noteUI = this.context.findExternalScriptWithID(UI.ID_SCRIPT);
    noteUI.appendToHtml(this.domElement);

    // color
    const renderComp = pointerObject.getComponent(RenderComponent.TYPE);
    const colorPointer = renderComp.getModel().getColor();

    const contrastedColor = function (r, g, b) {
      // https://stackoverflow.com/a/3943023/112731
      return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? '#000000' : '#FFFFFF';
    };
    this.domElement.style.color = contrastedColor(
      colorPointer[0] * 255,
      colorPointer[1] * 255,
      colorPointer[2] * 255
    );
    this.domElement.style.backgroundColor =
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
      this.domElement.appendChild(nameInput);

      // to not conflict with other key event while typing
      nameInput.onfocus = () => {
        this.context.inputManager.setPause(true);
      };
      nameInput.onblur = () => {
        this.context.inputManager.setPause(false);
      };

      // edit name
      nameInput.onchange = () => {
        this.context.sendCommandsToGameContext([
          new Command({
            type: constant.COMMAND.UPDATE_EXTERNALSCRIPT_VARIABLES,
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
      this.nameLabel.innerText = this.variables.nameSocket;
      this.domElement.appendChild(this.nameLabel);
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
      this.domElement.appendChild(sphereScale);

      const sendCommandScale = (value) => {
        this.context.sendCommandsToGameContext([
          new Command({
            type: constant.COMMAND.UPDATE_TRANSFORM,
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

          const parentWorldPosition = new THREE.Vector3();
          pointerObject.parent.matrixWorld.decompose(
            parentWorldPosition,
            new THREE.Quaternion(),
            new THREE.Vector3()
          );

          return new Command({
            type: constant.COMMAND.UPDATE_TRANSFORM,
            data: {
              object3DUUID: pointerObject.uuid,
              position: worldPosition.sub(parentWorldPosition),
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
          this.menuEditNote.domElement.remove();
          this.menuEditNote = null;

          this.context.sendCommandsToGameContext([
            new Command({
              type: constant.COMMAND.ADD_NOTE,
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
          this.menuEditNote.domElement.remove();
          this.menuEditNote = null;
        });

        this.context.frame3D.domElementUI.appendChild(
          this.menuEditNote.domElement
        );
      });
    }
  }

  tick() {
    if (this.menuEditNote) {
      moveHtmlToWorldPosition(
        this.menuEditNote.domElement,
        this.menuEditNote.getWorldPosition().clone(),
        this.context.frame3D.camera
      );
    }
  }

  addNoteButton(el) {
    this.domElement.appendChild(el);
  }

  onOutdated() {
    if (this.nameLabel) {
      // update innerHtml name
      this.nameLabel.innerText = this.variables.nameSocket;
    }
  }

  onRemove() {
    this.domElement.remove();
  }

  static get ID_SCRIPT() {
    return constant.ID_SCRIPT.NOTE_SOCKET_SERVICE;
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

    this.domElement = document.createElement('div');
    this.domElement.classList.add('root_menu_message_note');

    this.textAreaMessage = document.createElement('textarea');
    this.domElement.appendChild(this.textAreaMessage);

    this.closeButton = document.createElement('button');
    this.closeButton.innerText = 'Close';
    this.domElement.appendChild(this.closeButton);

    this.addNoteButton = document.createElement('button');
    this.addNoteButton.innerText = 'Add note';
    this.domElement.appendChild(this.addNoteButton);

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
