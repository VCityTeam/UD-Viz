import * as THREE from 'three';
import { Game } from '@ud-viz/shared';
import { ExternalScriptBase } from '../Context';

/**
 * @callback Movement
 * @param {number} dt - delta time movement
 */

export class CameraManager extends ExternalScriptBase {
  constructor(context, object3D, variables) {
    super(context, object3D, variables);

    /** @type {Movement|null} */
    this.currentMovement = null;

    /**
     * target object3D
     *
     @type {Target|null} */
    this.target = null;
  }

  /**
   * Step the current movement if there is not follow a target if not nothing
   */
  tick() {
    if (this.currentMovement) {
      this.currentMovement(this.context.dt);
    } else if (this.target) {
      const { position, quaternion } = this.computeCameraTransform(
        this.target.object3D,
        this.target.distance,
        this.target.offset,
        this.target.angle
      );
      this.context.frame3D.camera.position.copy(position);
      this.context.frame3D.camera.quaternion.copy(quaternion);
      this.context.frame3D.camera.updateProjectionMatrix();
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
   * Camera start following object3D target
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
   * Camera move to object3D
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
      const startPos = this.context.frame3D.camera.position.clone();
      const startQuat = this.context.frame3D.camera.quaternion.clone();
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

        this.context.frame3D.camera.position.copy(p);
        this.context.frame3D.camera.quaternion.copy(q);
        this.context.frame3D.camera.updateProjectionMatrix();

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
      const startPos = this.context.frame3D.camera.position.clone();
      const startQuat = this.context.frame3D.camera.quaternion.clone();
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

        this.context.frame3D.camera.position.copy(p);
        this.context.frame3D.camera.quaternion.copy(q);
        this.context.frame3D.camera.updateProjectionMatrix();

        if (ratio >= 1) {
          this.currentMovement = null;
          resolve(true);
        }
      };
    });
  }

  /**
   * Move camera to bounding box
   *
   * @param {THREE.Box3} bb - bounding box
   * @param {number} duration - time movement in ms
   * @returns {Promise<boolean>} - promise resolving when movement is done resolve with true if movement occured false otherwise
   */
  moveToBoundingBox(bb, duration) {
    const center = bb.getCenter(new THREE.Vector3());
    const radius = bb.min.distanceTo(bb.max) * 0.5;

    // compute new distance between camera and center of object/sphere
    const h =
      radius /
      Math.tan((this.context.frame3D.camera.fov / 2) * THREE.Math.DEG2RAD);
    const dir = new THREE.Vector3(1, 1, 1).normalize(); // hard coded direction
    const newPos = new THREE.Vector3().addVectors(center, dir.setLength(h));
    const oldRot = this.context.frame3D.camera.rotation.clone();
    const oldPos = this.context.frame3D.camera.position.clone();
    this.context.frame3D.camera.position.copy(newPos);
    this.context.frame3D.camera.lookAt(center);
    this.context.frame3D.camera.updateProjectionMatrix();
    const targetRot = this.context.frame3D.camera.rotation.clone();
    this.context.frame3D.camera.rotation.copy(oldRot);
    this.context.frame3D.camera.position.copy(oldPos);
    this.context.frame3D.camera.updateProjectionMatrix();

    return this.moveToTransform(
      newPos,
      new THREE.Quaternion().setFromEuler(targetRot),
      duration
    );
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
