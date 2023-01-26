import { ExternalScriptBase } from '../../Context';
import { Command, Game } from '@ud-viz/core';
import * as THREE from 'three';

import './PointerNote.css';
import { checkParentChild } from '../../../HTMLUtil';

export class PointerNote extends ExternalScriptBase {
  init() {
    /** @type {boolean} - determine if this is the socket script of the user */
    this.isSocketScript =
      this.variables.socketID == this.context.socketIOWrapper.socket.id;

    /** @type {Object<string,THREE.Mesh>} - notes of this pointer */
    this.notesBuffer = {};

    // ui
    this.rootHtml = document.createElement('div');
    this.rootHtml.classList.add('root_html_pointer_note');
    // fetch root ui
    const pointerNoteUI =
      this.context.findExternalScriptWithID('PointerNoteUI');
    pointerNoteUI.appendToHtml(this.rootHtml);

    // color
    const renderComp = this.object3D.getComponent(Game.Component.Render.TYPE);
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

      // edit name
      nameInput.onchange = () => {
        this.context.sendCommandToGameContext([
          new Command({
            type: Game.ScriptTemplate.Constants.COMMAND
              .UPDATE_EXTERNALSCRIPT_VARIABLES,
            data: {
              object3DUUID: this.object3D.uuid,
              nameVariable: 'nameSocket',
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
      const sphereScale = document.createElement('input');
      sphereScale.type = 'range';
      sphereScale.step = 0.01;
      sphereScale.min = 1;
      sphereScale.max = 1000;
      sphereScale.value = this.object3D.scale.x; // scale is the same on all dim
      this.rootHtml.appendChild(sphereScale);

      sphereScale.onchange = () => {
        this.context.sendCommandToGameContext([
          new Command({
            type: Game.ScriptTemplate.Constants.COMMAND.UPDATE_TRANSFORM,
            data: {
              object3DUUID: this.object3D.uuid,
              scale: {
                x: sphereScale.value,
                y: sphereScale.value,
                z: sphereScale.value,
              },
            },
          }),
        ]);
      };

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
              object3DUUID: this.object3D.uuid,
              position: worldPosition.sub(this.context.object3D.position), // position in game context referential
            },
          });
        }
      );

      // leave a note
      this.context.inputManager.addKeyInput('n', 'keyup', () => {
        const message = 'Un message';
        this.context.sendCommandToGameContext([
          new Command({
            type: Game.ScriptTemplate.Constants.COMMAND.ADD_NOTE,
            data: {
              position: this.object3D.position.clone(),
              scale: this.object3D.scale.clone(),
              message: message,
              socketID: this.variables.socketID,
            },
          }),
        ]);
      });
    }

    // note click
    const raycaster = new THREE.Raycaster();
    this.context.inputManager.addMouseInput(
      this.context.frame3D.getRootWebGL(),
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

        const belongTo = function (mesh, object) {
          let result = false;
          object.traverse((child) => {
            if (child == mesh) {
              result = true;
              return true;
            }
            return false;
          });
          return result;
        };

        for (const uuid in this.notesBuffer) {
          const note = this.notesBuffer[uuid];
          const i = raycaster.intersectObject(note.mesh);

          if (i.length && belongTo(i[0].object, note.mesh)) {
            console.log(note.message);
          }
        }
      }
    );

    this.buildNotes();
  }

  onOutdated() {
    if (this.nameLabel) {
      // update innerHtml name
      this.nameLabel.innerHTML = this.variables.nameSocket;
    }

    this.buildNotes();
  }

  buildNotes() {
    this.variables.notes.forEach((note) => {
      if (this.notesBuffer[note.uuid]) return; // already builded

      const mesh = this.context.assetManager
        .createRenderData('sphere')
        .getObject3D();

      mesh.scale.set(note.scale.x, note.scale.y, note.scale.z);
      mesh.position.set(note.position.x, note.position.y, note.position.z);
      const renderComp = this.object3D.getComponent(Game.Component.Render.TYPE);
      const color = renderComp.getModel().getColor();
      const threeColor = new THREE.Color().fromArray(color);
      mesh.traverse((child) => {
        if (child.material) {
          child.material.color = threeColor;
          if (color[3] < 1) {
            // handle opacity
            child.material.opacity = color[3];
            child.material.transparent = true;
            child.renderOrder = 1; // patch for futurologue not working
          } else {
            child.material.transparent = false;
          }
        }
      });

      // parent because we don't want note to move when pointer is moving
      this.object3D.parent.add(mesh);
      this.notesBuffer[note.uuid] = {
        mesh: mesh,
        message: note.message,
      };
    });
  }

  onRemove() {
    this.rootHtml.remove();
  }
}
