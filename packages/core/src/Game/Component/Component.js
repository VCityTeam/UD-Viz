const THREE = require('three');
// const Object3D = require('../Object3D'); => this break build webpack phase (circular ref?)

const Model = class {
  /**
   * Model object3D component
   *
   * @memberof Game.Component
   * @param {object} json - object to configure model
   * @param {string=} json.uuid - uuid model
   */
  constructor(json) {
    if (!json) throw 'no json for model';

    /** @type {string} uuid */
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
   * @param {Model} model - model of this controller
   * @param {object} object3D - object3D parent of this controller (Object3D)
   */
  constructor(model, object3D) {
    /** @type {Model} - model of controller */
    this.model = model;

    /** @type {object} - object3D parent (Object3D) */
    this.object3D = object3D;
  }
};

const Component = class {
  /**
   * Wrapper of a controller and a model
   *
   * @param {Model} model - model of this component
   */
  constructor(model) {
    /** @type {Model} - component model */
    this.model = model;

    /** @type {Controller|null} - component controller, is initialized by a context */
    this.controller = null; // will be initialize by context
  }

  /**
   *
   * @returns { Model } - model of component
   */
  getModel() {
    return this.model;
  }

  /**
   *
   * @returns {Controller} - controller of component
   */
  getController() {
    return this.controller;
  }

  /**
   *
   * @param {Controller} controller - controller of this component
   */
  initController(controller) {
    this.controller = controller;
  }
};

Component.TYPE = 'Component';

module.exports = {
  Component: Component,
  Model: Model,
  Controller: Controller,
};
