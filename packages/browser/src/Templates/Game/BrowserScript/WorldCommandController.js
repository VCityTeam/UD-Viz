import { Base } from '../../../Game/BrowserScript';
import { WorldCommand } from '@ud-viz/core/src/Game/Game';

export class WorldCommandController extends Base {
  constructor(conf, context, parentGO) {
    super(conf, context, parentGO);
  }

  init() {
    // Input manager of the game
    const inputManager = this.context.getGameView().getInputManager();

    // FORWARD
    inputManager.addKeyCommand(
      WorldCommand.TYPE.MOVE_FORWARD,
      ['z', 'ArrowUp'],
      function () {
        return new WorldCommand({ type: WorldCommand.TYPE.MOVE_FORWARD });
      }
    );

    // BACKWARD
    inputManager.addKeyCommand(
      WorldCommand.TYPE.MOVE_BACKWARD,
      ['s', 'ArrowDown'],
      function () {
        return new WorldCommand({ type: WorldCommand.TYPE.MOVE_BACKWARD });
      }
    );

    // LEFT
    inputManager.addKeyCommand(
      WorldCommand.TYPE.MOVE_LEFT,
      ['q', 'ArrowLeft'],
      function () {
        return new WorldCommand({ type: WorldCommand.TYPE.MOVE_LEFT });
      }
    );

    // RIGHT
    inputManager.addKeyCommand(
      WorldCommand.TYPE.MOVE_RIGHT,
      ['d', 'ArrowRight'],
      function () {
        return new WorldCommand({ type: WorldCommand.TYPE.MOVE_RIGHT });
      }
    );
  }
}
