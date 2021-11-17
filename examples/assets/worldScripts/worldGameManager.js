/** @format */

let Shared;

module.exports = class WorldGameManager {
  constructor(conf, SharedModule) {
    this.conf = conf;
    Shared = SharedModule;

    this.zeppelin = null;
  }

  init() {
    //a context containing all references needed for scripting game
    const worldContext = arguments[1];
    const world = worldContext.getWorld();

    this.zeppelin = new Shared.GameObject({
      name: 'zeppelin',
      components: {
        Audio: {
          sounds: ['ballon_pop'],
        },
        WorldScript: {
          idScripts: ['zeppelin'],
        },
        LocalScript: {
          idScripts: ['zeppelin'],
          conf: { sphereCount: 0 },
        },
        Render: { idModel: 'zeppelin' },
        Collider: {
          shapes: [
            {
              type: 'Circle',
              center: { x: 0, y: 0 },
              radius: 10,
            },
          ],
        },
      },
    });

    world.addGameObject(this.zeppelin, worldContext, world.getGameObject());

    //add collectable sphere at random position
    const range = 400;
    const minRange = 50;
    for (let i = 0; i < 10; i++) {
      let x = (Math.random() - 0.5) * range;
      let y = (Math.random() - 0.5) * range;

      if (x > 0) {
        x += minRange;
      } else {
        x -= minRange;
      }

      if (y > 0) {
        y += minRange;
      } else {
        y -= minRange;
      }

      const s = this.createCollectableSphere(x, y);
      world.addGameObject(s, worldContext, world.getGameObject());
    }
  }

  createCollectableSphere(x, y) {
    const size = 10;

    const result = new Shared.GameObject({
      name: 'collectable_sphere',
      static: true,
      components: {
        Render: {
          idModel: 'sphere',
          color: [Math.random(), Math.random(), Math.random()],
        },
        Collider: {
          shapes: [
            {
              type: 'Circle',
              center: { x: 0, y: 0 },
              radius: size / 2,
            },
          ],
        },
      },
      transform: {
        position: [x, y, size],
        scale: [size, size, size],
      },
    });

    return result;
  }

  tick() {
    const worldContext = arguments[1];
    const dt = worldContext.getDt();
    const commands = worldContext.getCommands();
    const speedTranslate = 0.05;
    const speedRotate = 0.0005;
    const zeppelin = this.zeppelin;

    commands.forEach(function (cmd) {
      switch (cmd.getType()) {
        case Shared.Command.TYPE.MOVE_FORWARD:
          zeppelin.move(
            zeppelin.computeForwardVector().setLength(dt * speedTranslate)
          );
          break;
        case Shared.Command.TYPE.MOVE_BACKWARD:
          zeppelin.move(
            zeppelin.computeBackwardVector().setLength(dt * speedTranslate)
          );
          break;
        case Shared.Command.TYPE.MOVE_LEFT:
          zeppelin.rotate(new Shared.THREE.Vector3(0, 0, speedRotate * dt));
          break;
        case Shared.Command.TYPE.MOVE_RIGHT:
          zeppelin.rotate(new Shared.THREE.Vector3(0, 0, -speedRotate * dt));
          break;
        default:
          throw new Error('command not handle ', cmd.getType());
      }
    });
  }
};
