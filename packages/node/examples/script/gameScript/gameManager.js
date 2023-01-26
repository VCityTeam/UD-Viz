const { Core, Game } = require('../../../src/index');
const THREE = require('three'); // not sure about this maybe should be in Core

module.exports = class GameManager extends Core.Game.ScriptBase {
  init() {
    /** @type {object} - sockets object3D connected */
    this.socketObjects3D = {};

    this.context.on(Game.Thread.EVENT.ON_NEW_SOCKET_WRAPPER, (socketID) => {
      const newSocketObject3D = new Core.Game.Object3D({
        name: 'SocketObject3D',
        components: {
          Render: {
            idRenderData: 'sphere',
            color: [Math.random(), Math.random(), Math.random(), 0.5],
          },
          ExternalScript: {
            idScripts: ['PointerNote'],
            variables: {
              socketID: socketID,
              nameSocket: 'Default name',
              notes: [],
            },
          },
        },
      });
      newSocketObject3D.scale.set(10, 10, 10);
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

    this.context.commands.forEach((cmd) => {
      if (
        cmd.getType() == Core.Game.ScriptTemplate.Constants.COMMAND.ADD_NOTE
      ) {
        const data = cmd.getData();

        const socketObject3D = this.socketObjects3D[data.socketID];
        const externalGameScript = socketObject3D.getComponent(
          Core.Game.Component.ExternalScript.TYPE
        );
        externalGameScript.getModel().variables.notes.push({
          uuid: THREE.MathUtils.generateUUID(),
          position: data.position,
          scale: data.scale,
          message: data.message,
        });
      }
    });
  }
};
