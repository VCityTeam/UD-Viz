/** @format */

const ShapeWrapper = require('../ShapeWrapper');
const THREE = require('three');

const BodyModule = class Body {
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
    this.parent.transform.position.x -= result.overlap * result.overlap_x;
    this.parent.transform.position.y -= result.overlap * result.overlap_y;
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
      type: BodyModule.TYPE,
      shapes: this.shapesJSON,
    };
  }
};

BodyModule.TYPE = 'Body';

module.exports = BodyModule;
