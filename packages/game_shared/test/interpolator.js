const {
  ScriptBase,
  Object3D,
  Context,
  StateInterpolator,
} = require('../src/index');

const { ProcessInterval } = require('@ud-viz/utils_shared');

let lastXComputed = null;
const stateInterpolator = new StateInterpolator(50); // 50ms delay

const Script1 = class extends ScriptBase {
  constructor(context, object3D, variables) {
    super(context, object3D, variables);

    this.previousState = null;
  }

  tick() {
    this.object3D.position.x += 1;
    this.object3D.setOutdated(true); // indicate this object needs to be updated

    lastXComputed = this.object3D.position.x; // debug

    const state = this.context.toState();

    if (this.previousState) {
      const stateDiff = state.sub(this.previousState);

      // interpolator will received async state (like between a browser and a server )
      setTimeout(() => {
        stateInterpolator.onNewDiff(stateDiff);
      }, Math.random() * 100);

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

  static get ID_SCRIPT() {
    return 'ID CLASS';
  }
};

const gameContext = new Context(
  [Script1],
  new Object3D({
    object: {
      static: false, // this object is going to move in 3D space
      components: {
        GameScript: {
          scriptParams: [{ id: Script1.ID_SCRIPT }],
        },
      },
    },
  })
);

gameContext.load().then(() => {
  // game process here is a kind of server
  const gameProcess = new ProcessInterval({ fps: 60 });
  gameProcess.start((dt) => {
    gameContext.step(dt);
  });

  // a reader process connect in 1sec
  setTimeout(() => {
    let count = 0;
    // reader process here is a kind of browser client
    const readerProcess = new ProcessInterval({ fps: 30 });
    readerProcess.start(() => {
      const states = stateInterpolator.computeCurrentStates();
      if (!states.length) return;
      const currentState = states[0];

      const currentX = currentState.getObject3D().position.x;

      if (count < 20) {
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

      console.log(
        count,
        'x gameProcess = ',
        lastXComputed,
        ' x readerProcess = ',
        currentX,
        ' ping = ',
        stateInterpolator.getPing()
      );
    });
  }, 1000);
});
