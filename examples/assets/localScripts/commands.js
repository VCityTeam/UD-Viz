/** @format */

let udviz;
let Shared = null;

module.exports = class Commands {
  constructor(conf, udvizBundle) {
    this.conf = conf;
    udviz = udvizBundle;
    Shared = udviz.Game.Shared;
  }

  init() {
    const localContext = arguments[1];

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
  }

  tick() {
    const localContext = arguments[1];
    const worldComputer = localContext.getGameView().getStateComputer();
    const inputManager = localContext.getGameView().getInputManager();

    //send input manager command to the world
    worldComputer.setOnAfterTick(function () {
      const cmds = inputManager.computeCommands();
      worldComputer.onCommands(cmds);
    });
  }
};
