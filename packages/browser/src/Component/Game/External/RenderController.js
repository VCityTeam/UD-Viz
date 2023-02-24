import { Game } from '@ud-viz/shared';
import * as THREE from 'three';
import { AssetManager, RenderData } from '../../Component';

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

    /** @type {AssetManager} - asset manager */
    this.assetManager = assetManager;

    /** @type {THREE.AnimationMixer|null} - animation mixer only instanciated if there is animations in render data */
    this.animationMixer = null;

    /** @type {RenderData} - render data */
    this.renderData = null;

    /** @type {THREE.AnimationMixer} */
    this.animationMixer = null;

    if (this.model.getIdRenderData()) {
      this.renderData = this.assetManager.createRenderData(
        this.model.getIdRenderData()
      );
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
    } else {
      this.renderData = new RenderData(new THREE.Object3D());
    }

    // register in parent
    this.object3D.add(this.renderData.getObject3D());

    // update color
    this.setColor(this.model.getColor());
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
   * @param {Array<number>} color - new value color controller rgba
   */
  setColor(color) {
    if (color.length != 4) throw new Error('color format should be rgba');

    const alpha = color[3];

    // only change color TODO handle alpha
    this.model.setColor(color);
    // update color in the controller attributes
    const threeColor = new THREE.Color().fromArray(color);
    this.renderData.getObject3D().traverse((child) => {
      if (child.material) {
        child.material.color = threeColor;
        if (alpha < 1) {
          // handle opacity
          child.material.opacity = alpha;
          child.material.transparent = true;
          child.renderOrder = 1; // patch for futurologue not working
        } else {
          child.material.transparent = false;
        }
      }
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
