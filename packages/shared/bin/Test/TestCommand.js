const Shared = require('../../src/index');

const COMMAND_TYPE = 'cmd_type';

const Script1 = class extends Shared.Game.ScriptBase {
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

const gameContext = new Shared.Game.Context(
  [Script1],
  new Shared.Game.Object3D({
    object: {
      name: 'Command Test',
      components: {
        GameScript: {
          idScripts: [Script1.ID_SCRIPT],
        },
      },
    },
  })
);

gameContext.load().then(() => {
  const processInterval = new Shared.ProcessInterval({ fps: 51 });
  processInterval.start((dt) => {
    gameContext.step(dt);
  });

  // wait a bit and send a command
  setTimeout(() => {
    gameContext.onCommands([
      new Shared.Command({
        type: COMMAND_TYPE,
      }),
    ]);
  }, 1000);
});
