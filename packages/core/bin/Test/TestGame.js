//create a gameprocess
//create a controllerprocess
//controller send command to gameprocess to move object which are are going to collide with another one
//when the collision happen gameprocess edit variables of an externalscript
//controller process check the change of the variables of the externalscript to exit 0

const Core = require('../../src/index');
const ScriptController =
  require('../../src/Game/Object3D/Components/Script').Controller;
const ExternalScriptComponentTYPE =
  require('../../src/Game/Object3D/Components/ExternalScript').Component.TYPE;

const gameContext = new Core.Game.Context(
  [
    class ExternalScriptTest extends Core.Game.ScriptBase {
      constructor(context, object3D, variables) {
        super(context, object3D, variables);
      }

      tick() {
        console.log('step');
      }
    },
  ],
  {
    object: {
      name: 'GameObjectTest',
      components: {
        ExternalScript: {
          idScripts: ['ExternalScriptTest'],
        },
        GameScript: {
          idScripts: ['ExternalScriptTest'],
        },
      },
    },
  }
);

const ExternalScriptTestController = class extends ScriptController {
  constructor(model, object3D, context) {
    super(model, object3D, context);
  }
};

gameContext.load().then(() => {
  const gameProcess = new Core.Component.ProcessInterval();
  const gameContextExternalScripts = gameContext.object3D.getComponent(
    ExternalScriptComponentTYPE
  );

  if (!gameContextExternalScripts) {
    throw new Error('no ExternalScript loaded');
  }

  console.log(gameContextExternalScripts);

  gameContextExternalScripts.initController(
    new ExternalScriptTestController(
      gameContextExternalScripts.getModel(),
      gameContext.object3D,
      gameContext
    )
  );

  console.log(gameContextExternalScripts);
  gameProcess.start((dt) => {});

  setTimeout(() => {
    gameProcess.stop();
    throw new Error('test finished');
  }, 1000);
});
