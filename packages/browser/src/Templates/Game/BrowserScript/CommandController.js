import { Base } from '../../../Game/BrowserScript';
import { Command } from '@ud-viz/core/src/Game/Game';

export class CommandController extends Base {
  constructor(conf, context, parentGO) {
    super(conf, context, parentGO);
  }

  init() {
    // Input manager of the game
    const inputManager = this.context.getGameView().getInputManager();

    // FORWARD
    inputManager.addKeyCommand(
      Command.TYPE.MOVE_FORWARD,
      ['z', 'ArrowUp'],
      function () {
        return new Command({ type: Command.TYPE.MOVE_FORWARD });
      }
    );

    // BACKWARD
    inputManager.addKeyCommand(
      Command.TYPE.MOVE_BACKWARD,
      ['s', 'ArrowDown'],
      function () {
        return new Command({ type: Command.TYPE.MOVE_BACKWARD });
      }
    );

    // LEFT
    inputManager.addKeyCommand(
      Command.TYPE.MOVE_LEFT,
      ['q', 'ArrowLeft'],
      function () {
        return new Command({ type: Command.TYPE.MOVE_LEFT });
      }
    );

    // RIGHT
    inputManager.addKeyCommand(
      Command.TYPE.MOVE_RIGHT,
      ['d', 'ArrowRight'],
      function () {
        return new Command({ type: Command.TYPE.MOVE_RIGHT });
      }
    );
  }
}
