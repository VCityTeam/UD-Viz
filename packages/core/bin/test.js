const Core = require('../src/index');
const STOP_TEST = 'stop';

console.log('@udviz/core begin test');

const engine = new Core.Game.Engine({ fps: 51 });
let currentIndex = 0;

const contexts = [
  new Core.Game.Context(
    {
      name: 'add object3D test',
      components: { Script: { idScripts: ['Test'] } },
    },
    {
      classScripts: [
        class Test extends Core.Game.ScriptBase {
          constructor(context, object3D, conf) {
            super(context, object3D, conf);
          }

          init() {
            this.context.addObject3D(new Core.Game.Object3D()).then(() => {
              this.context.dispatch(STOP_TEST, [1]);
            });
          }
        },
      ],
    }
  ),
  new Core.Game.Context(
    {
      name: 'compute state test',
      components: { Script: { idScripts: ['Test'] } },
      children: [
        {
          name: 'child1',
          components: { Script: { idScripts: ['ChildScript'] } },
        },
        {
          name: 'child2',
          components: { Script: { idScripts: ['ChildScript'] } },
        },
      ],
    },
    {
      classScripts: [
        class Test extends Core.Game.ScriptBase {
          constructor(context, object3D, conf) {
            super(context, object3D, conf);
          }

          init() {
            const state = this.context.toState();
            console.log(state);
          }
        },
        class ChildScript extends Core.Game.ScriptBase {
          constructor(context, object3D, conf) {
            super(context, object3D, conf);
          }

          init() {
            console.log('Hello from ', this.object3D.name);
          }
        },
      ],
    }
  ),
];

// first start
console.log(contexts[currentIndex].object3D.name + ' start');
engine.start(contexts[currentIndex]).catch((error) => {
  console.error(contexts[currentIndex].object3D.name + ' failed => ' + error);
  process.exit(1);
});

// recursive test
contexts[currentIndex].on(STOP_TEST, () => {
  console.log(contexts[currentIndex].object3D.name + ' succeed');
  // test finish
  engine.stop();
  currentIndex++;
  if (currentIndex < contexts.length) {
    console.log(contexts[currentIndex].object3D.name + ' start');
    engine.start(contexts[currentIndex]).catch((error) => {
      console.error(
        contexts[currentIndex].object3D.name + ' failed => ' + error
      );
      process.exit(1);
    });
  } else {
    process.exit(0);
  }
});
