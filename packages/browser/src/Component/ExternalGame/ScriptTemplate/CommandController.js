import { ExternalScriptBase } from '../Context';
import { Command, Game } from '@ud-viz/core';

/**
 * Register key command to send MOVE_FORWARD + MOVE_BACKWARD + MOVE_RIGHT + MOVE_LEFT to game context
 *
 * @todo use component instead
 */
export class CommandController extends ExternalScriptBase {
  init() {
    // Input manager of the game
    const inputManager = this.context.inputManager;

    // FORWARD
    inputManager.addKeyCommand(
      Game.CONSTANT.MOVE_FORWARD,
      ['z', 'ArrowUp'],
      function () {
        return new Command({ type: Game.CONSTANT.MOVE_FORWARD });
      }
    );

    // BACKWARD
    inputManager.addKeyCommand(
      Game.CONSTANT.MOVE_BACKWARD,
      ['s', 'ArrowDown'],
      function () {
        return new Command({ type: Game.CONSTANT.MOVE_BACKWARD });
      }
    );

    // LEFT
    inputManager.addKeyCommand(
      Game.CONSTANT.MOVE_LEFT,
      ['q', 'ArrowLeft'],
      function () {
        return new Command({ type: Game.CONSTANT.MOVE_LEFT });
      }
    );

    // RIGHT
    inputManager.addKeyCommand(
      Game.CONSTANT.MOVE_RIGHT,
      ['d', 'ArrowRight'],
      function () {
        return new Command({ type: Game.CONSTANT.MOVE_RIGHT });
      }
    );
  }
}
