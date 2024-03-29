import { AssetManager, RenderData } from './AssetManager';

import { Model, Controller, Object3D } from '@ud-viz/game_shared';
import * as THREE from 'three';

export class RenderController extends Controller {
  /**
   * Render component controller
   *
   * @param {Model} model - model of component controller
   * @param {Object3D} object3D - object3D of controller
   * @param {AssetManager} assetManager - asset manager
   */
  constructor(model, object3D, assetManager) {
    super(model, object3D);

    /** @type {AssetManager}*/
    this.assetManager = assetManager;

    /** 
     *  animation mixer only instanciated if there is animations in render data
     * 
     @type {THREE.AnimationMixer|null} */
    this.animationMixer = null;

    /** @type {RenderData} */
    this.renderData = null;

    /** @type {THREE.AnimationMixer} */
    this.animationMixer = null;

    this.setIdRenderData(this.model.idRenderData);

    // update color
    this.setColor(this.model.getColor());
  }

  dispose() {
    this.renderData.dispose();
  }

  setIdRenderData(idRenderData) {
    // change model
    this.model.idRenderData = idRenderData;

    // remove old one
    if (this.renderData) {
      this.renderData.dispose();
      this.renderData = null;
    }

    if (this.model.idRenderData) {
      this.renderData = this.assetManager.createRenderData(
        this.model.idRenderData
      );
      const animations = this.renderData.animations;
      if (animations && animations.length) {
        this.animationMixer = new THREE.AnimationMixer(
          this.renderData.object3D
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
    this.object3D.add(this.renderData.object3D);
    this.renderData.object3D.name = 'RENDER_OBJECT_3D_' + this.object3D.name;

    this.setColor(this.model.color); // update color
  }

  /**
   * Add object 3D
   *
   * @param {THREE.Object3D} obj - object3D to add
   */
  addObject3D(obj) {
    this.renderData.object3D.add(obj);
    this.setColor(this.model.getColor());
  }

  /**
   *
   * @returns {THREE.Object3D} - object3D controller
   */
  getObject3D() {
    return this.renderData.object3D;
  }

  /**
   *
   * @param {Array<number>} color - new value color controller rgba
   */
  setColor(color) {
    if (color.length != 4) throw new Error('color format should be rgba');

    const alpha = color[3];

    // only change color
    this.model.setColor(color);
    // update color in the controller attributes
    const threeColor = new THREE.Color().fromArray(color);
    this.renderData.object3D.traverse((child) => {
      if (child.material) {
        child.material.color = threeColor;
        if (alpha < 1) {
          // handle opacity
          child.material.opacity = alpha;
          child.material.transparent = true;
          child.renderOrder = 1;
        } else {
          child.material.transparent = false;
        }
        child.material.needsUpdate = true;
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
