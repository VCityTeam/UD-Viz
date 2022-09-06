/** @format */

let Game;

module.exports = class WorldGameManager {
  constructor(conf, GameModule) {
    this.conf = conf;
    Game = GameModule;

    this.zeppelin = null;
  }

  init() {
    //A context containing all references needed for scripting game
    const worldContext = arguments[1];
    const world = worldContext.getWorld();

    this.zeppelin = new Game.GameObject({
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
        Render: { idRenderData: 'zeppelin' },
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

    //Add collectable sphere at random position
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

    const result = new Game.GameObject({
      name: 'collectable_sphere',
      static: true,
      components: {
        Render: {
          idRenderData: 'sphere',
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
        case Game.Command.TYPE.MOVE_FORWARD:
          zeppelin.move(
            zeppelin.computeForwardVector().setLength(dt * speedTranslate)
          );
          break;
        case Game.Command.TYPE.MOVE_BACKWARD:
          zeppelin.move(
            zeppelin.computeBackwardVector().setLength(dt * speedTranslate)
          );
          break;
        case Game.Command.TYPE.MOVE_LEFT:
          zeppelin.rotate(new Game.THREE.Vector3(0, 0, speedRotate * dt));
          break;
        case Game.Command.TYPE.MOVE_RIGHT:
          zeppelin.rotate(new Game.THREE.Vector3(0, 0, -speedRotate * dt));
          break;
        default:
          throw new Error('command not handle ', cmd.getType());
      }
    });
  }
};
