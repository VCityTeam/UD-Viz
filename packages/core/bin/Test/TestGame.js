//create a gameprocess
//create a controllerprocess
//controller send command to gameprocess to move object which are are going to collide with another one
//when the collision happen gameprocess edit variables of an externalscript
//controller process check the change of the variables of the externalscript to exit 0

const Core = require('../../src/index');
const THREE = require('three');
const ScriptController = require('../../src/Game/Component/Script').Controller;
const ExternalScriptComponentTYPE =
  require('../../src/Game/Component/ExternalScript').Component.TYPE;

console.log('WARNING: this should be done with an interpolator');

let controlValue = 42;
const resultValue = 24;
const externalScriptTest = class ESTest extends Core.Game.ScriptBase {
  constructor(context, object3D, variables) {
    super(context, object3D, variables);
  }
};

const gameScriptCollisionSystem = class GSCollisionSystem extends Core.Game
  .ScriptBase {
  constructor(context, object3D, variables) {
    super(context, object3D, variables);

    this.object1 = null;
    this.object2 = null;
  }

  load() {
    return new Promise((resolve) => {
      this.object1 = this.createCollider(
        'object1',
        new THREE.Vector3(10, 0, 0),
        false
      );
      this.object1.uuid = 'object1';

      this.object2 = this.createCollider(
        'object2',
        new THREE.Vector3(0, 0, 0),
        true
      );
      this.object2.uuid = 'object2';

      this.context.addObject3D(this.object1).then(() => {
        this.context.addObject3D(this.object2).then(() => {
          resolve();
        });
      });
    });
  }

  tick() {
    this.object1.position.x -= 0.01 * this.context.dt;
  }

  createCollider(name, position, isStatic) {
    const result = new Core.Game.Object3D({
      object: {
        static: isStatic,
        name: name,
        components: {
          Collider: {
            shapes: [{ type: 'Circle', center: { x: 0, y: 0 }, radius: 1 }],
            body: true,
          },
          GameScript: {
            idScripts: ['GSCollision'],
          },
        },
      },
    });

    result.position.copy(position);

    return result;
  }
};

const gameScriptCollision = class GSCollision extends Core.Game.ScriptBase {
  constructor(context, object3D, variables) {
    super(context, object3D, variables);

    this.onEnterDone = false;
    this.isCollidingDone = false;
  }

  onEnterCollision() {
    if (this.onEnterDone) throw new Error('on enter already done');
    if (this.isCollidingDone) throw new Error('iscolliding already done');

    const gCtxExternalScriptComponent = gameContext.object3D.getComponent(
      ExternalScriptComponentTYPE
    );
    if (!gCtxExternalScriptComponent) {
      throw new Error(
        "no ExternalScript loaded. Game context's object3D: ",
        gameContext.object3D
      );
    }

    const externalScriptTest = gCtxExternalScriptComponent
      .getController()
      .getScripts()['ESTest'];
    if (!externalScriptTest) {
      throw new Error(
        'no script instance create for ESTest. Controller:',
        gCtxExternalScriptComponent.getController()
      );
    }

    const variablesExternalScript = gCtxExternalScriptComponent
      .getModel()
      .getVariables();
    if (!variablesExternalScript) {
      throw new Error(
        "no variables in ExternalScript's model. ExternalScriptComp: ",
        gCtxExternalScriptComponent
      );
    }

    if (!variablesExternalScript.varWillChangeWhenObjectCollide) {
      throw new Error(
        'no `varWillChangeWhenObjectCollide` in variables of externalscript. ExternalScriptComp: ',
        gCtxExternalScriptComponent
      );
    }
    controlValue = resultValue;
    variablesExternalScript.varWillChangeWhenObjectCollide = resultValue;
  }
};

const gameContext = new Core.Game.Context(
  [gameScriptCollisionSystem, gameScriptCollision, externalScriptTest],
  {
    object: {
      name: 'GameObjectTest',
      components: {
        ExternalScript: {
          variables: {
            varWillChangeWhenObjectCollide: 42,
          },
          idScripts: ['ESTest'],
        },
        GameScript: {
          idScripts: ['GSCollisionSystem'],
        },
      },
    },
  }
);

gameContext.load().then(() => {
  const gameProcess = new Core.ProcessInterval();
  const gCtxExternalScriptComponent = gameContext.object3D.getComponent(
    ExternalScriptComponentTYPE
  );
  if (!gCtxExternalScriptComponent) {
    throw new Error(
      "no ExternalScript loaded. Game context's object3D: ",
      gameContext.object3D
    );
  }

  gCtxExternalScriptComponent.initController(
    new ScriptController(
      gCtxExternalScriptComponent.getModel(),
      gameContext.object3D,
      gameContext
    )
  );
  if (!gCtxExternalScriptComponent.getController()) {
    throw new Error(
      "init controller failed. game context's ExternalScriptComponent: ",
      gCtxExternalScriptComponent
    );
  }

  gameProcess.start((dt) => {
    gameContext.step(dt);
  });

  // throw new Error('test finished');
  setTimeout(() => {
    const controllerProcess = new Core.ProcessInterval({ fps: 30 });
    controllerProcess.start(() => {
      const gCtxExternalScriptComponent = gameContext.object3D.getComponent(
        ExternalScriptComponentTYPE
      );
      if (!gCtxExternalScriptComponent) {
        throw new Error(
          "no ExternalScript loaded. Game context's object3D: ",
          gameContext.object3D
        );
      }

      const externalScriptTest = gCtxExternalScriptComponent
        .getController()
        .getScripts()['ESTest'];
      if (!externalScriptTest) {
        throw new Error(
          'no script instance create for ESTest. Controller:',
          gCtxExternalScriptComponent.getController()
        );
      }

      const variablesExternalScript = gCtxExternalScriptComponent
        .getModel()
        .getVariables();
      if (!variablesExternalScript) {
        throw new Error(
          "no variables in ExternalScript's model. ExternalScriptComp: ",
          gCtxExternalScriptComponent
        );
      }

      if (!variablesExternalScript.varWillChangeWhenObjectCollide) {
        throw new Error(
          'no `varWillChangeWhenObjectCollide` in variables of externalscript. ExternalScriptComp: ',
          gCtxExternalScriptComponent
        );
      }

      if (controlValue != resultValue) {
        throw new Error(
          'controlValue: ',
          controlValue,
          ' is not equal to resultValue: ',
          resultValue
        );
      }

      if (
        variablesExternalScript.varWillChangeWhenObjectCollide != resultValue
      ) {
        throw new Error(
          'variablesExternalScript.varWillChangeWhenObjectCollide: ',
          variablesExternalScript.varWillChangeWhenObjectCollide,
          ' is not equal to resultValue: ',
          resultValue
        );
      }

      process.exit(0);
    });
  }, 1000);
});
