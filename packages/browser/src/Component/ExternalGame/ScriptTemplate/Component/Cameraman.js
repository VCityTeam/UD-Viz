import * as THREE from 'three';
import { Game } from '@ud-viz/core';

/**
 * @callback Movement
 * @param {number} dt - delta time movement
 */

export class Cameraman {
  /**
   * Handle camera movement (you need to tick it)
   *
   * @param {THREE.PerspectiveCamera} camera - camera to move
   */
  constructor(camera) {
    /** @type {THREE.PerspectiveCamera} - camera handle by cameraman */
    this.camera = camera;

    /** @type {Movement|null} - the current movement */
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

  computeCameraTransform(object3D, distance, offset, angle) {
    // Compute world transform
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    object3D.matrixWorld.decompose(position, quaternion, new THREE.Vector3());

    // offset position
    position.add(offset);

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

  followObject3D(object3D, distance, offset, angle) {
    if (this.target) console.warn('already was a target');
    this.target = new Target(object3D, distance, offset, angle);
  }

  stopFollowObject3D() {
    this.target = null;
  }

  moveToObject3D(object3D, duration, distance, offset, angle) {
    return new Promise((resolve) => {
      if (this.currentMovement) {
        resolve(false);
        return;
      }
      const startPos = this.camera.position.clone();
      const startQuat = this.camera.quaternion.clone();
      let currentTime = 0;

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

  moveToTransform(position, quaternion, duration) {
    return new Promise((resolve) => {
      if (this.currentMovement) {
        resolve(false);
        return;
      }
      const startPos = this.camera.position.clone();
      const startQuat = this.camera.quaternion.clone();
      let currentTime = 0;

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

class Target {
  constructor(object3D, distance, offset, angle) {
    this.object3D = object3D;
    this.distance = distance;
    this.offset = offset;
    this.angle = angle;
  }
}
