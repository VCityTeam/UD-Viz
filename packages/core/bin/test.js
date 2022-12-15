const Core = require('../src/index');
const TEST_SUCCEED = 'TEST_SUCCEED';

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
            const object = new Core.Game.Object3D();
            this.context.addObject3D(object).then(() => {
              this.context.removeObject3D(object.uuid);
              this.context.dispatch(TEST_SUCCEED);
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
          components: {
            Script: {
              idScripts: ['ChildScript'],
            },
            Collider: {
              shapes: [
                {
                  type: 'Polygon',
                  points: [
                    {
                      x: 8.693783728871495,
                      y: -2.031569980084896,
                      z: -2.99509596824646,
                    },
                    {
                      x: 8.566316776908934,
                      y: 2.176378423348069,
                      z: -2.99509596824646,
                    },
                    {
                      x: 4.552634104620665,
                      y: 2.2362968921661377,
                      z: -2.99509596824646,
                    },
                    {
                      x: 4.446006354875863,
                      y: -2.1714045675471425,
                      z: -2.99509596824646,
                    },
                  ],
                },
                { type: 'Circle', center: { x: 0, y: 0 }, radius: 10 },
              ],
              body: true,
            },
          },
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
            const state1 = this.context.toState();
            if (!state1.includes(this.context.object3D.uuid))
              throw new Error('State.includes error');

            // modify object model
            const child2 = this.context.object3D.getObjectByName('child2');
            this.context.removeObject3D(child2.uuid);
            const child1 = this.context.object3D.getObjectByName('child1');
            child1.setOutdated(true);

            const state2 = this.context.toState();
            if (state2.includes(child2.uuid))
              throw new Error('child2 not remove');

            const diff = state2.toDiff(state1);

            const rebuildState = state1.add(diff);

            if (!rebuildState.equals(state2))
              throw new Error('state not well rebuild');

            this.context.dispatch(TEST_SUCCEED);
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
contexts.forEach((context) => {
  context.on(TEST_SUCCEED, () => {
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
});
