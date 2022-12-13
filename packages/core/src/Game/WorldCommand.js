/**
 * Class representing a command to send to {@link WorldStateComputer}
 *
 */
const WorldCommand = class {
  /**
   *
   * @param {object|JSON} json - The JSON  that will be used to create the WorldCommand.
   * @param {string} json.type - Type of the command @see {WorldCommand.TYPE}.
   * @param {object|JSON} json.data - Data of the command (optional).
   */
  constructor(json) {
    if (!json) throw new Error('no json');

    /** @type {string} Type of the command @see {WorldCommand.TYPE} */
    this.type = json.type;

    /** @type {object|JSON} Data of the command (optional)*/
    this.data = null;
    if (json.data != undefined) {
      this.data = json.data;
    }
  }

  /**
   *
   * @returns {object|JSON} Data of the command
   */
  getData() {
    return this.data;
  }

  /**
   *
   * @returns {string} Type of the command @see {WorldCommand.TYPE}
   */
  getType() {
    return this.type;
  }

  /**
   * Compute this to JSON
   *
   * @returns {object|JSON} object serialized in JSON
   */
  toJSON() {
    return {
      type: this.type,
      data: this.data,
    };
  }
};

/**
 * @type {object}  Constant that is used to create a new WorldCommand object.
 * @property {string} MOVE_FORWARD_START - Start moving forward.
 * @property {string} MOVE_FORWARD_END - Stop moving forward.
 * @property {string} MOVE_BACKWARD_START - Start moving backward.
 * @property {string} MOVE_BACKWARD_END - Stop moving backward.
 * @property {string} MOVE_LEFT_START - Start moving left.
 * @property {string} MOVE_LEFT_END - Stop moving left.
 * @property {string} MOVE_RIGHT_START - Start moving right.
 * @property {string} MOVE_RIGHT_END - Stop moving right.
 * @property {string} MOVE_FORWARD - Move forward.
 * @property {string} MOVE_BACKWARD - Move backward.
 * @property {string} MOVE_LEFT - Move left.
 * @property {string} MOVE_RIGHT - Move right.
 * @property {string} ROTATE - Rotate.
 * @property {string} MOVE_TO - Move to a position.
 * @property {string} Z_UPDATE - Update the z position.
 * @property {string} ESCAPE - Escape.
 * @property {string} TELEPORT - Teleport.
 * @property {string} PING_MINI_MAP - Ping the mini map.
 * @property {string} MOVE_UP - Move up.
 * @property {string} MOVE_DOWN - Move down.
 * @property {string} ROTATE_LEFT - Rotate left.
 * @property {string} ROTATE_RIGHT - Rotate right.
 */
WorldCommand.TYPE = {
  MOVE_FORWARD_START: 'move_forward_start',
  MOVE_FORWARD_END: 'move_forward_end',
  MOVE_BACKWARD_START: 'move_backward_start',
  MOVE_BACKWARD_END: 'move_backward_end',
  MOVE_LEFT_START: 'move_left_start',
  MOVE_LEFT_END: 'move_left_end',
  MOVE_RIGHT_START: 'move_right_start',
  MOVE_RIGHT_END: 'move_right_end',
  MOVE_FORWARD: 'move_forward',
  MOVE_BACKWARD: 'move_backward',
  MOVE_LEFT: 'move_left',
  MOVE_RIGHT: 'move_right',
  ROTATE: 'rotate',
  MOVE_TO: 'move_to',
  Z_UPDATE: 'z_update',
  ESCAPE: 'escape',
  TELEPORT: 'teleport',
  PING_MINI_MAP: 'ping_mini_map',
  MOVE_UP: 'move_up',
  MOVE_DOWN: 'move_down',
  ROTATE_LEFT: 'rotate_left',
  ROTATE_RIGHT: 'rotate_right',
  INCREASE_SPEED: 'increase_speed',
  DECREASE_SPEED: 'decrease_speed',
};

module.exports = WorldCommand;
