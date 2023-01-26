import * as THREE from 'three';
import { Game } from '@ud-viz/core';

/**
 * @callback Movement
 * @param {number} dt - delta time movement
 */

/** @class */
export class Cameraman {
  /**
   * Handle camera movement (you need to tick it)
   *
   * @param {THREE.PerspectiveCamera} camera - camera to move
   */
  constructor(camera) {
    /**
     * camera handle by cameraman
     *
     * @type {THREE.PerspectiveCamera}
     */
    this.camera = camera;

    /** @type {Movement|null} */
    this.currentMovement = null;
  }

  /**
   *
   * @param {number} dt - tick delta time
   */
  tick(dt) {
    if (this.currentMovement) {
      this.currentMovement(dt);
    } else if (this.target) {
      const { position, quaternion } = this.computeCameraTransform(
        this.target.object3D,
        this.target.distance,
        this.target.offset,
        this.target.angle
      );
      this.camera.position.copy(position);
      this.camera.quaternion.copy(quaternion);
      this.camera.updateProjectionMatrix();
    }
  }

  /**
   * Compute camera transform (position + quaternion) to focus object3D
   *
   * @param {THREE.Object3D} object3D - object3D to focus
   * @param {number} distance - distance from object3D
   * @param {{x:number,y:number,z:number}} offset - offset camera position
   * @param {number} angle - angle on x
   * @returns {{position:THREE.Vector3,quaternion:THREE.Quaternion}} - transform of camera
   */
  computeCameraTransform(object3D, distance, offset, angle) {
    // Compute world transform
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    object3D.matrixWorld.decompose(position, quaternion, new THREE.Vector3());

    // offset position
    position.add(new THREE.Vector3(offset.x, offset.y, offset.z));

    // Compute camera position
    const quaternionAngle = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(-angle, 0, 0)
    );

    const dir = Game.Object3D.DefaultForward()
      .applyQuaternion(quaternionAngle)
      .applyQuaternion(quaternion);

    position.sub(dir.setLength(distance));
    quaternion.multiply(
      new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI * 0.5, 0, 0))
    );
    quaternion.multiply(quaternionAngle);

    return { position: position, quaternion: quaternion };
  }

  /**
   * Cameraman start following object3D target
   *
   * @param {THREE.Object3D} object3D - object3D to focus
   * @param {number} distance - distance from object3D
   * @param {{x:number,y:number,z:number}} offset - offset camera position
   * @param {number} angle - angle on x
   */
  followObject3D(object3D, distance, offset, angle) {
    if (this.target) console.warn('already was a target');
    this.target = new Target(object3D, distance, offset, angle);
  }

  /**
   * Stop following object3D target
   */
  stopFollowObject3D() {
    this.target = null;
  }

  /**
   * Cameraman move to object3D
   *
   * @param {THREE.Object3D} object3D - object3D to focus
   * @param {number} duration - time of movement in ms
   * @param {number} distance - distance from object3D
   * @param {{x:number,y:number,z:number}} offset - offset camera position
   * @param {number} angle - angle on x
   * @returns {Promise} - promise resolving when movement is done resolve with true if movement occured false otherwise
   */
  moveToObject3D(object3D, duration, distance, offset, angle) {
    return new Promise((resolve) => {
      if (this.currentMovement) {
        resolve(false);
        return;
      }
      const startPos = this.camera.position.clone();
      const startQuat = this.camera.quaternion.clone();
      let currentTime = 0;

      /**
       *  This function is going to be tick in `this.tick`.
       *
       * @see Movement
       * @type {Movement}
       */
      this.currentMovement = (dt) => {
        currentTime += dt;
        let ratio = currentTime / duration;
        ratio = Math.min(Math.max(0, ratio), 1);

        const { position, quaternion } = this.computeCameraTransform(
          object3D,
          distance,
          offset,
          angle
        );

        const p = position.clone().lerp(startPos, 1 - ratio);
        const q = quaternion.clone().slerp(startQuat, 1 - ratio);

        this.camera.position.copy(p);
        this.camera.quaternion.copy(q);
        this.camera.updateProjectionMatrix();

        if (ratio >= 1) {
          this.currentMovement = null;
          resolve(true);
        }
      };
    });
  }

  /**
   * Move camera to transform (position + quaternion)
   *
   * @param {THREE.Vector3} position - target camera position
   * @param {THREE.Quaternion} quaternion - target camera quaternion
   * @param {number} duration - time of movement in ms
   * @returns {Promise<boolean>} - promise resolving when movement is done resolve with true if movement occured false otherwise
   */
  moveToTransform(position, quaternion, duration) {
    return new Promise((resolve) => {
      if (this.currentMovement) {
        resolve(false);
        return;
      }
      const startPos = this.camera.position.clone();
      const startQuat = this.camera.quaternion.clone();
      let currentTime = 0;

      /**
       *  This function is going to be tick in `this.tick`. @see Movement
       *
       * @type {Movement}
       */
      this.currentMovement = (dt) => {
        currentTime += dt;
        let ratio = currentTime / duration;
        ratio = Math.min(Math.max(0, ratio), 1);

        const p = position.clone().lerp(startPos, 1 - ratio);
        const q = quaternion.clone().slerp(startQuat, 1 - ratio);

        this.camera.position.copy(p);
        this.camera.quaternion.copy(q);
        this.camera.updateProjectionMatrix();

        if (ratio >= 1) {
          this.currentMovement = null;
          resolve(true);
        }
      };
    });
  }
}

/** @class */
class Target {
  /**
   * Buffer object which store all data to keep following an object3D target
   *
   * @param {THREE.Object3D} object3D - object3D to focus
   * @param {number} distance - distance from object3D
   * @param {{x:number,y:number,z:number}} offset - offset camera position
   * @param {number} angle - angle on x
   */
  constructor(object3D, distance, offset, angle) {
    this.object3D = object3D;
    this.distance = distance;
    this.offset = offset;
    this.angle = angle;
  }
}
