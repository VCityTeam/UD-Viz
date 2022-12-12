const THREE = require('three');
const { Model } = require('./Component');

/**
 *  Component used to handle the 3D rendering of the GameObject
 */
const RenderModelModule = class RenderModel extends Model {
  /**
   * Create a new Render component of a GameObject from json
   *
   * @param {JSON} json
   */
  constructor(json) {
    super(json);

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
   * @returns {THREE.Color}
   */
  getColor() {
    return this.color;
  }

  setColor(color) {
    this.color = color;
  }

  setIdRenderData(value) {
    this.idRenderData = value;
  }

  getIdRenderData() {
    return this.idRenderData;
  }
};

RenderModelModule.TYPE = 'Render';

module.exports = { Model: RenderModelModule };
