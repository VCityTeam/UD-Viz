

let Shared;

module.exports = class Avatar {
  constructor(conf, SharedModule) {
    this.conf = conf;
    Shared = SharedModule;

    this.avatar = null;
  }

  init() {
    // A context containing all references needed for scripting game
    const worldContext = arguments[1];
    const world = worldContext.getWorld();

    this.avatar = new Shared.GameObject({
      name: 'avatar',
      components: {
        Render: { idRenderData: 'avatar' },
        LocalScript: {
          idScripts: [],
        },
      },
    });

    world.addGameObject(this.avatar, worldContext, world.getGameObject());
  }

  tick() {
    const worldContext = arguments[1];
    const dt = worldContext.getDt();
    const commands = worldContext.getCommands();
    const speedTranslate = 0.02;
    const speedRotate = 0.0006;
    const avatar = this.avatar;

    const ls = avatar.computeRoot().getComponent(Shared.LocalScript.TYPE);
    ls.conf.worldComputerDt = dt;

    commands.forEach(function (cmd) {
      switch (cmd.getType()) {
        case Shared.Command.TYPE.MOVE_FORWARD:
          // Console.log(dt * speedTranslate);
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
          // Console.log(dt * speedRotate);
          avatar.rotate(new Shared.THREE.Vector3(0, 0, speedRotate * dt));
          break;
        case Shared.Command.TYPE.MOVE_RIGHT:
          // Console.log(dt * speedRotate);
          avatar.rotate(new Shared.THREE.Vector3(0, 0, -speedRotate * dt));
          break;
        case Shared.Command.TYPE.Z_UPDATE:
          if (cmd.getData()) {
            const currentPos = avatar.getPosition();
            avatar.setPosition(
              new Shared.THREE.Vector3(
                currentPos.x,
                currentPos.y,
                cmd.getData()
              )
            );
          }
          break;
        default:
          throw new Error('command not handle ', cmd.getType());
      }
    });
  }
};
