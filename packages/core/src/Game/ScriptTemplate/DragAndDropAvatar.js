const ScriptBase = require('../Context').ScriptBase;
const Constants = require('./Constants');
const Object3D = require('../Object3D');
const THREE = require('three');

/**
 * @typedef DragAndDropAvatarVariables - what variables this script need to work
 * @property {string} idRenderDataAvatar - id render data of the avatar render data
 */

const SPEED_TRANSLATE = 0.04;
const SPEED_ROTATE = 0.0006;

module.exports = class DragAndDropAvatar extends ScriptBase {
  constructor(context, object3D, variables) {
    super(context, object3D, variables);

    this.avatar = null;
  }

  tick() {
    this.context.commands.forEach((command) => {
      switch (command.type) {
        case Constants.COMMAND.MOVE_FORWARD:
          Object3D.moveForward(this.avatar, SPEED_TRANSLATE * this.context.dt);
          this.avatar.setOutdated(true);
          break;
        case Constants.COMMAND.MOVE_BACKWARD:
          Object3D.moveBackward(this.avatar, SPEED_TRANSLATE * this.context.dt);
          this.avatar.setOutdated(true);
          break;
        case Constants.COMMAND.ROTATE_LEFT:
          Object3D.rotate(
            this.avatar,
            new THREE.Vector3(0, 0, SPEED_ROTATE * this.context.dt)
          );
          this.avatar.setOutdated(true);
          break;
        case Constants.COMMAND.ROTATE_RIGHT:
          Object3D.rotate(
            this.avatar,
            new THREE.Vector3(0, 0, -SPEED_ROTATE * this.context.dt)
          );
          this.avatar.setOutdated(true);
          break;
        case Constants.COMMAND.Z_UPDATE:
          if (command.data) {
            this.avatar.position.z = command.data;
            this.avatar.setOutdated(true);
          }
          break;
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
