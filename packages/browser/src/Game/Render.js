import { Controller } from '@ud-viz/core/src/Game/GameObject/Components/Component';
import * as THREE from 'three';

export class RenderController extends Controller {
  constructor(assetsManager, model) {
    super(assetsManager, model);

    this.renderData = this.assetsManager.createRenderData(
      this.model.getIdRenderData()
    );

    /** @type {THREE.AnimationMixer} */
    this.animationMixer = null;

    this.init();
  }

  init() {
    const animations = this.renderData.getAnimations();
    if (animations && animations.length) {
      this.animationMixer = new THREE.AnimationMixer(
        this.renderData.getObject3D()
      );
      animations.forEach((animClip) => {
        const action = this.animationMixer.clipAction(animClip);
        action.play(); // Play action is default behaviour
      });
    }

    this.setColor(this.model.getColor());
  }

  /**
   * Add a custom object 3D
   *
   * @param {THREE.Object3D} obj
   */
  addObject3D(obj) {
    this.renderData.getObject3D().add(obj);
    this.setColor(this.model.getColor());
  }

  getObject3D() {
    return this.renderData.getObject3D();
  }

  setColor(color) {
    this.model.setColor(color);
    //update color in the controller attributes
    this.renderData.getObject3D().traverse((child) => {
      if (child.material) child.material.color = color;
    });
  }

  tick(dt) {
    if (this.animationMixer) {
      this.animationMixer.update(dt * 0.001);
    }
  }

  setIdRenderData(idRenderData) {
    console.log('TODO');
    gRenderComp.initAssets(_this.getAssetsManager());
  }
}

class RenderData {
  constructor(object3D, animations = null) {
    this.object3D = object3D;
    this.animations = animations;
  }

  getObject3D() {
    return this.object3D;
  }

  getAnimations() {
    return this.animations;
  }

  clone() {
    const cloneObject = this.object3D.clone();
    cloneObject.traverse((child) => {
      if (child.material) {
        child.material = child.material.clone();
        child.material.needsUpdate = true;
      }
    });

    return new RenderData(cloneObject, this.animations);
  }
}

export { RenderController as Controller, RenderData };
