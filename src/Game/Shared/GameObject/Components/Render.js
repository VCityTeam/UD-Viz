/** @format */

const THREE = require('three');

const RenderModule = class Render {
  constructor(parent, json) {
    this.parent = parent;
    this.uuid = json.uuid || THREE.MathUtils.generateUUID();
    this.idModel = json.idModel || null;

    this.color = new THREE.Color().fromArray(json.color || [1, 1, 1]);

    //internal
    this.object3D = null;
    this.originalObject3D = null;
  }

  isServerSide() {
    return false;
  }

  toJSON() {
    return {
      uuid: this.uuid,
      type: RenderModule.TYPE,
      idModel: this.idModel,
      color: this.color.toArray(),
    };
  }

  computeBoundingBox() {
    return new THREE.Box3().setFromObject(this.getObject3D());
  }

  getObject3D() {
    return this.object3D;
  }

  getOriginalObject3D() {
    return this.originalObject3D;
  }

  setColor(value) {
    this.color = value;
    this.object3D.traverse(function (c) {
      if (c.material) c.material.color = value;
    });
  }

  getColor() {
    return this.color;
  }

  updateFromComponent(component) {
    if (!this.color.equals(component.getColor())) {
      this.setColor(component.getColor());
    }
  }

  addObject3D(obj) {
    this.object3D.add(obj);
    this.originalObject3D = this.object3D.clone();
  }

  initAssets(assetsManager) {
    this.object3D = new THREE.Object3D();
    this.object3D.name = 'Render Object3D ' + this.parent.getName();

    //stock data in userData
    this.object3D.userData = {
      gameObjectUUID: this.parent.getUUID(),
    };

    //get the 3D model
    if (this.idModel) {
      this.object3D.add(assetsManager.createModel(this.idModel));
    }

    this.setColor(this.color);

    this.originalObject3D = this.object3D.clone(); //keep a copy of it

    return this.object3D;
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
