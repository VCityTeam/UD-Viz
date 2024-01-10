import { ScriptBase } from '@ud-viz/game_browser';
import { constant } from '@ud-viz/game_shared_template';
import { Command } from '@ud-viz/game_shared';
import { Vector3 } from 'three';

export class ControllerNativeCommandManager extends ScriptBase {
  constructor(context, object3D, variables) {
    super(context, object3D, variables);

    /** @type {Function} */
    this._clickListener = null;

    /** @type {string} */
    this._currentMode = null;
  }

  /**
   * Add native commands in input manager @see NativeCommandManager of @ud-viz/game_shared_template
   *
   * @param {string} object3DUUID - uuid of the object3D to contol
   * @param {object} mode - which mode to controls object3D @see ControllerNativeCommandManager.MODE
   * @param {object} options - options
   * @param {boolean} [options.withMap=true] - z is not compute with map
   */
  controls(object3DUUID, mode, options = { withMap: true }) {
    if (this._currentMode) this.removeControls();
    switch (mode.TYPE) {
      case ControllerNativeCommandManager.MODE_TYPE.CLASSIC:
        mode.KEYS_MAPPING.forEach(({ COMMAND_ID, COMMAND_TYPE, KEYS }) => {
          this.context.inputManager.addKeyCommand(COMMAND_ID, KEYS, () => {
            return new Command({
              type: COMMAND_TYPE,
              data: { object3DUUID: object3DUUID, withMap: options.withMap }, // object3D to control
            });
          });
        });
        break;
      case ControllerNativeCommandManager.MODE_TYPE.START_END_MOUSE:
        // keys
        mode.KEYS_MAPPING.forEach(
          ({ COMMAND_ID, KEYS, COMMAND_TYPE_START, COMMAND_TYPE_END }) => {
            let start = false;
            this.context.inputManager.addKeyCommand(COMMAND_ID, KEYS, () => {
              let oneKeyIsPressed = false;
              KEYS.forEach((key) => {
                oneKeyIsPressed =
                  oneKeyIsPressed || this.context.inputManager.isPressed(key);
              });

              if (oneKeyIsPressed && !start) {
                start = true;
                this.context.inputManager.setPointerLock(true);
                return new Command({
                  type: COMMAND_TYPE_START,
                  data: {
                    object3DUUID: object3DUUID,
                    withMap: options.withMap,
                  },
                });
              } else if (!oneKeyIsPressed && start) {
                start = false; // reset
                return new Command({
                  type: COMMAND_TYPE_END,
                  data: {
                    object3DUUID: object3DUUID,
                    withMap: options.withMap,
                  },
                });
              }
            });
          }
        );
        // mouse
        this.context.inputManager.addMouseCommand(
          mode.MOUSE.MOVE.COMMAND_ID,
          'mousemove',
          (event) => {
            if (
              this.context.inputManager.getPointerLock() ||
              (this.context.inputManager.mouseState.isDragging() &&
                !this.context.inputManager.getPointerLock())
            ) {
              if (event.movementX != 0 || event.movementY != 0) {
                let pixelX = -event.movementX;
                let pixelY = -event.movementY;

                pixelX *= ControllerNativeCommandManager.MOUSE_SENSITIVITY;
                pixelY *= ControllerNativeCommandManager.MOUSE_SENSITIVITY;

                return new Command({
                  type: ControllerNativeCommandManager.MODE[2].MOUSE.MOVE
                    .COMMAND_TYPE,
                  data: {
                    object3DUUID: object3DUUID,
                    vector: new Vector3(pixelY, 0, pixelX),
                  },
                });
              }
            }
            return null;
          }
        );
        // exit pointer lock method
        this._clickListener = () => {
          this.context.inputManager.setPointerLock(false);
        };
        this.context.inputManager.addMouseInput(
          this.context.inputManager.element,
          'click',
          this._clickListener
        );
        break;
      default:
        throw new Error('Unknown controller type');
    }

    this._currentMode = mode;
  }

  /**
   * Remove native commands in input manager
   */
  removeControls() {
    switch (this._currentMode.TYPE) {
      case ControllerNativeCommandManager.MODE_TYPE.CLASSIC:
        {
          this._currentMode.KEYS_MAPPING.forEach(({ COMMAND_ID, KEYS }) => {
            this.context.inputManager.removeKeyCommand(COMMAND_ID, KEYS);
          });
        }
        break;
      case ControllerNativeCommandManager.MODE_TYPE.START_END_MOUSE:
        {
          this._currentMode.KEYS_MAPPING.forEach(({ COMMAND_ID, KEYS }) => {
            this.context.inputManager.removeKeyCommand(COMMAND_ID, KEYS);
          });
          this.context.inputManager.removeMouseCommand(
            this._currentMode.MOUSE.MOVE.COMMAND_ID,
            'mousemove'
          );
          this.context.inputManager.removeInputListener(this._clickListener);
          this.context.inputManager.setPointerLock(false);
        }
        break;
      default:
        throw new Error('current controller mode type is corrupted');
    }
    this._currentMode = null;
  }

