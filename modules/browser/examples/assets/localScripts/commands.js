/** @format */

let udviz;
let Game = null;

module.exports = class Commands {
  constructor(conf, udvizBundle) {
    this.conf = conf;
    udviz = udvizBundle;
    Game = udviz.Game;

    this.fpsLabel = null;
    this.worldDtLabel = null;
  }

  init() {
    const go = arguments[0];
    const localContext = arguments[1];

    const gameView = localContext.getGameView();

    this.fpsLabel = document.createElement('div');
    gameView.appendToUI(this.fpsLabel);

    this.worldDtLabel = document.createElement('div');
    gameView.appendToUI(this.worldDtLabel);

    // Input manager of the game
    const inputManager = localContext.getGameView().getInputManager();

    // FORWARD
    inputManager.addKeyCommand(
      Game.Command.TYPE.MOVE_FORWARD,
      ['z', 'ArrowUp'],
      function () {
        return new Game.Command({ type: Game.Command.TYPE.MOVE_FORWARD });
      }
    );

    // BACKWARD
    inputManager.addKeyCommand(
      Game.Command.TYPE.MOVE_BACKWARD,
      ['s', 'ArrowDown'],
      function () {
        return new Game.Command({ type: Game.Command.TYPE.MOVE_BACKWARD });
      }
    );

    // LEFT
    inputManager.addKeyCommand(
      Game.Command.TYPE.MOVE_LEFT,
      ['q', 'ArrowLeft'],
      function () {
        return new Game.Command({ type: Game.Command.TYPE.MOVE_LEFT });
      }
    );

    // RIGHT
    inputManager.addKeyCommand(
      Game.Command.TYPE.MOVE_RIGHT,
      ['d', 'ArrowRight'],
      function () {
        return new Game.Command({ type: Game.Command.TYPE.MOVE_RIGHT });
      }
    );

    const worldComputer = localContext.getGameView().getInterpolator();

    // Send input manager command to the world at each computer tick
    worldComputer.addAfterTickRequester(function () {
      worldComputer.onCommands(inputManager.computeCommands());
    });

    // Example of how to access its custom module
    const myCustomModule = gameView.getLocalScriptModules()['myCustomModule'];
    if (myCustomModule)
      inputManager.addKeyInput('l', 'keydown', myCustomModule.print);

    inputManager.addKeyInput('p', 'keydown', function () {
      console.log(go.computeRoot());
    });
  }

  updateUI(go, localCtx) {
    // Update ui
    this.fpsLabel.innerHTML = 'Gameview dt = ' + Math.round(localCtx.getDt());
  }

  tick() {
    this.updateUI(arguments[0], arguments[1]);
  }

  onOutdated() {
    this.worldDtLabel.innerHTML =
      'World FPS = ' + Math.round(1000 / this.conf.worldComputerDt);
  }
};
