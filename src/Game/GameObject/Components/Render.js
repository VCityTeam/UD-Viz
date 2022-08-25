/** @format */

const THREE = require('three');

/**
 *  Component used to handle the 3D rendering of the GameObject
 */
const RenderModule = class Render {
  /**
   * Create a new Render component of a GameObject from json
   * @param {GameObject} parent gameobject of this component
   * @param {JSON} json
   */
  constructor(parent, json) {
    /**@type {GameObject} gameobject of this component*/
    this.parent = parent;

    /**uuid of the component. Init from the field uuid of the json (If it does not exist, a uuid is generated). */
    this.uuid = json.uuid || THREE.MathUtils.generateUUID();

    /**
     * id of the 3D model used. Init from the field idRenderData of the json.
     * @type {String}
     * @note the field has been renamed, idModel => idRenderData
     */
    this.idRenderData = json.idRenderData || null; //TODO could be an array of id

    /**Color of the 3D model
     * @type {THREE.Color}
     */
    this.color = new THREE.Color().fromArray(json.color || [1, 1, 1]);

    /** @type {THREE.Object3D} */
    this.object3D = null;

    /**@type {THREE.AnimationClip[]} */
    this.animations = null;
    /**@type {THREE.AnimationMixer} */
    this.animationMixer = null;
    this.actions = {};
  }

  /**
   * This component cant run on server side
   * @returns {Boolean}
   */
  isServerSide() {
    return false;
  }

  /**
   * Compute this to JSON
   * @returns {JSON}
   */
  toJSON() {
    return {
      uuid: this.uuid,
      type: RenderModule.TYPE,
      idRenderData: this.idRenderData,
      color: this.color.toArray(),
    };
  }

  /**
   *
   * @returns {THREE.Object3D}
   */
  getObject3D() {
    return this.object3D;
  }

  /**
   * Set color of the 3D model
   * @param {THREE.Color} value
   */
  setColor(value) {
    this.color = value;
    if (this.object3D) {
      this.object3D.traverse(function (c) {
        if (c.material) c.material.color = value;
      });
    }
  }

  /**
   *
   * @returns {THREE.Color}
   */
  getColor() {
    return this.color;
  }

  setIdRenderData(value) {
    this.idRenderData = value;
  }

  getIdRenderData() {
    return this.idRenderData;
  }

  /**
   * Check if the color differed from component and update if needed
   * @param {JSON} component the component to update to
   * @param {LocalContext} localContext local context of the GameView
   */
  updateFromComponent(outdated, component, localContext) {
    let result = false;

    if (!this.color.equals(component.getColor())) {
      this.setColor(component.getColor());
      result = true;
    }

    if (this.idRenderData != component.getIdRenderData()) {
      this.idRenderData = component.getIdRenderData();
      this.initAssets(localContext.getGameView().getAssetsManager());
      result = true;
    }

    return result;
  }

  /**
   * Add a custom object 3D to this model
   * @param {THREE.Object3D} obj
   */
  addObject3D(obj) {
    this.object3D.add(obj);
    this.setColor(this.color);
  }

  /**
   * Initialize 3D model
   * @param {AssetsManager} assetsManager local assetsManager
   * @param {Shared} udvShared ud-viz/Game/Shared module
   */
  initAssets(assetsManager, udvShared) {
    this.object3D = new THREE.Object3D();
    this.object3D.name = 'Render Object3D ' + this.parent.getName();

    //get the 3D model
    if (this.idRenderData) {
      const data = assetsManager.createRenderData(this.idRenderData);
      this.object3D.add(data.object);
      this.animations = data.animations;
      if (this.animations && this.animations.length) {
        const _this = this;
        this.animationMixer = new THREE.AnimationMixer(data.object);
        this.animations.forEach(function (animClip) {
          const action = _this.animationMixer.clipAction(animClip);
          action.play(); //play action is default behaviour
          _this.actions[animClip.name] = action;
        });
      }
    }

    this.setColor(this.color);

    return this.object3D;
  }

  tick(localCtx) {
    if (this.animationMixer) {
      this.animationMixer.update(localCtx.getDt() * 0.001);
    }
  }

  getActions() {
    return this.actions;
  }

  getAnimationMixer() {
    return this.animationMixer;
  }

  getUUID() {
    return this.uuid;
  }
};

RenderModule.TYPE = 'Render';

RenderModule.bindColor = function (goJSON, color) {
  try {
    goJSON.components.Render.color = color;
  } catch (e) {
    throw new Error(e);
  }
};

module.exports = RenderModule;
