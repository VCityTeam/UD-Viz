const THREE = require('three');
const { Component, ModelComponent } = require('./Component');

const RenderComponent = class extends Component {
  constructor(model) {
    super(model);
  }
};

RenderComponent.TYPE = 'Render';

/**
 *  Component used to handle the 3D rendering of the GameObject
 */
const RenderModel = class extends ModelComponent {
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
   * Compute this to JSON
   *
   * @returns {JSON}
   */
  toJSON() {
    return {
      uuid: this.uuid,
      type: RenderModel.TYPE,
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

RenderModel.TYPE = 'Render';

module.exports = { Component: RenderComponent, Model: RenderModel };
