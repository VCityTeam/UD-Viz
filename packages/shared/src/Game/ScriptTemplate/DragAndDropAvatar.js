const ScriptBase = require('../Context').ScriptBase;
const Context = require('../Context').Context;
const Constants = require('./Constants');
const Object3D = require('../Object3D');
const { applyNativeCommands } = require('./Component/Component');

/**
 * @typedef DragAndDropAvatarVariables - what variables this script need to work
 * @property {string} idRenderDataAvatar - id render data of the avatar render data
 */

module.exports = class DragAndDropAvatar extends ScriptBase {
  /**
   * Handle game context operation of a drag and drop avatar feature
   *
   * @param {Context} context - game context
   * @param {Object3D} object3D - object3D attach to this script
   * @param {DragAndDropAvatarVariables} variables - variables
   */
  constructor(context, object3D, variables) {
    super(context, object3D, variables);

    this.avatar = null;
  }

  tick() {
    applyNativeCommands(this.context.commands, this.avatar, this.context.dt);

    // apply commands specific at drag and drop avatar
    this.context.commands.forEach((command) => {
      switch (command.type) {
        case Constants.COMMAND.ADD_AVATAR:
          this.avatar = new Object3D({
            name: Constants.NAME.AVATAR,
            components: {
              Render: {
                idRenderData: this.variables.idRenderDataAvatar,
              },
            },
          });
          this.avatar.position.copy(command.data);
          this.context.addObject3D(this.avatar);
          break;
        case Constants.COMMAND.REMOVE_AVATAR:
          this.context.removeObject3D(this.avatar.uuid);
          break;
        default:
      }
    });
  }
};
