const { ScriptBase, Object3D } = require('@ud-viz/game_shared');
const { constant } = require('@ud-viz/game_shared_template');
const { thread } = require('@ud-viz/game_node');

module.exports = class AvatarJitsiManager extends ScriptBase {
  init() {
    this.socketObjects3D = new Map();

    this.context.on(thread.MESSAGE_EVENT.ON_NEW_SOCKET_WRAPPER, (socketID) => {
      const newAvatarJitsi = new Object3D({
        static: false,
        components: {
          Render: {
            idRenderData: this.variables.idRenderDataAvatar,
            color: [Math.random(), Math.random(), Math.random(), 1],
          },
          ExternalScript: {
            scriptParams: [{ id: constant.ID_SCRIPT.AVATAR_JITSI }],
            variables: {
              domElement3D: this.variables.domElement3D,
              socketID: socketID,
            },
          },
        },
      });
      newAvatarJitsi.scale.set(100, 100, 100);
      this.context.addObject3D(newAvatarJitsi);
      this.socketObjects3D.set(socketID, newAvatarJitsi);
    });

    this.context.on(
      thread.MESSAGE_EVENT.ON_SOCKET_WRAPPER_REMOVE,
      (socketID) => {
        const avatarToRemove = this.socketObjects3D.get(socketID);
        this.context.removeObject3D(avatarToRemove.uuid);
        this.socketObjects3D.delete(socketID);
      }
    );
  }

  static get ID_SCRIPT() {
    return 'avatar_jitsi_manager_id';
  }
};
