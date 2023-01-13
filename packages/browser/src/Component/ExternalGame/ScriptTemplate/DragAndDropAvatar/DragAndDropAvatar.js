import { ExternalScriptBase } from '../../Context';
import * as THREE from 'three';
import { Command, Game, Data } from '@ud-viz/core';
import { Cameraman } from '../Component/Cameraman';
import { CommandController } from '../Component/CommandController';
import { computeRelativeElevationFromGround } from '../Component/Util';

import './DragAndDropAvatar.css';

const defaultVariables = {
  camera_duration: 2000,
  camera_offset: new THREE.Vector3(0, 0, 2),
  camera_angle: 0,
  camera_distance: 7,
  update_z_crs: 'EPSG:3946', // the one of lyon by default /!\ must have been define before
};

export class DragAndDropAvatar extends ExternalScriptBase {
  constructor(context, object3D, variables) {
    // Overwrite default variables
    const overWriteVariables = JSON.parse(JSON.stringify(defaultVariables));
    Data.objectOverWrite(overWriteVariables, variables);
    super(context, object3D, overWriteVariables);
  }

  init() {
    /** @type {Cameraman} - cameraman */
    this.cameraman = new Cameraman(this.context.frame3D.camera);

    /** @type {CommandController} - command controller */
    this.commandController = new CommandController(this.context.inputManager);

    /** @type {Game.Object3D} - avatar */
    this.avatar = null; // no avatar for now

    /** @type {THREE.Vector3} - record where was camera position */
    this.itownsCameraPosition = new THREE.Vector3();

    /** @type {THREE.Quaternion} - record where was camera quaternion */
    this.itownsCameraQuaternion = new THREE.Quaternion();

    /** @type {HTMLDivElement} - leave avatar mode button */
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

    /** @type {HTMLDivElement} - drag and drop avatar element */
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
          this.commandController.addCommand();

          // add ui to switch back to planar controls
          this.context.frame3D.appendToUI(this.leaveAvatarModeButton);
        });
    } else {
      this.leaveAvatarModeButton.remove();
      this.commandController.removeCommand();
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
