const AbstractMap = require('./AbstractMap');
const { COMMAND } = require('./constant');

const THREE = require('three');
const {
  ScriptBase,
  Object3D,
  ExternalScriptComponent,
} = require('@ud-viz/game_shared');

/**
 * @classdesc - Manage native command
 */
const NativeCommandManager = class extends ScriptBase {
  init() {
    /**
     * state of the objects moving
     * 
     @type {Object<string,Array>}*/
    this.objectsMoving = {};
    this.objectsMoving[COMMAND.MOVE_FORWARD_START] = [];
    this.objectsMoving[COMMAND.MOVE_BACKWARD_START] = [];
    this.objectsMoving[COMMAND.MOVE_LEFT_START] = [];
    this.objectsMoving[COMMAND.MOVE_RIGHT_START] = [];

    /** @type {AbstractMap|null} */
    this.map = this.context.findGameScriptWithID(AbstractMap.ID_SCRIPT);
  }

  _removeObjectMoving(type, uuid) {
    for (let index = 0; index < this.objectsMoving[type].length; index++) {
      const element = this.objectsMoving[type][index];
      if (element.object3D.uuid == uuid) {
        this.objectsMoving[type].splice(index, 1);
        break;
      }
    }
  }

  tick() {
    // apply commands callback
    this.applyCommandCallbackOf(COMMAND.MOVE_FORWARD, (data) => {
      const updatedObject3D = this.context.object3D.getObjectByProperty(
        'uuid',
        data.object3DUUID
      );
      if (
        NativeCommandManager.moveForward(
          updatedObject3D,
          this.computeObjectSpeedTranslate(updatedObject3D) * this.context.dt,
          this.map,
          data.withMap
        )
      )
        this.dispatchEvent({
          type: NativeCommandManager.EVENT.OBJECT_3D_LEAVE_MAP,
          object3D: updatedObject3D,
        });

      return true;
    });
    this.applyCommandCallbackOf(COMMAND.MOVE_BACKWARD, (data) => {
      const updatedObject3D = this.context.object3D.getObjectByProperty(
        'uuid',
        data.object3DUUID
      );
      if (
        NativeCommandManager.moveBackward(
          updatedObject3D,
          this.computeObjectSpeedTranslate(updatedObject3D) * this.context.dt,
          this.map,
          data.withMap
        )
      )
        this.dispatchEvent({
          type: NativeCommandManager.EVENT.OBJECT_3D_LEAVE_MAP,
          object3D: updatedObject3D,
        });

      return true;
    });
    this.applyCommandCallbackOf(COMMAND.ROTATE_LEFT, (data) => {
      const updatedObject3D = this.context.object3D.getObjectByProperty(
        'uuid',
        data.object3DUUID
      );
      NativeCommandManager.rotate(
        updatedObject3D,
        new THREE.Vector3(
          0,
          0,
          this.computeObjectSpeedRotate(updatedObject3D) * this.context.dt
        )
      );

      return true;
    });
    this.applyCommandCallbackOf(COMMAND.ROTATE_RIGHT, (data) => {
      const updatedObject3D = this.context.object3D.getObjectByProperty(
        'uuid',
        data.object3DUUID
      );
      NativeCommandManager.rotate(
        updatedObject3D,
        new THREE.Vector3(
          0,
          0,
          -this.computeObjectSpeedRotate(updatedObject3D) * this.context.dt
        )
      );
      return true;
    });

    this.applyCommandCallbackOf(COMMAND.MOVE_UP, (data) => {
      const updatedObject3D = this.context.object3D.getObjectByProperty(
        'uuid',
        data.object3DUUID
      );
      if (this.checkMaxAltitude(updatedObject3D)) {
        NativeCommandManager.moveUp(
          updatedObject3D,
          this.computeObjectSpeedTranslate(updatedObject3D) * this.context.dt
        );
        return true;
      }
      return false;
    });

    this.applyCommandCallbackOf(COMMAND.MOVE_DOWN, (data) => {
      const updatedObject3D = this.context.object3D.getObjectByProperty(
        'uuid',
        data.object3DUUID
      );
      if (this.checkMinAltitude(updatedObject3D)) {
        NativeCommandManager.moveDown(
          updatedObject3D,
          this.computeObjectSpeedTranslate(updatedObject3D) * this.context.dt
        );
        return true;
      }
      return false;
    });

    this.applyCommandCallbackOf(COMMAND.UPDATE_TRANSFORM, (data) => {
      const updatedObject3D = this.context.object3D.getObjectByProperty(
        'uuid',
        data.object3DUUID
      );
      if (!updatedObject3D) return true;
      if (data.position) {
        if (!isNaN(data.position.x)) {
          updatedObject3D.position.x = data.position.x;
          updatedObject3D.setOutdated(true);
        }
        if (!isNaN(data.position.y)) {
          updatedObject3D.position.y = data.position.y;
          updatedObject3D.setOutdated(true);
        }
        if (!isNaN(data.position.z)) {
          updatedObject3D.position.z = data.position.z;
          updatedObject3D.setOutdated(true);
        }
      }
      if (data.rotation) {
        if (!isNaN(data.rotation.x)) {
          updatedObject3D.rotation.x = data.rotation.x;
          updatedObject3D.setOutdated(true);
        }
        if (!isNaN(data.rotation.y)) {
          updatedObject3D.rotation.y = data.rotation.y;
          updatedObject3D.setOutdated(true);
        }
        if (!isNaN(data.rotation.z)) {
          updatedObject3D.rotation.z = data.rotation.z;
          updatedObject3D.setOutdated(true);
        }
      }
      if (data.scale) {
        if (!isNaN(data.scale.x)) {
          updatedObject3D.scale.x = data.scale.x;
          updatedObject3D.setOutdated(true);
        }
        if (!isNaN(data.scale.y)) {
          updatedObject3D.scale.y = data.scale.y;
          updatedObject3D.setOutdated(true);
        }
        if (!isNaN(data.scale.z)) {
          updatedObject3D.scale.z = data.scale.z;
          updatedObject3D.setOutdated(true);
        }
      }

      return true;
    });
    this.applyCommandCallbackOf(
      COMMAND.UPDATE_EXTERNALSCRIPT_VARIABLES,
      (data) => {
        const updatedObject3D = this.context.object3D.getObjectByProperty(
          'uuid',
          data.object3DUUID
        );
        const externalScriptComponent = updatedObject3D.getComponent(
          ExternalScriptComponent.TYPE
        );
        externalScriptComponent.getModel().variables[data.variableName] =
          data.variableValue;
        updatedObject3D.setOutdated(true);
        return true;
      }
    );
    this.applyCommandCallbackOf(COMMAND.ROTATE, (data) => {
      const updatedObject3D = this.context.object3D.getObjectByProperty(
        'uuid',
        data.object3DUUID
      );
      if (!isNaN(data.vector.x)) {
        updatedObject3D.rotateX(
          data.vector.x *
            this.context.dt *
            this.computeObjectSpeedRotate(updatedObject3D)
        );
      }
      if (!isNaN(data.vector.y)) {
        updatedObject3D.rotateY(
          data.vector.y *
            this.context.dt *
            this.computeObjectSpeedRotate(updatedObject3D)
        );
      }
      if (!isNaN(data.vector.z)) {
        updatedObject3D.rotateZ(
          data.vector.z *
            this.context.dt *
            this.computeObjectSpeedRotate(updatedObject3D)
        );
      }
      this.clampRotation(updatedObject3D);
      updatedObject3D.setOutdated(true);
      return true;
    });
    this.applyCommandCallbackOf(COMMAND.ADD_OBJECT3D, (data) => {
      this.context.addObject3D(new Object3D(data.object3D), data.parentUUID);
      return true;
    });
    this.applyCommandCallbackOf(COMMAND.REMOVE_OBJECT3D, (data) => {
      const updatedObject3D = this.context.object3D.getObjectByProperty(
        'uuid',
        data.object3DUUID
      );
      this.context.removeObject3D(updatedObject3D.uuid);
      return true;
    });

    [
      { start: COMMAND.MOVE_FORWARD_START, end: COMMAND.MOVE_FORWARD_END },
      { start: COMMAND.MOVE_BACKWARD_START, end: COMMAND.MOVE_BACKWARD_END },
      { start: COMMAND.MOVE_LEFT_START, end: COMMAND.MOVE_LEFT_END },
      { start: COMMAND.MOVE_RIGHT_START, end: COMMAND.MOVE_RIGHT_END },
    ].forEach(({ start, end }) => {
      this.applyCommandCallbackOf(start, (data) => {
        const updatedObject3D = this.context.object3D.getObjectByProperty(
          'uuid',
          data.object3DUUID
        );
        const alreadyPushed =
          this.objectsMoving[start].filter(
            (el) => el.object3D == updatedObject3D
          ).length > 0;
        if (!alreadyPushed)
          this.objectsMoving[start].push({
            object3D: updatedObject3D,
            withMap: data.withMap,
          });

        return true;
      });
      this.applyCommandCallbackOf(end, (data) => {
        this._removeObjectMoving(start, data.object3DUUID);
        return true;
      });
    });

    // move objectsMoving
    this.objectsMoving[COMMAND.MOVE_FORWARD_START].forEach(
      ({ object3D, withMap }) => {
        if (
          NativeCommandManager.moveForward(
            object3D,
            this.computeObjectSpeedTranslate(object3D) * this.context.dt,
            this.map,
            withMap
          )
        ) {
          this.dispatchEvent({
            type: NativeCommandManager.EVENT.OBJECT_3D_LEAVE_MAP,
            object3D: object3D,
          });
        }
      }
    );
    this.objectsMoving[COMMAND.MOVE_BACKWARD_START].forEach(
      ({ object3D, withMap }) => {
        if (
          NativeCommandManager.moveBackward(
            object3D,
            this.computeObjectSpeedTranslate(object3D) * this.context.dt,
            this.map,
            withMap
          )
        ) {
          this.dispatchEvent({
            type: NativeCommandManager.EVENT.OBJECT_3D_LEAVE_MAP,
            object3D: object3D,
          });
        }
      }
    );
    this.objectsMoving[COMMAND.MOVE_LEFT_START].forEach(
      ({ object3D, withMap }) => {
        if (
          NativeCommandManager.moveLeft(
            object3D,
            this.computeObjectSpeedTranslate(object3D) * this.context.dt,
            this.map,
            withMap
          )
        ) {
          this.dispatchEvent({
            type: NativeCommandManager.EVENT.OBJECT_3D_LEAVE_MAP,
            object3D: object3D,
          });
        }
      }
    );
    this.objectsMoving[COMMAND.MOVE_RIGHT_START].forEach(
      ({ object3D, withMap }) => {
        if (
          NativeCommandManager.moveRight(
            object3D,
            this.computeObjectSpeedTranslate(object3D) * this.context.dt,
            this.map,
            withMap
          )
        ) {
          this.dispatchEvent({
            type: NativeCommandManager.EVENT.OBJECT_3D_LEAVE_MAP,
            object3D: object3D,
          });
        }
      }
    );
  }

  /**
   * If you want to have different translation speed for gameobject you should override this method
   *
   * @returns {number} speed of the translation
   */
  computeObjectSpeedTranslate() {
    return this.variables.defaultSpeedTranslate;
  }

  /**
   * If you want to have different rotation speed for gameobject you should override this method
   *
   * @returns {number} speed of the rotation
   */
  computeObjectSpeedRotate() {
    return this.variables.defaultSpeedRotate;
  }

  /**
   * Checks if the given object's altitude is below the maximum allowed altitude.
   *
   * @param {Object3D} object3D - The object to check.
   * @returns {boolean} - True if the object's altitude is below the maximum allowed altitude, false otherwise.
   */
  checkMaxAltitude(object3D) {
    return object3D.position.z <= this.computeMaxAltitude(object3D);
  }

  /**
   * Checks if the given object's altitude is above the minimum allowed altitude.
   *
   * @param {Object3D} object3D - The object to check.
   * @returns {boolean} - True if the object's altitude is above the minimum allowed altitude, false otherwise.
   */
  checkMinAltitude(object3D) {
    return object3D.position.z >= this.computeMinAltitude(object3D);
  }

  /**
   * Computes the maximum allowed altitude.
   *
   * @returns {number} - The maximum allowed altitude.
   */
  computeMaxAltitude() {
    return this.variables.maxAltitude;
  }

  /**
   * Computes the minimum allowed altitude.
   *
   * @returns {number} - The minimum allowed altitude.
   */
  computeMinAltitude() {
    return this.variables.minAltitude;
  }

  /**
   * End Movement of an object3D
   *
   * @param {Object3D} object3D - object3D to stop
   */
  stop(object3D) {
    this._removeObjectMoving(COMMAND.MOVE_FORWARD_START, object3D.uuid);
    this._removeObjectMoving(COMMAND.MOVE_BACKWARD_START, object3D.uuid);
    this._removeObjectMoving(COMMAND.MOVE_LEFT_START, object3D.uuid);
    this._removeObjectMoving(COMMAND.MOVE_RIGHT_START, object3D.uuid);
  }

  /**
   * An object3D freezed cant be move by manager
   *
   * @param {Object3D} object3D - object3D to freeze or not
   * @param {boolean} value - freeze or not an object3D
   */
  freeze(object3D, value) {
    object3D.userData[NativeCommandManager.FREEZE_KEY] = value;
  }

  /**
   *
   * @param {Object3D} object3D - object3d to clamp rotation
   */
  clampRotation(object3D) {
    // clamp
    object3D.rotation.y = 0;
    object3D.rotation.x = Math.max(
      Math.min(this.variables.angleMax, object3D.rotation.x),
      this.variables.angleMin
    );
  }

  static get ID_SCRIPT() {
    return 'native_command_manager_id';
  }

  static get EVENT() {
    return { OBJECT_3D_LEAVE_MAP: 'object_3d_leave_map' };
  }

  static get FREEZE_KEY() {
    return 'freeze_key';
  }

  /**
   * @typedef NativeCommandManagerVariables
   * @property {number} angleMin - angle min in the clamp rotation in radian
   * @property {number} angleMax - angle max in the clamp rotation in radian
   * @property {number} defaultSpeedRotate - speed rotate
   * @property {number} defaultSpeedTranslate - speed translate
   */

  /**
   * @returns {NativeCommandManagerVariables} - default native command manager variables
   */
  static get DEFAULT_VARIABLES() {
    return {
      angleMin: Math.PI / 5,
      angleMax: 2 * Math.PI - Math.PI / 10,
      defaultSpeedTranslate: 0.04,
      defaultSpeedRotate: 0.00001,
      maxAltitude: 500,
      minAltitude: 0,
    };
  }
};

