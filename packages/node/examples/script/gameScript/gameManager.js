const { Core, Game } = require('../../../src/index');

module.exports = class GameManager extends Core.Game.ScriptBase {
  init() {
    /** @type {Array} - sockets object3D connected */
    this.socketObjects3D = {};

    this.context.on(Game.Thread.EVENT.ON_NEW_SOCKET_WRAPPER, (socketID) => {
      const newSocketObject3D = new Core.Game.Object3D({
        name: 'SocketObject3D',
        components: {
          Render: {
            idRenderData: 'sphere',
          },
          ExternalScript: {
            idScripts: ['MultiPointerItowns'],
            variables: {
              socketID: socketID,
            },
          },
        },
      });
      newSocketObject3D.scale.set(100, 100, 100);
      this.context.addObject3D(newSocketObject3D);
      this.socketObjects3D[socketID] = newSocketObject3D;
    });

    this.context.on(Game.Thread.EVENT.ON_SOCKET_WRAPPER_REMOVE, (socketID) => {
      const object3DToRemove = this.socketObjects3D[socketID];
      delete this.socketObjects3D[socketID];
      this.context.removeObject3D(object3DToRemove.uuid);
    });
  }

  tick() {
    Core.Game.ScriptTemplate.Component.applyNativeCommands(this.context);
  }
};
