/** @format */

const THREE = require('three');

const RenderModule = class Render {
  constructor(parent, json) {
    this.parent = parent;
    this.uuid = json.uuid || THREE.MathUtils.generateUUID();
    this.idModel = json.idModel || null;
    this.media = json.media || null;
    this.name = json.name || null; //TODO display it above object3D

    this.color = new THREE.Color().fromArray(json.color || [1, 1, 1]);

    //internal
    this.object3D = null;
    this.originalObject3D = null;

    this.tickCb = [];
  }

  tick() {
    this.tickCb.forEach(function (cb) {
      cb();
    });
  }

  isServerSide() {
    return false;
  }

  toJSON() {
    return {
      uuid: this.uuid,
      name: this.name,
      media: this.media,
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

  setName(value, assetsManager) {
    const oldParent = this.object3D.parent;
    oldParent.remove(this.object3D);
    this.name = value;
    this.initAssets(assetsManager);
    oldParent.add(this.parent.fetchObject3D());
  }

  getName() {
    return this.name;
  }

  setColor(value, assetsManager) {
    const oldParent = this.object3D.parent;
    oldParent.remove(this.object3D);
    this.color = value;
    this.initAssets(assetsManager);
    oldParent.add(this.parent.fetchObject3D());
  }

  getColor() {
    return this.color;
  }

  updateFromComponent(component, assetsManager) {
    if (this.name != component.getName()) {
      this.setName(component.getName(), assetsManager);
    }

    if (!this.color.equals(component.getColor())) {
      this.setColor(component.getColor(), assetsManager);
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

    //TODO remove media and name and handle with a local script

    //name display above model
    if (this.name) {
      const bb = this.computeBoundingBox();
      const sprite = assetsManager.createSprite(this.name);
      const bbSprite = new THREE.Box3().setFromObject(sprite);
      sprite.position.z = bb.max.z + 0.5 * (bbSprite.max.y - bbSprite.min.y);
      this.object3D.add(sprite);
    }

    if (this.media) {
      if (this.media.text) {
        const mediaText = assetsManager.createText(
          this.media.text.label,
          this.media.text.width,
          this.media.text.height
        );
        this.object3D.add(mediaText);
      }

      if (this.media.img) {
        const mediaImg = assetsManager.createImage(
          this.media.img.path,
          this.media.img.width,
          this.media.img.height
        );
        this.object3D.add(mediaImg);
      }
    }

    const color = this.color;
    this.object3D.traverse(function (c) {
      if (c.material) c.material.color = color;
    });

    this.originalObject3D = this.object3D.clone(); //keep a copy of it

    return this.object3D;
  }
};

RenderModule.TYPE = 'Render';

RenderModule.bindName = function (goJSON, name) {
  try {
    goJSON.components.Render.name = name;
  } catch (e) {
    throw new Error(e);
  }
};

RenderModule.bindColor = function (goJSON, color) {
  try {
    goJSON.components.Render.color = color;
  } catch (e) {
    throw new Error(e);
  }
};

module.exports = RenderModule;