/**
 * Move forward object3D of a certain value
 *
 * @param {Object3D} object3D - object3D to move forward
 * @param {number} value - amount to move forward
 * @param {AbstractMap} map - map script
 * @param {boolean} [withMap=true] - map should be consider
 * @returns {boolean} - the movement make the object3D leaves the map
 */
NativeCommandManager.moveForward = function (
  object3D,
  value,
  map,
  withMap = true
) {
  return NativeCommandManager.move(
    object3D,
    Object3D.computeForward(object3D).setLength(value),
    map,
    withMap
  );
};

/**
 * Move backward object3D of a certain value
 *
 * @param {Object3D} object3D - object3D to move backward
 * @param {number} value - amount to move backward
 * @param {AbstractMap} map - map script
 * @param {boolean} [withMap=true] - map should be consider
 * @returns {boolean} - the movement make the object3D leaves the map
 */
NativeCommandManager.moveBackward = function (
  object3D,
  value,
  map,
  withMap = true
) {
  return NativeCommandManager.move(
    object3D,
    Object3D.computeForward(object3D).negate().setLength(value),
    map,
    withMap
  );
};

/**
 * Move letf object3D of a certain value
 *
 * @param {Object3D} object3D - object3D to move left
 * @param {number} value - amount to move left
 * @param {AbstractMap} map - map script
 * @param {boolean} [withMap=true] - map should be consider
 * @returns {boolean} - the movement make the object3D leaves the map
 */
