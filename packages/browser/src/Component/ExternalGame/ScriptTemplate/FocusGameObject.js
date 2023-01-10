import { ExternalScriptBase, Context } from '../Context';
import * as THREE from 'three';
import { Game, Data } from '@ud-viz/core';

/**
 * @typedef FocusGameObjectVariables
 * @property {number} cameraAngle - minus angle on x of the camera angle
 * @property {number} minDist - minimum distance from the gameobject3D
 * @property {number} maxDist - maximum distance from the gameobject3D
 * @property {number} offsetZ - offset the camera position on z
 * @property {string} nameGO2Focus - name of the gameobject3D to focus
 */

/** @type {FocusGameObjectVariables} - default variables */
const defaultVariables = {
  cameraAngle: 0.51,
  minDist: 50,
  maxDist: 1000,
  offsetZ: 10,
  nameGO2Focus: null,
};

export class FocusGameObject extends ExternalScriptBase {
  /**
   * Focus a gameobject3D according a name
   *
   * @param {Context} context - external game context
   * @param {Game.Object3D} object3D - object3D of this script
   * @param {FocusGameObjectVariables} variables - variables {@link FocusGameObjectVariables}
   */
  constructor(context, object3D, variables) {
    // Overwrite conf
    const overWriteVariables = JSON.parse(JSON.stringify(defaultVariables));
    Data.objectOverWrite(overWriteVariables, variables);
    super(context, object3D, overWriteVariables);

    // Quaternion to place the camera
    this.quaternionCam = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(Math.PI * 0.5, 0, 0)
    );
    this.quaternionAngle = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(-this.variables.cameraAngle, 0, 0)
    );

    // Initial distance of the camera with the go2Focus
    this.distance = this.variables.minDist;
  }

  init() {
    // register wheel event to modify the distance
    this.context.inputManager.addMouseInput(
      this.context.frame3D.html(),
      'wheel',
      (event) => {
        this.distance += event.wheelDelta * 0.1;
        this.distance = Math.max(
          Math.min(this.distance, this.variables.maxDist),
          this.variables.minDist
        );
      }
    );
  }

  /**
   * Update camera position
   */
  tick() {
    // Get the go2Focus gameobject by name
    const go2Focus = this.context.object3D.getObjectByProperty(
      'name',
      this.variables.nameGO2Focus
    );

    if (!go2Focus) throw 'no gameobject';

    // Compute world transform
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    go2Focus.matrixWorld.decompose(position, quaternion, new THREE.Vector3());

    // Move the position a bit up (z is up)
    position.z += this.variables.offsetZ;

    // Compute camera position
    const dir = Game.Object3D.DefaultForward()
      .applyQuaternion(this.quaternionAngle)
      .applyQuaternion(quaternion);

    position.sub(dir.setLength(this.distance));
    quaternion.multiply(this.quaternionCam);
    quaternion.multiply(this.quaternionAngle);

    // update camera position
    const camera = this.context.frame3D.getCamera();
    camera.position.copy(position);
    camera.quaternion.copy(quaternion);
    camera.updateProjectionMatrix();
  }
}
