/** @format */

const THREE = require('three');

export class GOEditorModel {
  constructor(assetsManager) {
    this.assetsManager = assetsManager;

    // Setup View like itowns (same referential)
    THREE.Object3D.DefaultUp.set(0, 0, 1);
    this.scene = new THREE.Scene();

    //dynamic
    this.gameObject = null;
    this.boundingBox = null;
    this.boxHelper = null;
    this.gizmo = null;
  }

  getScene() {
    return this.scene;
  }

  initScene() {
    //lights
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 0, 20000);
    directionalLight.updateMatrixWorld();
    this.scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    ambientLight.position.set(0, 0, 3000);
    directionalLight.updateMatrixWorld();
    this.scene.add(ambientLight);
  }

  getBoundingBox() {
    return this.boundingBox;
  }

  getGameObject() {
    return this.gameObject;
  }

  setGizmoVisibility(value) {
    if (!this.gizmo) return;
    this.gizmo.visible = value;
  }

  setGameObject(g) {
    if (this.gameObject) {
      this.scene.remove(this.gameObject.getObject3D());
      this.scene.remove(this.gizmo);
    }

    this.gameObject = g;
    if (g) {
      const object = g.computeObject3D(this.assetsManager);
      this.boundingBox = new THREE.Box3().setFromObject(object);
      object.add(new THREE.BoxHelper(object));
      const scale = this.boundingBox.max.distanceTo(this.boundingBox.min) / 40;
      this.gizmo = this.assetsManager.fetch('gizmo');
      this.gizmo.scale.set(scale, scale, scale);

      //add to scene
      this.scene.add(this.gizmo); //show origin
      this.scene.add(object);
    }
  }
}
