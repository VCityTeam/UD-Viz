const ScriptBase = require('../Context').ScriptBase;
const AbstractMap = require('./AbstractMap');
const Object3D = require('../Object3D');
const { Component } = require('../Component/ExternalScript');
const Constants = require('./Constants');
const THREE = require('three');
const Data = require('../../Data');

const defaultVariables = {
  angleMin: Math.PI / 5,
  angleMax: 2 * Math.PI - Math.PI / 10,
  defaultSpeedTranslate: 0.04,
  defaultSpeedRotate: 0.00001,
};

/**
 * @classdesc - Manage native command
 */
const NativeCommandManager = class extends ScriptBase {
  constructor(context, object3D, variables) {
    const overWriteVariables = JSON.parse(JSON.stringify(defaultVariables));
    Data.objectOverWrite(overWriteVariables, variables);
    super(context, object3D, overWriteVariables);

    /**
     * state of the objects moving
     * 
     @type {Object<string,Array>}*/
    this.objectsMoving = {};
    this.objectsMoving[Constants.COMMAND.MOVE_FORWARD_START] = [];
    this.objectsMoving[Constants.COMMAND.MOVE_BACKWARD_START] = [];
    this.objectsMoving[Constants.COMMAND.MOVE_LEFT_START] = [];
    this.objectsMoving[Constants.COMMAND.MOVE_RIGHT_START] = [];
  }

  init() {
    /** @type {AbstractMap|null} */
    this.map = this.context.findGameScriptWithID(AbstractMap.ID_SCRIPT);
  }

  onCommand(type, data) {
    if (!data) return;

    /** @type {Object3D} */
    const updatedObject3D = this.context.object3D.getObjectByProperty(
      'uuid',
      data.object3DUUID
    );

    let externalScriptComponent = null;

    if (updatedObject3D) {
      externalScriptComponent = updatedObject3D.getComponent(Component.TYPE);
    }

    switch (type) {
      case Constants.COMMAND.MOVE_FORWARD:
        NativeCommandManager.moveForward(
          updatedObject3D,
          this.computeObjectSpeedTranslate(updatedObject3D) * this.context.dt,
          this.map,
          data.withMap
        );
        break;
      case Constants.COMMAND.MOVE_BACKWARD:
        NativeCommandManager.moveBackward(
          updatedObject3D,
          this.computeObjectSpeedTranslate(updatedObject3D) * this.context.dt,
          this.map,
          data.withMap
        );
        break;
      case Constants.COMMAND.ROTATE_LEFT:
        NativeCommandManager.rotate(
          updatedObject3D,
          new THREE.Vector3(
            0,
            0,
            this.computeObjectSpeedRotate(updatedObject3D) * this.context.dt
          )
        );
        break;
      case Constants.COMMAND.ROTATE_RIGHT:
        NativeCommandManager.rotate(
          updatedObject3D,
          new THREE.Vector3(
            0,
            0,
            -this.computeObjectSpeedRotate(updatedObject3D) * this.context.dt
          )
        );
        break;
      case Constants.COMMAND.UPDATE_TRANSFORM:
        if (!updatedObject3D) break; // updated object 3D is needed for this command

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
        break;
      case Constants.COMMAND.UPDATE_EXTERNALSCRIPT_VARIABLES:
        if (externalScriptComponent) {
          externalScriptComponent.getModel().variables[data.variableName] =
            data.variableValue;
          updatedObject3D.setOutdated(true);
        }
        break;
      case Constants.COMMAND.MOVE_FORWARD_START:
        Data.arrayPushOnce(
          this.objectsMoving[Constants.COMMAND.MOVE_FORWARD_START],
          updatedObject3D
        );
        break;
      case Constants.COMMAND.MOVE_FORWARD_END:
        Data.removeFromArray(
          this.objectsMoving[Constants.COMMAND.MOVE_FORWARD_START],
          updatedObject3D
        );
        break;
      case Constants.COMMAND.MOVE_BACKWARD_START:
        Data.arrayPushOnce(
          this.objectsMoving[Constants.COMMAND.MOVE_BACKWARD_START],
          updatedObject3D
        );
        break;
      case Constants.COMMAND.MOVE_BACKWARD_END:
        Data.removeFromArray(
          this.objectsMoving[Constants.COMMAND.MOVE_BACKWARD_START],
          updatedObject3D
        );
        break;
      case Constants.COMMAND.MOVE_LEFT_START:
        Data.arrayPushOnce(
          this.objectsMoving[Constants.COMMAND.MOVE_LEFT_START],
          updatedObject3D
        );
        break;
      case Constants.COMMAND.MOVE_LEFT_END:
        Data.removeFromArray(
          this.objectsMoving[Constants.COMMAND.MOVE_LEFT_START],
          updatedObject3D
        );
        break;
      case Constants.COMMAND.MOVE_RIGHT_START:
        Data.arrayPushOnce(
          this.objectsMoving[Constants.COMMAND.MOVE_RIGHT_START],
          updatedObject3D
        );
        break;
      case Constants.COMMAND.MOVE_RIGHT_END:
        Data.removeFromArray(
          this.objectsMoving[Constants.COMMAND.MOVE_RIGHT_START],
          updatedObject3D
        );
        break;
      case Constants.COMMAND.ROTATE:
        if (data.vector) {
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
        }
        break;
      case Constants.COMMAND.ADD_OBJECT3D:
        this.context.addObject3D(new Object3D(data.object3D), data.parentUUID);
        break;
      case Constants.COMMAND.REMOVE_OBJECT3D:
        this.context.removeObject3D(updatedObject3D.uuid);
        break;
      default:
        break;
    }
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

  tick() {
    // move objectsMoving
    this.objectsMoving[Constants.COMMAND.MOVE_FORWARD_START].forEach((o) => {
      NativeCommandManager.moveForward(
        o,
        this.computeObjectSpeedTranslate(o) * this.context.dt,
        this.map
      );
    });
    this.objectsMoving[Constants.COMMAND.MOVE_BACKWARD_START].forEach((o) => {
      NativeCommandManager.moveBackward(
        o,
        this.computeObjectSpeedTranslate(o) * this.context.dt,
        this.map
      );
    });
    this.objectsMoving[Constants.COMMAND.MOVE_LEFT_START].forEach((o) => {
      NativeCommandManager.moveLeft(
        o,
        this.computeObjectSpeedTranslate(o) * this.context.dt,
        this.map
      );
    });
    this.objectsMoving[Constants.COMMAND.MOVE_RIGHT_START].forEach((o) => {
      NativeCommandManager.moveRight(
        o,
        this.computeObjectSpeedTranslate(o) * this.context.dt,
        this.map
      );
    });
  }

  clampRotation(object3D) {
    // clamp
    object3D.rotation.y = 0;
    if (object3D.rotation.x > Math.PI) {
      object3D.rotation.x = Math.max(
        object3D.rotation.x,
        this.variables.angleMax
      );
    } else {
      object3D.rotation.x = Math.min(
        this.variables.angleMin,
        object3D.rotation.x
      );
    }
  }

  static get ID_SCRIPT() {
    return 'native_command_manager_id';
  }
};

/**
 * Move forward object3D of a certain value
 *
 * @param {Object3D} object3D - object3D to move forward
 * @param {number} value - amount to move forward
 * @param {AbstractMap} map - map script
 * @param {boolean} [withMap=true] - map should be consider
 */
NativeCommandManager.moveForward = function (
  object3D,
  value,
  map,
  withMap = true
) {
  NativeCommandManager.move(
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
 */
NativeCommandManager.moveBackward = function (
  object3D,
  value,
  map,
  withMap = true
) {
  NativeCommandManager.move(
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
 */
NativeCommandManager.moveLeft = function (
  object3D,
  value,
  map,
  withMap = true
) {
  NativeCommandManager.move(
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
 */
NativeCommandManager.moveRight = function (
  object3D,
  value,
  map,
  withMap = true
) {
  NativeCommandManager.move(
    object3D,
    Object3D.computeForward(object3D)
      .applyAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI * 0.5)
      .setLength(value),
    map,
    withMap
  );
};

/**
 * Move object3D on a map
 *
 * @param {Object3D} object3D - object3D to move
 * @param {THREE.Vector3} vector - move vector
 * @param {AbstractMap} map - map script
 * @param {boolean} withMap - map should be consider
 */
NativeCommandManager.move = function (object3D, vector, map, withMap) {
  const oldPosition = object3D.position.clone();
  object3D.position.add(vector);
  if (map && withMap) {
    const isOutOfMap = !map.updateElevation(object3D);
    if (isOutOfMap) {
      object3D.position.copy(oldPosition);
    }
  }
  object3D.setOutdated(true);
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
