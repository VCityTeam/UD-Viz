const THREE = require('three');

/**
 *  Component used to handle the 3D rendering of the GameObject
 */
const RenderModelModule = class RenderModel {
  /**
   * Create a new Render component of a GameObject from json
   *
   * @param {JSON} json
   */
  constructor(json) {
    /** Uuid of the component. Init from the field uuid of the json (If it does not exist, a uuid is generated). */
    this.uuid = json.uuid || THREE.MathUtils.generateUUID();

    /**
     * Id of the 3D model used. Init from the field idRenderData of the json.
     *
     * @type {string}
     * @note the field has been renamed, idModel => idRenderData
     */
    this.idRenderData = json.idRenderData || null; // TODO could be an array of id

    /**
     * Color of the 3D model
     *
     * @type {THREE.Color}
     */
    this.color = new THREE.Color().fromArray(json.color || [1, 1, 1]);
  }

  /**
   * This component cant run on server side
   *
   * @returns {boolean}
   */
  isWorldComponent() {
    return false;
  }

  /**
   * Compute this to JSON
   *
   * @returns {JSON}
   */
  toJSON() {
    return {
      uuid: this.uuid,
      type: RenderModelModule.TYPE,
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
   *
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
};

RenderModelModule.TYPE = 'Render';

RenderModelModule.bindColor = function (goJSON, color) {
  try {
    goJSON.components.Render.color = color;
  } catch (e) {
    throw new Error(e);
  }
};

module.exports = { Model: RenderModelModule };
