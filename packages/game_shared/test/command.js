const { ScriptBase, Context, Object3D, Command } = require('../src/index');
const { ProcessInterval } = require('@ud-viz/utils_shared');

const COMMAND_TYPE = 'cmd_type';

const Script1 = class extends ScriptBase {
  constructor(context, object3D, variables) {
    super(context, object3D, variables);
  }

  onCommand(type, data) {
    switch (type) {
      case COMMAND_TYPE:
        console.log(data);
        process.exit(0);
        break;
      default:
        throw new Error('cmd type');
    }
  }

  static get ID_SCRIPT() {
    return 'Command test script';
  }
};

const gameContext = new Context(
  [Script1],
  new Object3D({
    object: {
      name: 'Command Test',
      components: {
        GameScript: {
          scriptParams: [{ id: Script1.ID_SCRIPT }],
        },
      },
    },
  })
);

gameContext.load().then(() => {
  const processInterval = new ProcessInterval({ fps: 51 });
  processInterval.start((dt) => {
    gameContext.step(dt);
  });

  // wait a bit and send a command
  setTimeout(() => {
    gameContext.onCommands([
      new Command({
        type: COMMAND_TYPE,
      }),
    ]);
  }, 1000);
});
