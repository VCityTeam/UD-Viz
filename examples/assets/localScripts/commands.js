/** @format */

let udviz;
let Shared = null;

module.exports = class Commands {
  constructor(conf, udvizBundle) {
    this.conf = conf;
    udviz = udvizBundle;
    Shared = udviz.Game.Shared;

    this.fpsLabel = null;
    this.worldDtLabel = null;
  }

  init() {
    const go = arguments[0];
    const localContext = arguments[1];

    const gameView = localContext.getGameView();

    this.fpsLabel = document.createElement('div');
    this.fpsLabel.classList.add('label_localGameManager');
    gameView.appendToUI(this.fpsLabel);

    this.worldDtLabel = document.createElement('div');
    this.worldDtLabel.classList.add('label_localGameManager');
    gameView.appendToUI(this.worldDtLabel);

    //Input manager of the game
    const inputManager = localContext.getGameView().getInputManager();

    //FORWARD
    inputManager.addKeyCommand(
      Shared.Command.TYPE.MOVE_FORWARD,
      ['z', 'ArrowUp'],
      function () {
        return new Shared.Command({ type: Shared.Command.TYPE.MOVE_FORWARD });
      }
    );

    //BACKWARD
    inputManager.addKeyCommand(
      Shared.Command.TYPE.MOVE_BACKWARD,
      ['s', 'ArrowDown'],
      function () {
        return new Shared.Command({ type: Shared.Command.TYPE.MOVE_BACKWARD });
      }
    );

    //LEFT
    inputManager.addKeyCommand(
      Shared.Command.TYPE.MOVE_LEFT,
      ['q', 'ArrowLeft'],
      function () {
        return new Shared.Command({ type: Shared.Command.TYPE.MOVE_LEFT });
      }
    );

    //RIGHT
    inputManager.addKeyCommand(
      Shared.Command.TYPE.MOVE_RIGHT,
      ['d', 'ArrowRight'],
      function () {
        return new Shared.Command({ type: Shared.Command.TYPE.MOVE_RIGHT });
      }
    );

    //example of how to access its custom module
    const myCustomModule = gameView.getLocalScriptModules()['myCustomModule'];
    if (myCustomModule)
      inputManager.addKeyInput('p', 'keydown', myCustomModule.print);
  }

  updateUI(go, localCtx) {
    //update ui
    this.fpsLabel.innerHTML = 'FPS = ' + Math.round(1000 / localCtx.getDt());
  }

  tick() {
    const localContext = arguments[1];
    const worldComputer = localContext.getGameView().getInterpolator();
    const inputManager = localContext.getGameView().getInputManager();

    //send input manager command to the world
    worldComputer.addAfterTickRequester(function () {
      const cmds = inputManager.computeCommands();
      worldComputer.onCommands(cmds);
    });

    this.updateUI(arguments[0], localContext);
  }

  update() {
    if (!this.conf.worldComputerDt == undefined) debugger;

    this.worldDtLabel.innerHTML =
      'World FPS = ' + Math.round(1000 / this.conf.worldComputerDt);
  }
};
