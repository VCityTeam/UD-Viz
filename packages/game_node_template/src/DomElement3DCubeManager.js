const { ScriptBase, Object3D } = require('@ud-viz/game_shared');
const { constant } = require('@ud-viz/game_shared_template');
const { thread } = require('@ud-viz/game_node');

/**
 * @class Manages the creation and removal of 3D cubes associated with DOM elements.
 * @augments ScriptBase
 */
module.exports = class DomElement3DCubeManager extends ScriptBase {
  /**
   * Creates and manages 3D cubes associated with DOM elements based on socket events.
   */
  init() {
    // Map to store Object3D instances associated with socket IDs
    this.socketObjects3D = new Map();

    // Event listener for when a new socket wrapper is created
    this.context.on(thread.MESSAGE_EVENT.ON_NEW_SOCKET_WRAPPER, (socketID) => {
      // Create a new Object3D for the cube
      const newAvatarJitsi = new Object3D({
        static: false,
        components: {
          Render: {
            idRenderData: this.variables.idRenderData,
            color: [Math.random(), Math.random(), Math.random(), 1],
          },
          ExternalScript: {
            scriptParams: [{ id: constant.ID_SCRIPT.DOM_ELEMENT_3D_CUBE_ID }],
            variables: {
              domElement3D: this.variables.domElement3D,
              socketID: socketID,
            },
          },
        },
      });
      // Set scale of the cube
      newAvatarJitsi.scale.set(100, 100, 100);
      // Add the cube to the context
      this.context.addObject3D(newAvatarJitsi);
      // Store the cube object with the corresponding socket ID in the map
      this.socketObjects3D.set(socketID, newAvatarJitsi);
    });

    // Event listener for when a socket wrapper is removed
    this.context.on(
      thread.MESSAGE_EVENT.ON_SOCKET_WRAPPER_REMOVE,
      (socketID) => {
        // Get the cube associated with the socket ID
        const avatarToRemove = this.socketObjects3D.get(socketID);
        // Remove the cube from the context
        this.context.removeObject3D(avatarToRemove.uuid);
        // Remove the cube object from the map
        this.socketObjects3D.delete(socketID);
      }
    );
  }

  /**
   * Static method to get the ID of the script.
   *
   * @returns {string} The ID of the DomElement3DCubeManager script.
   */
  static get ID_SCRIPT() {
    return 'dom_element_3d_cube_manager_id';
  }
};
