import { Game } from '@ud-viz/shared';
import * as THREE from 'three';
import { AssetManager, RenderData } from '../Component';

export class RenderController extends Game.Component.Controller {
  /**
   * Render component controller
   *
   * @param {Game.Component.Model} model - model of component controller
   * @param {Game.Object3D} object3D - object3D of controller
   * @param {AssetManager} assetManager - asset manager
   */
  constructor(model, object3D, assetManager) {
    super(model, object3D);

    /**
     * asset manager
     *
      @type {AssetManager} */
    this.assetManager = assetManager;

    /**
     * animation mixer only instanciated if there is animations in render data
     *
      @type {THREE.AnimationMixer|null} */
    this.animationMixer = null;

    /**
     * render data
     *
      @type {RenderData} */
    this.renderData = this.assetManager.createRenderData(
      this.model.getIdRenderData()
    );

    // rename object3D
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

    // update color
    this.setColor(this.model.getColor());

    // register in parent
    this.object3D.add(this.renderData.getObject3D());
  }

  /**
   * Add object 3D
   *
   * @param {THREE.Object3D} obj - object3D to add
   */
  addObject3D(obj) {
    this.renderData.getObject3D().add(obj);
    this.setColor(this.model.getColor());
  }

  /**
   *
   * @returns {THREE.Object3D} - object3D controller
   */
  getObject3D() {
    return this.renderData.getObject3D();
  }

  /**
   *
   * @param {THREE.Color} color - new value color controller
   */
  setColor(color) {
    this.model.setColor(color);
    // update color in the controller attributes
    this.renderData.getObject3D().traverse((child) => {
      if (child.material) child.material.color = color;
    });
  }

  /**
   *
   * @param {number} dt - delta time to update animations
   */
  tick(dt) {
    if (this.animationMixer) {
      this.animationMixer.update(dt * 0.001);
    }
  }
}
