const ScriptBase = require('../Context').ScriptBase;
const Object3D = require('../Object3D');
const { Component } = require('../Component/ExternalScript');
const Constants = require('./Constants');
const THREE = require('three');
const Data = require('../../Data');

const defaultVariables = {
  angleMin: Math.PI / 5,
  angleMax: 2 * Math.PI - Math.PI / 10,
  speedTranslate: 0.04,
  speedRotate: 0.00001,
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

  tick() {
    this.context.commands.forEach((command) => {
      if (!command.data) return;

      /** @type {Object3D} */
      const updatedObject3D = this.context.object3D.getObjectByProperty(
        'uuid',
        command.data.object3DUUID
      );

      if (!updatedObject3D) return;

      const externalScriptComponent = updatedObject3D.getComponent(
        Component.TYPE
      );

      let indexObjectMoving = -1;

      switch (command.type) {
        case Constants.COMMAND.MOVE_FORWARD:
          NativeCommandManager.moveForward(
            updatedObject3D,
            this.variables.speedTranslate * this.context.dt
          );
          break;
        case Constants.COMMAND.MOVE_BACKWARD:
          NativeCommandManager.moveBackward(
            updatedObject3D,
            this.variables.speedTranslate * this.context.dt
          );
          break;
        case Constants.COMMAND.ROTATE_LEFT:
          NativeCommandManager.rotate(
            updatedObject3D,
            new THREE.Vector3(
              0,
              0,
              this.variables.speedRotate * this.context.dt
            )
          );
          break;
        case Constants.COMMAND.ROTATE_RIGHT:
          NativeCommandManager.rotate(
            updatedObject3D,
            new THREE.Vector3(
              0,
              0,
              -this.variables.speedRotate * this.context.dt
            )
          );
          break;
        case Constants.COMMAND.UPDATE_TRANSFORM:
          if (command.data.position) {
            if (!isNaN(command.data.position.x)) {
              updatedObject3D.position.x = command.data.position.x;
              updatedObject3D.setOutdated(true);
            }
            if (!isNaN(command.data.position.y)) {
              updatedObject3D.position.y = command.data.position.y;
              updatedObject3D.setOutdated(true);
            }
            if (!isNaN(command.data.position.z)) {
              updatedObject3D.position.z = command.data.position.z;
              updatedObject3D.setOutdated(true);
            }
          }
          if (command.data.scale) {
            if (!isNaN(command.data.scale.x)) {
              updatedObject3D.scale.x = command.data.scale.x;
              updatedObject3D.setOutdated(true);
            }
            if (!isNaN(command.data.scale.y)) {
              updatedObject3D.scale.y = command.data.scale.y;
              updatedObject3D.setOutdated(true);
            }
            if (!isNaN(command.data.scale.z)) {
              updatedObject3D.scale.z = command.data.scale.z;
              updatedObject3D.setOutdated(true);
            }
          }
          break;
        case Constants.COMMAND.UPDATE_EXTERNALSCRIPT_VARIABLES:
          if (externalScriptComponent) {
            externalScriptComponent.getModel().variables[
              command.data.variableName
            ] = command.data.variableValue;
            updatedObject3D.setOutdated(true);
            // console.log(
            //   'update ',
            //   command.data.nameVariable,
            //   ' set with ',
            //   command.data.variableValue
            // );
          }
          break;
        case Constants.COMMAND.MOVE_FORWARD_START:
          if (
            !this.objectsMoving[Constants.COMMAND.MOVE_FORWARD_START].includes(
              updatedObject3D
            )
          ) {
            this.objectsMoving[Constants.COMMAND.MOVE_FORWARD_START].push(
              updatedObject3D
            );
          }
          break;
        case Constants.COMMAND.MOVE_FORWARD_END:
          indexObjectMoving =
            this.objectsMoving[Constants.COMMAND.MOVE_FORWARD_START].indexOf(
              updatedObject3D
            );
          if (indexObjectMoving >= 0)
            this.objectsMoving[Constants.COMMAND.MOVE_FORWARD_START].splice(
              indexObjectMoving,
              1
            );
          break;
        case Constants.COMMAND.MOVE_BACKWARD_START:
          if (
            !this.objectsMoving[Constants.COMMAND.MOVE_BACKWARD_START].includes(
              updatedObject3D
            )
          ) {
            this.objectsMoving[Constants.COMMAND.MOVE_BACKWARD_START].push(
              updatedObject3D
            );
          }
          break;
        case Constants.COMMAND.MOVE_BACKWARD_END:
          indexObjectMoving =
            this.objectsMoving[Constants.COMMAND.MOVE_BACKWARD_START].indexOf(
              updatedObject3D
            );
          if (indexObjectMoving >= 0)
            this.objectsMoving[Constants.COMMAND.MOVE_BACKWARD_START].splice(
              indexObjectMoving,
              1
            );
          break;
        case Constants.COMMAND.MOVE_LEFT_START:
          if (
            !this.objectsMoving[Constants.COMMAND.MOVE_LEFT_START].includes(
              updatedObject3D
            )
          ) {
            this.objectsMoving[Constants.COMMAND.MOVE_LEFT_START].push(
              updatedObject3D
            );
          }
          break;
        case Constants.COMMAND.MOVE_LEFT_END:
          indexObjectMoving =
            this.objectsMoving[Constants.COMMAND.MOVE_LEFT_START].indexOf(
              updatedObject3D
            );
          if (indexObjectMoving >= 0)
            this.objectsMoving[Constants.COMMAND.MOVE_LEFT_START].splice(
              indexObjectMoving,
              1
            );
          break;
        case Constants.COMMAND.MOVE_RIGHT_START:
          if (
            !this.objectsMoving[Constants.COMMAND.MOVE_RIGHT_START].includes(
              updatedObject3D
            )
          ) {
            this.objectsMoving[Constants.COMMAND.MOVE_RIGHT_START].push(
              updatedObject3D
            );
          }
          break;
        case Constants.COMMAND.MOVE_RIGHT_END:
          indexObjectMoving =
            this.objectsMoving[Constants.COMMAND.MOVE_RIGHT_START].indexOf(
              updatedObject3D
            );
          if (indexObjectMoving >= 0)
            this.objectsMoving[Constants.COMMAND.MOVE_RIGHT_START].splice(
              indexObjectMoving,
              1
            );
          break;
        case Constants.COMMAND.ROTATE:
          if (command.data.vector) {
            if (!isNaN(command.data.vector.x)) {
              updatedObject3D.rotateX(
                command.data.vector.x *
                  this.context.dt *
                  this.variables.speedRotate
              );
            }
            if (!isNaN(command.data.vector.y)) {
              updatedObject3D.rotateY(
                command.data.vector.y *
                  this.context.dt *
                  this.variables.speedRotate
              );
            }
            if (!isNaN(command.data.vector.z)) {
              updatedObject3D.rotateZ(
                command.data.vector.z *
                  this.context.dt *
                  this.variables.speedRotate
              );
            }
            this.clampRotation(updatedObject3D);
            updatedObject3D.setOutdated(true);
          }
          break;
        case Constants.COMMAND.ADD_OBJECT3D:
          console.error('no implemented');
          break;
        case Constants.COMMAND.REMOVE_OBJECT3D:
          this.context.removeObject3D(updatedObject3D.uuid);
          break;
        default:
          break;
      }
    });

    // move objectsMoving
    this.objectsMoving[Constants.COMMAND.MOVE_FORWARD_START].forEach((o) => {
      NativeCommandManager.moveForward(
        o,
        this.variables.speedTranslate * this.context.dt
      );
    });
    this.objectsMoving[Constants.COMMAND.MOVE_BACKWARD_START].forEach((o) => {
      NativeCommandManager.moveBackward(
        o,
        this.variables.speedTranslate * this.context.dt
      );
    });
    this.objectsMoving[Constants.COMMAND.MOVE_LEFT_START].forEach((o) => {
      NativeCommandManager.moveLeft(
        o,
        this.variables.speedTranslate * this.context.dt
      );
    });
    this.objectsMoving[Constants.COMMAND.MOVE_RIGHT_START].forEach((o) => {
      NativeCommandManager.moveRight(
        o,
        this.variables.speedTranslate * this.context.dt
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
};

/**
 * Move forward object3D of a certain value
 *
 * @param {Object3D} object3D - object3D to move forward
 * @param {number} value - amount to move forward
 */
NativeCommandManager.moveForward = function (object3D, value) {
  object3D.position.add(Object3D.computeForward(object3D).setLength(value));
  object3D.setOutdated(true);
};

/**
 * Move backward object3D of a certain value
 *
 * @param {Object3D} object3D - object3D to move backward
 * @param {number} value - amount to move backward
 */
NativeCommandManager.moveBackward = function (object3D, value) {
  object3D.position.add(
    Object3D.computeForward(object3D).negate().setLength(value)
  );
  object3D.setOutdated(true);
};

/**
 * Move letf object3D of a certain value
 *
 * @param {Object3D} object3D - object3D to move left
 * @param {number} value - amount to move left
 */
NativeCommandManager.moveLeft = function (object3D, value) {
  object3D.position.add(
    Object3D.computeForward(object3D)
      .applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI * 0.5)
      .setLength(value)
  );
  object3D.setOutdated(true);
};

/**
 * Move right object3D of a certain value
 *
 * @param {Object3D} object3D - object3D to move right
 * @param {number} value - amount to move right
 */
NativeCommandManager.moveRight = function (object3D, value) {
  object3D.position.add(
    Object3D.computeForward(object3D)
      .applyAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI * 0.5)
      .setLength(value)
  );
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
