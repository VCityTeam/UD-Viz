/** @format */

const ShapeWrapper = require('../ShapeWrapper');
const THREE = require('three');
const ScriptComponent = require('./Script');

const ColliderModule = class Collider {
  constructor(parent, json) {
    if (!json) throw new Error('no json');
    this.parent = parent;
    this.uuid = json.uuid || THREE.MathUtils.generateUUID();
    this.shapesJSON = json.shapes || [];

    //data
    this.shapeWrappers = [];
    this.createShapeWrappers();
  }

  initAssets(assetsManager) {
    //nada
  }

  createShapeWrappers() {
    const shapeWrappers = this.shapeWrappers;
    const _this = this;
    this.shapesJSON.forEach(function (json) {
      const wrapper = new ShapeWrapper(_this.parent, json);
      shapeWrappers.push(wrapper);
    });
  }

  onCollision(result) {
    this.parent.traverse(function (g) {
      g.executeScripts(ScriptComponent.EVENT.COLLISION, [result]);
    });
  }

  getShapeWrappers() {
    return this.shapeWrappers;
  }

  update() {
    const worldTransform = this.parent.computeWorldTransform();
    this.shapeWrappers.forEach(function (b) {
      b.update(worldTransform);
    });
  }

  isServerSide() {
    return true;
  }

  setShapesJSON(json) {
    this.shapesJSON = json;
  }

  getShapesJSON() {
    return this.shapesJSON;
  }

  toJSON() {
    return {
      uuid: this.uuid,
      type: ColliderModule.TYPE,
      shapes: this.shapesJSON,
    };
  }
};

ColliderModule.TYPE = 'Collider';

module.exports = ColliderModule;
