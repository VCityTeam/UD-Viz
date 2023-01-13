const Command = require('../../../Command');
const Object3D = require('../../Object3D');
const Constants = require('../Constants');
const THREE = require('three');

module.exports = {
  /**
   *
   * @param {Command[]} commands - native commands handle by script template
   * @param {Object3D} object3D - native commands handle by script template
   * @param {number} dt - delta time in ms
   */
  applyNativeCommands: function (commands, object3D, dt) {
    const SPEED_TRANSLATE = 0.04;
    const SPEED_ROTATE = 0.0006;

    commands.forEach((command) => {
      switch (command.type) {
        case Constants.COMMAND.MOVE_FORWARD:
          Object3D.moveForward(object3D, SPEED_TRANSLATE * dt);
          object3D.setOutdated(true);
          break;
        case Constants.COMMAND.MOVE_BACKWARD:
          Object3D.moveBackward(object3D, SPEED_TRANSLATE * dt);
          object3D.setOutdated(true);
          break;
        case Constants.COMMAND.ROTATE_LEFT:
          Object3D.rotate(object3D, new THREE.Vector3(0, 0, SPEED_ROTATE * dt));
          object3D.setOutdated(true);
          break;
        case Constants.COMMAND.ROTATE_RIGHT:
          Object3D.rotate(
            object3D,
            new THREE.Vector3(0, 0, -SPEED_ROTATE * dt)
          );
          object3D.setOutdated(true);
          break;
        case Constants.COMMAND.Z_UPDATE:
          if (command.data) {
            object3D.position.z = command.data;
            object3D.setOutdated(true);
          }
          break;
        default:
          break;
      }
    });
  },
};
