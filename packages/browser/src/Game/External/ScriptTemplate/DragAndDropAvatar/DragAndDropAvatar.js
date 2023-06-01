import { ExternalScriptBase, Context } from '../../Context';
import * as THREE from 'three';
import { Command, Game, Data } from '@ud-viz/shared';
import { CommandController } from '../Component/CommandController';
import { computeRelativeElevationFromGround } from '../Component/Util';
import { CameraManager } from '../CameraManager';

import './DragAndDropAvatar.css';

/**
 * @typedef DragAndDropAvatarVariables
 * @property {number} camera_duration - time for camera movement in ms
 * @property {{x:number,y:number,z:number}} camera_offset - offset to positioned camera behind object3D
 * @property {number} camera_angle - angle on x to positioned camera behind object3D
 * @property {number} camera_distance - distance to positioned camera behind object3D
 * @property {string} update_z_crs - projection used to update z elevation of avatar
 */

/** @type {DragAndDropAvatarVariables}*/
const defaultVariables = {
  camera_duration: 2000,
  camera_offset: { x: 0, y: 0, z: 2 },
  camera_angle: 0,
  camera_distance: 7,
  update_z_crs: 'EPSG:3946', // the one of lyon by default /!\ must have been define before
};

/** @class */
export class DragAndDropAvatar extends ExternalScriptBase {
  /**
   * Drag and drop ui element in city to pass in avatar mode
   *
   * @param {Context} context - external game context
   * @param {Game.Object3D} object3D - object3D attach to this script
   * @param {DragAndDropAvatarVariables} variables - variables of script
   */
  constructor(context, object3D, variables) {
    // Overwrite default variables
    const overWriteVariables = JSON.parse(JSON.stringify(defaultVariables));
    Data.objectOverWrite(overWriteVariables, variables);
    super(context, object3D, overWriteVariables);
  }

  init() {
    /**
     * camera manager
     *  
     @type {CameraManager} */
    this.cameraManager = this.context.findExternalScriptWithID(
      CameraManager.ID_SCRIPT
    );
    if (!this.cameraManager)
      throw new Error(
        'this script is dependent of CameraManager script template'
      );

    /** @type {CommandController} */
    this.commandController = new CommandController(this.context.inputManager);

    /** @type {Game.Object3D} */
    this.avatar = null; // no avatar for now

    /** @type {THREE.Vector3} */
    this.itownsCameraPosition = new THREE.Vector3();

    /**
     * record where was camera quaternion
     *
     * @type {THREE.Quaternion}
     */
    this.itownsCameraQuaternion = new THREE.Quaternion();

    /** @type {HTMLDivElement} */
    this.leaveAvatarModeButton = document.createElement('button');
    this.leaveAvatarModeButton.innerHTML = 'Leave avatar mode';
    this.leaveAvatarModeButton.classList.add('leave_avatar_mode');
    this.leaveAvatarModeButton.onclick = () => {
      if (!this.avatar) return;

      this.context.sendCommandToGameContext([
        new Command({
          type: Game.ScriptTemplate.Constants.COMMAND.REMOVE_AVATAR,
        }),
      ]);
    };

    /** @type {HTMLDivElement} */
    this.dragAndDropElement = document.createElement('div');
    this.dragAndDropElement.classList.add('drag_and_drop_avatar');
    this.dragAndDropElement.innerHTML = 'Drag And Drop Avatar';
    this.dragAndDropElement.draggable = true;

    /** @type {HTMLElement} */
    this.domElement = this.context.userData.dragAndDropAvatarRootHtml;

    // append drag and drop element
    this.appendToHtml(this.dragAndDropElement);

    // drag and drop behavior
    this.context.frame3D.domElement.ondragend = (event) => {
      if (event.target != this.dragAndDropElement) return;

      // compute where the avatar should be teleported
      const worldPosition = new THREE.Vector3();
      this.context.frame3D.itownsView.getPickingPositionFromDepth(
        new THREE.Vector2(event.offsetX, event.offsetY),
        worldPosition
      );

      // add an avatar
      this.context.sendCommandToGameContext([
        new Command({
          type: Game.ScriptTemplate.Constants.COMMAND.ADD_AVATAR,
          data: worldPosition.sub(this.context.object3D.position), // position in game context referential
        }),
      ]);
    };
  }

  appendToHtml(el) {
    if (this.domElement) {
      this.domElement.appendChild(el);
    } else {
      this.context.frame3D.domElementUI.appendChild(el);
    }
  }

  /**
   * It computes the elevation of the avatar and sends it to the game context
   */
  tick() {
    if (this.avatar) {
      // send Z_Update to game context
      this.context.sendCommandToGameContext([
        new Command({
          type: Game.ScriptTemplate.Constants.COMMAND.UPDATE_TRANSFORM,
          data: {
            object3DUUID: this.avatar.uuid,
            position: {
              z: computeRelativeElevationFromGround(
                this.avatar,
                this.context.frame3D.itownsView.tileLayer,
                this.variables.update_z_crs
              ),
            },
          },
        }),
      ]);
    }
  }

  /**
   * Update state of this based on there is an avatar or not
   *
   * @param {Game.Object3D} avatar - avatar game object3D
   */
  setAvatar(avatar) {
    this.avatar = avatar;

    if (this.avatar) {
      // disable itowns controls
      this.context.frame3D.itownsView.controls.enabled = false;
      this.dragAndDropElement.remove();

      // record where was the camera
      this.itownsCameraPosition.copy(this.context.frame3D.camera.position);
      this.itownsCameraQuaternion.copy(this.context.frame3D.camera.quaternion);

      // traveling to focus avatar
      this.cameraManager
        .moveToObject3D(
          this.avatar,
          this.variables.camera_duration,
          this.variables.camera_distance,
          this.variables.camera_offset,
          this.variables.camera_angle
        )
        .then((movementSucceed) => {
          if (!movementSucceed) throw new Error('camera manager error');

          this.cameraManager.followObject3D(
            this.avatar,
            this.variables.camera_distance,
            this.variables.camera_offset,
            this.variables.camera_angle
          );

          // register command in input manager
          this.commandController.addNativeCommands(this.avatar.uuid);

          // add ui to switch back to planar controls
          this.appendToHtml(this.leaveAvatarModeButton);
        });
    } else {
      this.leaveAvatarModeButton.remove();
      this.commandController.removeNativeCommands();
      this.cameraManager.stopFollowObject3D();

      this.cameraManager
        .moveToTransform(
          this.itownsCameraPosition,
          this.itownsCameraQuaternion,
          this.variables.camera_duration
        )
        .then((movementSucceed) => {
          if (!movementSucceed) throw new Error('camera manager error');

          this.appendToHtml(this.dragAndDropElement);
          this.context.frame3D.itownsView.controls.enabled = true;
        });
    }
  }

  onGameObjectRemoved(goRemoved) {
    if (goRemoved.name === Game.ScriptTemplate.Constants.NAME.AVATAR) {
      this.setAvatar(null);
    }
  }

  onNewGameObject(newGO) {
    // check if this is the avatar
    if (newGO.name === Game.ScriptTemplate.Constants.NAME.AVATAR) {
      this.setAvatar(newGO);
    }
  }

  static get ID_SCRIPT() {
    return 'drag_and_drop_avatar_id';
  }
}
