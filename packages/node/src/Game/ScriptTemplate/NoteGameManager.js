const Shared = require('@ud-viz/shared');
const Game = require('../Game');
const THREE = require('three');

/**
 * @classdesc note game manager (add/remove socket game object + add note)
 */
module.exports = class NoteGameManager extends Shared.Game.ScriptBase {
  init() {
    /**
     * sockets object3D connected
     *
     @type {object} */
    this.socketObjects3D = {};

    this.context.on(Game.Thread.EVENT.ON_NEW_SOCKET_WRAPPER, (socketID) => {
      const pointerUUID = THREE.MathUtils.generateUUID();

      const newSocketObject3D = new Shared.Game.Object3D({
        static: true,
        components: {
          ExternalScript: {
            /**
             * to know this id 4 ways
             * import something from browser (hum kind of awkward)
             * create script constant in ud-viz/shared that browser and node could know (could be that)
             * pass it as variables (also like it but this force the host script to require("@ud-viz/browser") kind the same as 1st solution)
             * assume to let a string there (for now i did that as it's the more simplier way but the more dirty)
             *
             * what do you think ?
             */
            idScripts: ['note_service_id'],
            variables: {
              socketID: socketID, // to know in external script this is the socket pointer
              nameSocket: 'Default name',
              pointerUUID: pointerUUID, // to easily ref pointer in NoteService script
            },
          },
        },
      });

      const pointerObject3D = new Shared.Game.Object3D({
        uuid: pointerUUID,
        components: {
          Render: {
            idRenderData: 'sphere',
            color: [Math.random(), Math.random(), Math.random(), 0.5],
          },
        },
      });
      pointerObject3D.scale.set(50, 50, 50);
      newSocketObject3D.add(pointerObject3D);
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
    this.context.commands.forEach((cmd) => {
      if (
        cmd.getType() == Shared.Game.ScriptTemplate.Constants.COMMAND.ADD_NOTE
      ) {
        const data = cmd.getData();

        const socketObject3D = this.socketObjects3D[data.socketID];

        const note = new Shared.Game.Object3D({
          name: 'Note',
          static: true,
          userData: {
            isNote: true, // type this object
          },
          components: {
            Render: {
              idRenderData: 'sphere',
              color: data.color,
            },
            ExternalScript: {
              /**
               * same as above with note_service_id
               */
              idScripts: ['note_id'],
              variables: {
                message: data.message,
              },
            },
          },
        });
        note.position.copy(data.position);
        note.scale.copy(data.scale);

        socketObject3D.add(note);
      }
    });
  }

  static get CLASS_ID() {
    return 'note_game_manager_id';
  }
};
