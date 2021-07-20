/** @format */

let Shared;

module.exports = class WorldGameManager {
  constructor(conf, SharedModule) {
    this.conf = conf;
    Shared = SharedModule;

    this.zeppelin = null;
  }

  init() {
    const worldContext = arguments[1];
    const world = worldContext.getWorld();

    this.zeppelin = new Shared.GameObject({
      name: 'zeppelin',
      components: {
        Render: { idModel: 'zeppelin' },
      },
    });

    world.addGameObject(this.zeppelin, worldContext, world.getGameObject());
  }

  tick() {
    const worldContext = arguments[1];
    const dt = worldContext.getDt();
    const commands = worldContext.getCommands();
    const speed = 1;
    const zeppelin = this.zeppelin;

    commands.forEach(function (cmd) {
      switch (cmd.getType()) {
        case Shared.Command.TYPE.MOVE_FORWARD:
          zeppelin.move(zeppelin.computeForwardVector().setLength(dt * speed));
          break;
        case Shared.Command.TYPE.MOVE_LEFT:
          zeppelin.move(
            zeppelin
              .computeForwardVector()
              .applyAxisAngle(new Shared.THREE.Vector3(0, 0, 1), Math.PI * 0.5)
              .setLength(dt * speed)
          );
          break;
        case Shared.Command.TYPE.MOVE_RIGHT:
          zeppelin.move(
            zeppelin
              .computeForwardVector()
              .applyAxisAngle(new Shared.THREE.Vector3(0, 0, 1), -Math.PI * 0.5)
              .setLength(dt * speed)
          );
          break;
        case Shared.Command.TYPE.MOVE_BACKWARD:
          zeppelin.move(zeppelin.computeBackwardVector().setLength(dt * speed));
          break;
        default:
          throw new Error('command not handle ', cmd.getType());
      }
    });
  }
};