  /**
   * Different controller mode to move game object3d @see NativeCommandManager which will receive commands
   *
   * @returns {object} - different mode of controls
   */
  static get MODE() {
    return {
      /**
       * Can move forward and backward and rotateZ left and right
       */
      1: {
        TYPE: ControllerNativeCommandManager.MODE_TYPE.CLASSIC,
        KEYS_MAPPING: [
          {
            COMMAND_ID: 'controller_mode_1_forward_id',
            COMMAND_TYPE: constant.COMMAND.MOVE_FORWARD,
            KEYS: ['z', 'ArrowUp'],
          },
          {
            COMMAND_ID: 'controller_mode_1_backward_id',
            COMMAND_TYPE: constant.COMMAND.MOVE_BACKWARD,
            KEYS: ['s', 'ArrowDown'],
          },
          {
            COMMAND_ID: 'controller_mode_1_rotate_left_id',
            COMMAND_TYPE: constant.COMMAND.ROTATE_LEFT,
            KEYS: ['q', 'ArrowLeft'],
          },
          {
            COMMAND_ID: 'controller_mode_1_rotate_right_id',
            COMMAND_TYPE: constant.COMMAND.ROTATE_RIGHT,
            KEYS: ['d', 'ArrowRight'],
          },
        ],
      },
      /**
       * Can move forward and backward left and right and rotate with mouse
       */
      2: {
        TYPE: ControllerNativeCommandManager.MODE_TYPE.START_END_MOUSE,
        MOUSE: {
          MOVE: {
            COMMAND_ID: 'controller_mode_2_mouse_move',
            COMMAND_TYPE: constant.COMMAND.ROTATE,
          },
        },
        KEYS_MAPPING: [
          {
            COMMAND_ID: 'controller_mode_2_forward_id',
            KEYS: ['z', 'ArrowUp'],
            COMMAND_TYPE_START: constant.COMMAND.MOVE_FORWARD_START,
            COMMAND_TYPE_END: constant.COMMAND.MOVE_FORWARD_END,
          },
          {
            COMMAND_ID: 'controller_mode_2_backward_id',
            KEYS: ['s', 'ArrowDown'],
            COMMAND_TYPE_START: constant.COMMAND.MOVE_BACKWARD_START,
            COMMAND_TYPE_END: constant.COMMAND.MOVE_BACKWARD_END,
          },
          {
            COMMAND_ID: 'controller_mode_2_right_id',
            KEYS: ['d', 'ArrowRight'],
            COMMAND_TYPE_START: constant.COMMAND.MOVE_RIGHT_START,
            COMMAND_TYPE_END: constant.COMMAND.MOVE_RIGHT_END,
          },
          {
            COMMAND_ID: 'controller_mode_2_left_id',
            KEYS: ['q', 'ArrowLeft'],
            COMMAND_TYPE_START: constant.COMMAND.MOVE_LEFT_START,
            COMMAND_TYPE_END: constant.COMMAND.MOVE_LEFT_END,
          },
        ],
      },
      /**
       * Can move forward, backward, up and down. Can rotateZ left and right
       */
      3: {
        TYPE: ControllerNativeCommandManager.MODE_TYPE.CLASSIC,
        KEYS_MAPPING: [
          {
            COMMAND_ID: 'controller_mode_3_forward_id',
            COMMAND_TYPE: constant.COMMAND.MOVE_FORWARD,
            KEYS: ['z', 'ArrowUp'],
          },
          {
            COMMAND_ID: 'controller_mode_3_backward_id',
            COMMAND_TYPE: constant.COMMAND.MOVE_BACKWARD,
            KEYS: ['s', 'ArrowDown'],
          },
          {
            COMMAND_ID: 'controller_mode_3_move_up_id',
            COMMAND_TYPE: constant.COMMAND.MOVE_UP,
            KEYS: ['Shift'],
          },
          {
            COMMAND_ID: 'controller_mode_3_move_down_id',
            COMMAND_TYPE: constant.COMMAND.MOVE_DOWN,
            KEYS: ['Control'],
          },
          {
            COMMAND_ID: 'controller_mode_3_rotate_left_id',
            COMMAND_TYPE: constant.COMMAND.ROTATE_LEFT,
            KEYS: ['q', 'ArrowLeft'],
          },
          {
            COMMAND_ID: 'controller_mode_3_rotate_right_id',
            COMMAND_TYPE: constant.COMMAND.ROTATE_RIGHT,
            KEYS: ['d', 'ArrowRight'],
          },
        ],
      },
    };
  }

  static get ID_SCRIPT() {
    return constant.ID_SCRIPT.CONTROLLER_NATIVE_COMMAND_MANAGER;
  }
}

ControllerNativeCommandManager.MOUSE_SENSITIVITY = 0.5;

ControllerNativeCommandManager.MODE_TYPE = {
  CLASSIC: 'classic',
  START_END_MOUSE: 'start_end_mouse',
};
