import { Game } from '@ud-viz/core';
import * as THREE from 'three';
import { AssetManager } from '../Component';

export class RenderController extends Game.Component.Controller {
  /**
   *
   * @param {*} model
   * @param {*} object3D
   * @param {AssetManager} assetManager
   */
  constructor(model, object3D, assetManager) {
    super(model, object3D);

    this.assetManager = assetManager;

    /** @type {THREE.AnimationMixer} */
    this.animationMixer = null;

    /** @type {RenderData} */
    this.renderData = this.assetManager.createRenderData(
      this.model.getIdRenderData()
    );

    this.renderData.object3D.name = 'Render_Controller_' + this.object3D.name;

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

    // register in parent
    this.object3D.add(this.renderData.getObject3D());
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
