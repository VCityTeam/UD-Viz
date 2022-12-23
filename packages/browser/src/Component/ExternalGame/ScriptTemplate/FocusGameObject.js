import { ExternalScriptBase } from '../Context';
import * as THREE from 'three';
import { JSONUtil } from '@ud-viz/core';

const defaultConfig = {
  cameraAngle: 0.51,
  minDist: 50,
  maxDist: 1000,
  offsetZ: 10,
  nameGO2Focus: null,
};

export class FocusGameObject extends ExternalScriptBase {
  constructor(conf, context, parentGO) {
    // Overwrite conf
    const overWriteConf = JSON.parse(JSON.stringify(defaultConfig));
    JSONUtil.overWrite(overWriteConf, conf);
    super(overWriteConf, context, parentGO);

    // Quaternion to place the camera
    this.quaternionCam = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(Math.PI * 0.5, 0, 0)
    );
    this.quaternionAngle = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(-this.conf.cameraAngle, 0, 0)
    );

    // Initial distance of the camera with the go2Focus
    this.distance = this.conf.minDist;
  }

  init() {
    const gV = this.context.getGameView();
    const manager = gV.getInputManager();
    manager.addMouseInput(gV.html(), 'wheel', (event) => {
      this.distance += event.wheelDelta * 0.1;
      this.distance = Math.max(
        Math.min(this.distance, this.conf.maxDist),
        this.conf.minDist
      );
    });
  }

  tick() {
    // Get the go2Focus gameobject by name
    const go2Focus = this.parentGameObject
      .computeRoot()
      .findByName(this.conf.nameGO2Focus);

    if (!go2Focus) throw 'no gameobject';

    // Compute world transform
    const obj = this.context.computeObject3D(go2Focus);
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    obj.matrixWorld.decompose(position, quaternion, new THREE.Vector3());

    // Move the position a bit up (z is up)
    position.z += this.conf.offsetZ;

    // Compute camera position
    const dir = go2Focus
      .getDefaultForward()
      .applyQuaternion(this.quaternionAngle)
      .applyQuaternion(quaternion);

    position.sub(dir.setLength(this.distance));
    quaternion.multiply(this.quaternionCam);
    quaternion.multiply(this.quaternionAngle);

    // Tweak values in camera object
    const camera = this.context.getGameView().getCamera();
    camera.position.copy(position);
    camera.quaternion.copy(quaternion);
    camera.updateProjectionMatrix();
  }
}
