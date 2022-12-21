import { Controller } from '@ud-viz/core/src/Game/GameObject/Component/Component';
import * as THREE from 'three';

export class RenderController extends Controller {
  constructor(assetsManager, model, parentGO) {
    super(assetsManager, model, parentGO);

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
    // update color in the controller attributes
    this.renderData.getObject3D().traverse((child) => {
      if (child.material) child.material.color = color;
    });
  }

  tick(dt) {
    if (this.animationMixer) {
      this.animationMixer.update(dt * 0.001);
    }
  }

  // setIdRenderData(idRenderData) {
  //   console.log('TODO');
  //   gRenderComp.initAssets(_this.getAssetsManager());
  // }
}

export { RenderController as Controller };
