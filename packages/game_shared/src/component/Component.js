const THREE = require('three');
// const Object3D = require('../Object3D'); => this break build webpack phase (circular ref?)
/**
 * `MODULE` Component
 *
 * @exports Component
 */

/** @class  Model object3D component */
const Model = class {
  /**
   * @param {object} json - object to configure model
   * @param {string} [json.uuid] - uuid model
   */
  constructor(json) {
    if (!json) throw 'no json for model';

    /** @type {string} */
    this.uuid = json.uuid || THREE.MathUtils.generateUUID();
  }

  /**
   *
   * @returns {string} - model uuid
   */
  getUUID() {
    return this.uuid;
  }

  /**
   * This method describe how to export your model to a json object
   */
  toJSON() {
    throw 'Your model should implement a toJSON function';
  }
};

/** @class */
const Controller = class {
  /**
   * Controller object3D component
   *
   * @param {import("./Component").Model} model - model of this controller
   * @param {import("../Object3D").Object3D} object3D - object3D parent of this controller (Object3D)
   */
  constructor(model, object3D) {
    /**
     * model of controller
     *
     * @type {import("./Component").Model}
     */
    this.model = model;

    /**
     * object3D parent (Object3D)
     *
     * @type {import("../Object3D").Object3D}
     */
    this.object3D = object3D;
  }
};

const Component = class {
  /**
   * Wrapper of a controller and a model
   *
   * @param {import("./Component").Model} model - model of this component
   */
  constructor(model) {
    /**
     * component model
     *
     * @type {import("./Component").Model}
     */
    this.model = model;

    /**
     * component controller, is initialized by a context
     *
     * @type {import("./Component").Controller|null}
     */
    this.controller = null; // will be initialize by context
  }

  /**
   *
   * @returns {import("./Component").Model} - model of component
   */
  getModel() {
    return this.model;
  }

  /**
   *
   * @returns {import("./Component").Controller} - controller of component
   */
  getController() {
    return this.controller;
  }

  /**
   *
   * @param {import("./Component").Controller} controller - controller of this component
   */
  initController(controller) {
    this.controller = controller;
  }
};

/** @type {string} */
Component.TYPE = 'Component';

module.exports = {
  Component: Component,
  Model: Model,
  Controller: Controller,
};
