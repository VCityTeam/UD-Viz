import { Command } from '@ud-viz/game_shared';
import { constant } from '@ud-viz/game_shared_template';
import { InputManager } from '@ud-viz/game_browser';
import * as itowns from 'itowns';
import * as THREE from 'three';

/**
 * Compute relative elevation from ground of a Object3D
 *
 * @param {THREE.Object3D} object3D - object3D
 * @param {itowns.TiledGeometryLayer} tileLayer - tile layer used to compute elevation
 * @param {string} [crs=EPSG:3946] - coordinates referential system
 * @returns {number} - relative elevation
 */
export function computeRelativeElevationFromGround(
  object3D,
  tileLayer,
  crs = 'EPSG:3946'
) {
  const parentGOWorldPos = new THREE.Vector3();
  object3D.parent.matrixWorld.decompose(
    parentGOWorldPos,
    new THREE.Quaternion(),
    new THREE.Vector3()
  );
  const goWorldPos = new THREE.Vector3();
  object3D.matrixWorld.decompose(
    goWorldPos,
    new THREE.Quaternion(),
    new THREE.Vector3()
  );
  const elevation = itowns.DEMUtils.getElevationValueAt(
    tileLayer,
    new itowns.Coordinates(crs, goWorldPos),
    1 // PRECISE_READ_Z
  );

  return elevation - parentGOWorldPos.z;
}

/**
 * Modify left and top css attributes of your html element to place in scene3D
 *
 * @param {HTMLElement} htmlToMove - html element to modify left and top attributes
 * @param {THREE.Vector3} worldPos - world position where to move your html
 * @param {THREE.PerspectiveCamera} camera - camera of the scene3D
 */
export function moveHtmlToWorldPosition(htmlToMove, worldPos, camera) {
  worldPos.project(camera);

  // compute position on screen
  // note that this is working only when parent div of the html is 100% window size
  const widthHalf = window.innerWidth * 0.5,
    heightHalf = window.innerHeight * 0.5;
  worldPos.x = worldPos.x * widthHalf + widthHalf;
  worldPos.y = -(worldPos.y * heightHalf) + heightHalf;

  htmlToMove.style.left = worldPos.x + 'px';
  htmlToMove.style.top = worldPos.y + 'px';
}

/**
 * Different controller to move game object3d @see NativeCommandManager which will receive commands
 */
export const CONTROLLER = {
  /**
   * Can move forward and backward and rotateZ left and right
   */
  MODE_1: {
    TYPE: 'mode_1_type',
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
  MODE_2: {
    TYPE: 'mode_2_type',
    MOUSE_MAPPING: {
      COMMAND_ID: 'controller_mode_2_mouse',
      SENSITIVITY: 0.5,
      COMMAND_TYPE: constant.COMMAND.ROTATE,
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
};

// only one controller at the time
let _currentControllerModeType = null;
let _clickListener = null;

/**
 * Add native commands in input manager @see NativeCommandManager of @ud-viz/game_shared_template
 *
 * @param {InputManager} inputManager - manager
 * @param {string} object3DUUID - uuid of the object3D to contol
 * @param {object} options - options
 * @param {boolean} [options.withMap=true] - z is not compute with map
 * @param {string} [options.modeType=CONTROLLER.MODE_1.TYPE] - z is not compute with map
 */
export function addNativeCommandsController(
  inputManager,
  object3DUUID,
  options = { withMap: true, modeType: CONTROLLER.MODE_1.TYPE }
) {
  if (_currentControllerModeType) {
    removeNativeCommandsController(inputManager);
  }

  if (options.modeType == CONTROLLER.MODE_1.TYPE) {
    CONTROLLER.MODE_1.KEYS_MAPPING.forEach(
      ({ COMMAND_ID, COMMAND_TYPE, KEYS }) => {
        inputManager.addKeyCommand(COMMAND_ID, KEYS, () => {
          return new Command({
            type: COMMAND_TYPE,
            data: { object3DUUID: object3DUUID, withMap: options.withMap }, // object3D to control
          });
        });
      }
    );
  } else if (options.modeType == CONTROLLER.MODE_2.TYPE) {
    // keys
    CONTROLLER.MODE_2.KEYS_MAPPING.forEach(
      ({ COMMAND_ID, KEYS, COMMAND_TYPE_START, COMMAND_TYPE_END }) => {
        let start = false;
        inputManager.addKeyCommand(COMMAND_ID, KEYS, () => {
          let oneKeyIsPressed = false;
          KEYS.forEach((key) => {
            oneKeyIsPressed = oneKeyIsPressed || inputManager.isPressed(key);
          });

          if (oneKeyIsPressed && !start) {
            start = true;
            inputManager.setPointerLock(true);
            return new Command({
              type: COMMAND_TYPE_START,
              data: { object3DUUID: object3DUUID, withMap: options.withMap },
            });
          } else if (!oneKeyIsPressed && start) {
            start = false; // reset
            return new Command({
              type: COMMAND_TYPE_END,
              data: { object3DUUID: object3DUUID, withMap: options.withMap },
            });
          }
        });
      }
    );
    // mouse
    inputManager.addMouseCommand(
      CONTROLLER.MODE_2.MOUSE_MAPPING.COMMAND_ID,
      'mousemove',
      (event) => {
        if (
          inputManager.getPointerLock() ||
          (inputManager.mouseState.isDragging() &&
            !inputManager.getPointerLock())
        ) {
          if (event.movementX != 0 || event.movementY != 0) {
            let pixelX = -event.movementX;
            let pixelY = -event.movementY;

            const dragRatio = CONTROLLER.MODE_2.MOUSE_MAPPING.SENSITIVITY;

            pixelX *= dragRatio;
            pixelY *= dragRatio;

            return new Command({
              type: CONTROLLER.MODE_2.MOUSE_MAPPING.COMMAND_TYPE,
              data: {
                object3DUUID: object3DUUID,
                vector: new THREE.Vector3(pixelY, 0, pixelX),
              },
            });
          }
        }
        return null;
      }
    );
    // exit pointer lock method
    _clickListener = () => {
      inputManager.setPointerLock(false);
    };
    inputManager.addMouseInput(inputManager.element, 'click', _clickListener);
  } else {
    throw new Error('Unknown controller type');
  }

  _currentControllerModeType = options.modeType;
}

/**
 * Remove native commands in input manager
 *
 * @param {InputManager} inputManager - manager
 */
export function removeNativeCommandsController(inputManager) {
  if (!_currentControllerModeType) return;
  if (_currentControllerModeType == CONTROLLER.MODE_1.TYPE) {
    CONTROLLER.MODE_1.KEYS_MAPPING.forEach(({ COMMAND_ID, KEYS }) => {
      inputManager.removeKeyCommand(COMMAND_ID, KEYS);
    });
  } else if (_currentControllerModeType == CONTROLLER.MODE_2.TYPE) {
    CONTROLLER.MODE_2.KEYS_MAPPING.forEach(({ COMMAND_ID, KEYS }) => {
      inputManager.removeKeyCommand(COMMAND_ID, KEYS);
    });
    inputManager.removeMouseCommand(
      CONTROLLER.MODE_2.MOUSE_MAPPING.COMMAND_ID,
      'mousemove'
    );
    inputManager.removeInputListener(_clickListener);
    inputManager.setPointerLock(false);
  } else {
    throw new Error('current controller mode type is corrupted');
  }
  _currentControllerModeType = null;
}
