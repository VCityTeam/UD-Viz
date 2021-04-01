/** @format */

const THREE = require('three');

const RenderModule = class Render {
  constructor(parent, json) {
    this.parent = parent;
    this.uuid = json.uuid || THREE.MathUtils.generateUUID();
    this.idModel = json.idModel;

    //internal
    this.object3D = null;
  }

  isServerSide() {
    return false;
  }

  toJSON() {
    return {
      uuid: this.uuid,
      type: RenderModule.TYPE,
      idModel: this.idModel,
    };
  }

  computeBoundingBox() {
    return new THREE.Box3().setFromObject(this.getObject3D());
  }

  getObject3D() {
    return this.object3D;
  }

  initAssets(assetsManager) {
    this.object3D = new THREE.Object3D();
    this.object3D.name = 'Render Object3D ' + this.parent.getName();

    //stock data in userData
    this.object3D.userData = {
      uuid: this.parent.getUUID(),
    };

    //get the 3D model
    if (this.idModel) {
      this.object3D.add(assetsManager.fetchModel(this.idModel));
    }

    return this.object3D;
  }
};

RenderModule.TYPE = 'Render';

module.exports = RenderModule;
