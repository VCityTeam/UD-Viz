const { COMMAND, NAME } = require('./constant');
const { ScriptBase, Object3D } = require('@ud-viz/game_shared');

/**
 * @class Represents a script for handling drag and drop functionality of avatars.
 * @augments ScriptBase
 */
module.exports = class DragAndDropAvatar extends ScriptBase {
  /**
   * Initializes the DragAndDropAvatar script.
   */
  init() {
    /** @type {Object3D} */
    this.avatar = null;
  }

  /**
   * Handles the tick event.
   */
  tick() {
    // Add avatar when command to add avatar is received
    this.applyCommandCallbackOf(COMMAND.ADD_AVATAR, (data) => {
      this.avatar = new Object3D({
        name: NAME.AVATAR,
        components: {
          Render: {
            idRenderData: this.variables.idRenderDataAvatar,
          },
        },
      });
      if (!data) throw new Error('data is needed to add avatar');

      // Calculate world position relative to the context
      this.avatar.position.copy(data).sub(this.context.object3D.position);
      this.context.addObject3D(this.avatar);
    });

    // Remove avatar when command to remove avatar is received
    this.applyCommandCallbackOf(COMMAND.REMOVE_AVATAR, () => {
      this.context.removeObject3D(this.avatar.uuid);
    });
  }

  /**
   * Gets the script ID.
   *
   * @returns {string} The ID of the DragAndDropAvatar script.
   */
  static get ID_SCRIPT() {
    return 'drag_and_drop_avatar_id';
  }
};