NativeCommandManager.moveLeft = function (
  object3D,
  value,
  map,
  withMap = true
) {
  return NativeCommandManager.move(
    object3D,
    Object3D.computeForward(object3D)
      .applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI * 0.5)
      .setLength(value),
    map,
    withMap
  );
};

/**
 * Move right object3D of a certain value
 *
 * @param {Object3D} object3D - object3D to move right
 * @param {number} value - amount to move right
 * @param {AbstractMap} map - map script
 * @param {boolean} [withMap=true] - map should be consider
 * @returns {boolean} - the movement make the object3D leaves the map
 */
NativeCommandManager.moveRight = function (
  object3D,
  value,
  map,
  withMap = true
) {
  return NativeCommandManager.move(
    object3D,
    Object3D.computeForward(object3D)
      .applyAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI * 0.5)
      .setLength(value),
    map,
    withMap
  );
};

/**
 * Move up object3D of a certain value
 *
 * @param {Object3D} object3D - object3D to move up
 * @param {number} value - amount to move up
 * @param {AbstractMap} map - map script
 * @param {boolean} [withMap=true] - map should be consider
 * @returns {boolean} - the movement make the object3D leaves the map
 */
NativeCommandManager.moveUp = function (object3D, value, map, withMap = true) {
  return NativeCommandManager.move(
    object3D,
    Object3D.computeUp(object3D)
      .applyAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI * 0.5)
      .setLength(value),
    map,
    withMap
  );
};

