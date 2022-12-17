const Core = require('../../src/index');

const stateInterpolator = new Core.Game.StateInterpolator(50); // delay
let lastXComputed = null;
const gameContext = new Core.Game.Context(
  {
    object: {
      static: false, // this object is going to move in 3D space
      components: {
        Script: {
          idScripts: ['Script'],
        },
      },
    },
  },
  {
    classScripts: [
      class Script extends Core.Game.ScriptBase {
        constructor(context, object3D, variables) {
          super(context, object3D, variables);

          this.previousState = null;
        }

        tick() {
          this.object3D.position.x += 1 * this.context.getDt();
          this.object3D.setOutdated(true); // indicate this object needs to be updated

          lastXComputed = this.object3D.position.x; //debug

          const state = this.context.toState();

          if (this.previousState) {
            const stateDiff = state.sub(this.previousState);
            stateInterpolator.onNewDiff(stateDiff);

            const rebuildState = this.previousState.add(stateDiff);

            if (!rebuildState.equals(state)) {
              console.log(state.getObject3D().matrix);
              console.log(rebuildState.getObject3D().matrix);
              console.log(stateDiff);

              throw new Error('state not equals');
            }
          } else {
            stateInterpolator.onFirstState(state);
          }

          this.previousState = state;
        }
      },
    ],
  }
);

gameContext.load().then(() => {
  const gameProcess = new Core.Component.ProcessInterval({ fps: 60 });
  gameProcess.start((dt) => {
    gameContext.step(dt);
  });

  let count = 0;
  const readerProcess = new Core.Component.ProcessInterval({ fps: 30 });
  readerProcess.start(() => {
    const states = stateInterpolator.computeCurrentStates();
    if (!states.length) return;
    const currentState = states[0];

    const currentX = currentState.getObject3D().position.x;

    if (count < 100) {
      count++;
      if (currentX > lastXComputed) {
        console.log(currentState.getObject3D().matrix);
        console.log('currentX = ', currentX);
        console.log('lastX computed = ', lastXComputed);

        throw new Error('currentX should be superior');
      }
    } else {
      process.exit(0);
    }

    console.log(count, -currentX + lastXComputed);
  });
});
