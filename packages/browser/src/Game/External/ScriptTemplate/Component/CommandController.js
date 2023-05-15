import { Game, Command } from '@ud-viz/shared';
import { InputManager } from '../../../../InputManager';

/**
 * @typedef Mapping
 * @property {string} id - id of the command
 * @property {string[]} keys - keys to trigger this command
 * @property {string} cmdType - type command to send to game context
 */

/**
 * Default mapping of controller
 *
 * @type {Object<string,Mapping>}
 */
const MAPPING = {
  FORWARD: {
    id: 'forward',
    keys: ['z', 'ArrowUp'],
    cmdType: Game.ScriptTemplate.Constants.COMMAND.MOVE_FORWARD,
  },
  BACKWARD: {
    id: 'backward',
    keys: ['s', 'ArrowDown'],
    cmdType: Game.ScriptTemplate.Constants.COMMAND.MOVE_BACKWARD,
  },
  LEFT: {
    id: 'left',
    keys: ['q', 'ArrowLeft'],
    cmdType: Game.ScriptTemplate.Constants.COMMAND.ROTATE_LEFT,
  },
  RIGHT: {
    id: 'right',
    keys: ['d', 'ArrowRight'],
    cmdType: Game.ScriptTemplate.Constants.COMMAND.ROTATE_RIGHT,
  },
};

/** @class */
export class CommandController {
  /**
   * Add/remove native command controls
   *
   * @param {InputManager} inputManager - initmanager to control
   */
  constructor(inputManager) {
    /** @type {InputManager} */
    this.inputManager = inputManager;
  }

  /**
   * Add native commands in input manager
   *
   * @param {string} object3DUUID - uuid of the object3D to contol
   * @param {boolean} withMap - move command are ignoring map
   */
  addNativeCommands(object3DUUID, withMap = true) {
    for (const key in MAPPING) {
      const map = MAPPING[key];
      this.inputManager.addKeyCommand(map.id, map.keys, () => {
        return new Command({
          type: map.cmdType,
          data: { object3DUUID: object3DUUID, withMap: withMap }, // object3D to control
        });
      });
    }
  }

  /**
   * Remove native commands in input manager
   */
  removeNativeCommands() {
    for (const key in MAPPING) {
      const map = MAPPING[key];
      this.inputManager.removeKeyCommand(map.id, map.keys);
    }
  }
}
