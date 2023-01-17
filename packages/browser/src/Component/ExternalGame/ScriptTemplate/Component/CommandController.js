import { Game, Command } from '@ud-viz/core';
import { InputManager } from '../../../Component';

/**
 * @typedef Mapping
 * @property {string} id - id of the command
 * @property {string[]} keys - keys to trigger this command
 * @property {string} cmdType - type command to send to game context
 */

/** @type {Object<string,Mapping>} - default mapping of controller */
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

export class CommandController {
  /**
   * Add/remove native command controls
   *
   * @param {InputManager} inputManager - initmanager to control
   */
  constructor(inputManager) {
    /** @type {InputManager} - input manager */
    this.inputManager = inputManager;
  }

  /**
   * Add native commands in input manager
   */
  addNativeCommands() {
    for (const key in MAPPING) {
      const map = MAPPING[key];
      this.inputManager.addKeyCommand(map.id, map.keys, () => {
        return new Command({ type: map.cmdType });
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
