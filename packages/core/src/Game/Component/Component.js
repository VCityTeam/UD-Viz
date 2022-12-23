const THREE = require('three');

const Component = class {
  constructor(model) {
    /** @type {Model} */
    this.model = model;

    /** @type {Controller} */
    this.controller = null; // will be initialize by context
  }

  /**
   *
   * @returns { Model }
   */
  getModel() {
    return this.model;
  }

  getController() {
    return this.controller;
  }

  initController(controller) {
    this.controller = controller;
  }
};

Component.TYPE = 'Component';

const Model = class {
  constructor(json) {
    if (!json) throw 'no json for model';
    // Uuid
    this.uuid = json.uuid || THREE.MathUtils.generateUUID();
  }

  getUUID() {
    return this.uuid;
  }

  toJSON() {
    throw 'Your model should implement a toJSON function';
  }
};

const Controller = class {
  constructor(model, object3D) {
    this.model = model;
    this.object3D = object3D;
  }
};

module.exports = {
  Component: Component,
  Model: Model,
  Controller: Controller,
};