/**
 * Move up object3D of a certain value
 *
 * @param {Object3D} object3D - object3D to move up
 * @param {number} value - amount to move up
 * @param {AbstractMap} map - map script
 * @param {boolean} [withMap=true] - map should be consider
 * @returns {boolean} - the movement make the object3D leaves the map
 */
NativeCommandManager.moveDown = function (object3D, value) {
  return NativeCommandManager.move(
    object3D,
    Object3D.computeDown(object3D)
      .applyAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI * 0.5)
      .setLength(value)
  );
};

/**
 * Move object3D on a map
 *
 * @param {Object3D} object3D - object3D to move
 * @param {THREE.Vector3} vector - move vector
 * @param {AbstractMap} map - map script
 * @param {boolean} withMap - map should be consider
 * @returns {boolean} isOutOfMap - the movement make the object3D leaves the map
 */
NativeCommandManager.move = function (object3D, vector, map, withMap) {
  if (object3D.userData[NativeCommandManager.FREEZE_KEY]) return false; // object freezed cant move
  const oldPosition = object3D.position.clone();
  object3D.position.add(vector);
  let isOutOfMap = false;
  if (map && withMap) {
    isOutOfMap = !map.updateElevation(object3D);
    if (isOutOfMap) {
      object3D.position.copy(oldPosition); // cant leave the map
    }
  }
  object3D.setOutdated(true);
  return isOutOfMap;
};

/**
 * Rotate an object3D with an euler
 *
 * @param {Object3D} object3D - object3D to rotate
 * @param {THREE.Euler} euler - euler to rotate from
 */
NativeCommandManager.rotate = function (object3D, euler) {
  // shoudl check euler order
  object3D.rotateZ(euler.z);
  object3D.rotateX(euler.x);
  object3D.rotateY(euler.y);
  object3D.setOutdated(true);
};

module.exports = NativeCommandManager;
