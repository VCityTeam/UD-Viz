const { thread } = require('@ud-viz/game_node');
const { ScriptBase, Object3D } = require('@ud-viz/game_shared');

const GameContextScript = class extends ScriptBase {
  init() {
    console.log('hello from game context');

    this.goCubes = [];
    this.pause = false;
    setInterval(() => {
      if (this.pause) return;
      const newGOCube = new Object3D({
        components: {
          Render: {
            idRenderData: 'cube',
            color: [Math.random(), Math.random(), Math.random(), 1],
          },
        },
      });

      const size = Math.random() * 200 + 50;
      newGOCube.scale.set(size, size, size);
      this.goCubes.push(newGOCube);
      this.context.addObject3D(newGOCube);
    }, 3000);
  }

  tick() {
    this.applyCommandCallbackOf('toggle_pause', () => {
      this.pause = !this.pause;
    });

    if (this.pause) return;

    for (let index = this.goCubes.length - 1; index >= 0; index--) {
      const cube = this.goCubes[index];
      cube.position.z += 0.1 * this.context.dt;
      cube.setOutdated(true); // notify game external context that this gameobject need update

      // sky is the limit
      if (cube.position.z > 2000) {
        this.context.removeObject3D(cube.uuid);
        this.goCubes.splice(index, 1);
      }
    }
  }
  static get ID_SCRIPT() {
    return 'game_context_script';
  }
};

const child = new thread.Child();
child.start([GameContextScript]);
