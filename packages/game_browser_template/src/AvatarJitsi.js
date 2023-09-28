import { DomElement3D } from '@ud-viz/frame3d';
import { ScriptBase } from '@ud-viz/game_browser';
import {
  addNativeCommands,
  computeRelativeElevationFromGround,
} from '@ud-viz/game_browser_template';
import { Command, RenderComponent } from '@ud-viz/game_shared';
import { constant } from '@ud-viz/game_shared_template';

export class AvatarJitsi extends ScriptBase {
  init() {
    // add a domElement3D iframe instead of the face
    const renderController = this.object3D
      .getComponent(RenderComponent.TYPE)
      .getController();

    const iframe = document.createElement('iframe');
    iframe.src = './assets/html/billboard.html';

    // dom element 3d creation
    this.domEl3D = new DomElement3D(iframe, 10);
    this.domEl3D.position.set(
      this.variables.domElement3D.position.x,
      this.variables.domElement3D.position.y,
      this.variables.domElement3D.position.z
    );
    this.domEl3D.scale.set(
      this.variables.domElement3D.scale.x,
      this.variables.domElement3D.scale.y,
      this.variables.domElement3D.scale.z
    );
    this.domEl3D.rotation.set(
      this.variables.domElement3D.rotation.x,
      this.variables.domElement3D.rotation.y,
      this.variables.domElement3D.rotation.z
    );
    this.domEl3D.updateMatrixWorld();
    this.context.frame3D.appendDomElement3D(
      this.domEl3D,
      renderController.object3D
    );

    if (this.variables.socketID == this.context.socketIOWrapper.socket.id) {
      addNativeCommands(this.context.inputManager, this.object3D.uuid, false);
    }
  }

  tick() {
    this.context.sendCommandsToGameContext([
      new Command({
        type: constant.COMMAND.UPDATE_TRANSFORM,
        data: {
          object3DUUID: this.object3D.uuid,
          position: {
            z: computeRelativeElevationFromGround(
              this.object3D,
              this.context.frame3D.itownsView.tileLayer
            ),
          },
        },
      }),
    ]);
  }

  static get ID_SCRIPT() {
    return constant.ID_SCRIPT.AVATAR_JITSI;
  }
}
