import { ExternalScriptBase, Context } from '../../Context';
import * as THREE from 'three';
import { Command, Game, Data } from '@ud-viz/core';
import { Cameraman } from '../Component/Cameraman';
import { CommandController } from '../Component/CommandController';
import { computeRelativeElevationFromGround } from '../Component/Util';

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
    /** @type {Cameraman} */
    this.cameraman = new Cameraman(this.context.frame3D.camera);

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
    this.context.frame3D.appendToUI(this.dragAndDropElement);

    // drag and drop behavior
    this.context.frame3D.rootWebGL.ondragend = (event) => {
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

    // planar controls eat events (have to be disposed) => should be an issue for itowns
    this.dragAndDropElement.onmouseenter = () => {
      this.context.frame3D.enableItownsViewControls(false);
    };
    this.dragAndDropElement.onmouseleave = () => {
      if (this.avatar) return; // do reactivate control if there is an avatar
      this.context.frame3D.enableItownsViewControls(true);
    };
  }

  /**
   * It computes the elevation of the avatar and sends it to the game context
   */
  tick() {
    this.cameraman.tick(this.context.dt);

    if (this.avatar) {
      // send Z_Update to game context
      this.context.sendCommandToGameContext([
        new Command({
          type: Game.ScriptTemplate.Constants.COMMAND.Z_UPDATE,
          data: computeRelativeElevationFromGround(
            this.avatar,
            this.context.frame3D.itownsView.tileLayer,
            this.variables.update_z_crs
          ),
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
      this.context.frame3D.enableItownsViewControls(false);
      this.dragAndDropElement.remove();

      // record where was the camera
      this.itownsCameraPosition.copy(this.context.frame3D.camera.position);
      this.itownsCameraQuaternion.copy(this.context.frame3D.camera.quaternion);

      // traveling to focus avatar
      this.cameraman
        .moveToObject3D(
          this.avatar,
          this.variables.camera_duration,
          this.variables.camera_distance,
          this.variables.camera_offset,
          this.variables.camera_angle
        )
        .then((movementSucceed) => {
          if (!movementSucceed) throw new Error('cameraman error');

          this.cameraman.followObject3D(
            this.avatar,
            this.variables.camera_distance,
            this.variables.camera_offset,
            this.variables.camera_angle
          );

          // register command in input manager
          this.commandController.addNativeCommands();

          // add ui to switch back to planar controls
          this.context.frame3D.appendToUI(this.leaveAvatarModeButton);
        });
    } else {
      this.leaveAvatarModeButton.remove();
      this.commandController.removeNativeCommands();
      this.cameraman.stopFollowObject3D();

      this.cameraman
        .moveToTransform(
          this.itownsCameraPosition,
          this.itownsCameraQuaternion,
          this.variables.camera_duration
        )
        .then((movementSucceed) => {
          if (!movementSucceed) throw new Error('cameraman error');

          this.context.frame3D.appendToUI(this.dragAndDropElement);
          this.context.frame3D.enableItownsViewControls(true);
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
}
