/** @format */

let Shared;

module.exports = class Avatar {
  constructor(conf, SharedModule) {
    this.conf = conf;
    Shared = SharedModule;

    this.avatar = null;
  }

  init() {
    //a context containing all references needed for scripting game
    const worldContext = arguments[1];
    const world = worldContext.getWorld();

    this.avatar = new Shared.GameObject({
      name: 'avatar',
      components: {
        Render: { idModel: 'avatar' },
      },
    });

    world.addGameObject(this.avatar, worldContext, world.getGameObject());
  }

  tick() {
    const worldContext = arguments[1];
    const dt = worldContext.getDt();
    const commands = worldContext.getCommands();
    const speedTranslate = 0.01;
    const speedRotate = 0.0003;
    const avatar = this.avatar;
    commands.forEach(function (cmd) {
      switch (cmd.getType()) {
        case Shared.Command.TYPE.MOVE_FORWARD:
          avatar.move(
            avatar.computeForwardVector().setLength(dt * speedTranslate)
          );
          break;
        case Shared.Command.TYPE.MOVE_BACKWARD:
          avatar.move(
            avatar.computeBackwardVector().setLength(dt * speedTranslate)
          );
          break;
        case Shared.Command.TYPE.MOVE_LEFT:
          avatar.rotate(new Shared.THREE.Vector3(0, 0, speedRotate * dt));
          break;
        case Shared.Command.TYPE.MOVE_RIGHT:
          avatar.rotate(new Shared.THREE.Vector3(0, 0, -speedRotate * dt));
          break;
        default:
          throw new Error('command not handle ', cmd.getType());
      }
    });

    const aPos = this.avatar.getPosition();
    aPos.z = -132;
    this.avatar.setPosition(aPos);
  }
};
