const Core = require('../../src/index');

const COMMAND_TYPE = 'cmd_type';

const gameContext = new Core.Game.Context(
  {
    object: {
      name: 'Command Test',
      components: {
        Script: {
          idScripts: ['CommandTest'],
        },
      },
    },
  },
  {
    classScripts: [
      class CommandTest extends Core.Game.ScriptBase {
        constructor(context, object3D, variables) {
          super(context, object3D, variables);
        }

        tick() {
          this.context.getCommands().forEach((cmd) => {
            switch (cmd.getType()) {
              case COMMAND_TYPE:
                process.exit(0);
                break;
              default:
                throw new Error('cmd type');
            }
          });
        }
      },
    ],
  }
);

gameContext.load().then(() => {
  const processInterval = new Core.Component.ProcessInterval({ fps: 51 });
  processInterval.start((dt) => {
    gameContext.step(dt);
  });

  // wait a bit and send a command
  setTimeout(() => {
    gameContext.onCommand([
      new Core.Component.Command({
        type: COMMAND_TYPE,
        data: 42,
      }),
    ]);
  }, 1000);
});
