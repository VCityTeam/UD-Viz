/** @format */

const THREE = require('three');

/**
 *  Component used to handle the 3D rendering of the GameObject
 */
const RenderModule = class Render {
  constructor(parent, json) {
    //gameobject of this component
    this.parent = parent;

    //uuid
    this.uuid = json.uuid || THREE.MathUtils.generateUUID();

    //id of the 3D model used (TODO could be an array of id)
    this.idModel = json.idModel || null;

    //color of the 3D model
    this.color = new THREE.Color().fromArray(json.color || [1, 1, 1]);

    //three.js object
    this.object3D = null;
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
      idModel: this.idModel,
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
    this.object3D.traverse(function (c) {
      if (c.material) c.material.color = value;
    });
  }

  /**
   *
   * @returns {THREE.Color}
   */
  getColor() {
    return this.color;
  }

  /**
   * Check if the color differed from component and update if needed
   * @param {JSON} component the component to update to
   * @param {LocalContext} localContext local context of the GameView
   */
  updateFromComponent(component, localContext) {
    if (!this.color.equals(component.getColor())) {
      this.setColor(component.getColor());
    }
  }

  /**
   * Add a custom object 3D to this model
   * @param {THREE.Object3D} obj
   */
  addObject3D(obj) {
    this.object3D.add(obj);
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
    if (this.idModel) {
      this.object3D.add(assetsManager.createModel(this.idModel));
    }

    this.setColor(this.color);

    return this.object3D;
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
