import { STShape } from './STShape';
import { MAIN_LOOP_EVENTS } from 'itowns';
import * as THREE from 'three';
import { createSpriteFromString } from '../../utils_browser/src/THREEUtil';

export class STSCircle extends STShape {
  constructor(stLayer, options = {}) {
    super(stLayer, options);
    this.radius = options.radius || 1000;
    this.height = options.height || 550;

    this.layerCentroid = null;

    this.stLayer.view.addFrameRequester(
      MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE,
      () => {
        this.update();
      }
    );
  }

  display() {
    const view = this.stLayer.view;
    const rootObject3D = this.stLayer.rootObject3D;
    rootObject3D.clear();
    const box = new THREE.Box3().setFromObject(this.stLayer.c3DTLTemporal.root);
    this.layerCentroid = box.getCenter(new THREE.Vector3());

    rootObject3D.position.copy(this.layerCentroid);
    rootObject3D.position.z += this.height;

    if (!view.scene.children.includes(rootObject3D)) {
      view.scene.add(rootObject3D);
    }

    // Init circle line
    const pointsDisplayed = [];
    for (let i = 90; i < 360; i += 10) {
      const angle = (i * Math.PI) / 180;
      pointsDisplayed.push(
        new THREE.Vector3(
          this.radius * Math.cos(angle),
          this.radius * Math.sin(angle),
          0
        )
      );
    }
    const geometryDisplayed = new THREE.BufferGeometry().setFromPoints(
      pointsDisplayed
    );
    const materialDisplayed = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const circleLine = new THREE.Line(geometryDisplayed, materialDisplayed);

    rootObject3D.add(circleLine);
    circleLine.position.y += this.radius;
    circleLine.updateMatrixWorld();

    // Place versions cdtlayers + labels on the circle
    let angleDeg = 0;
    this.versions.forEach((version) => {
      const copyObject = new THREE.Object3D().copy(
        version.c3DTLayer.root,
        true
      );
      rootObject3D.add(copyObject);
      const angleRad = (angleDeg * Math.PI) / 180;
      angleDeg = 360 / this.versions.length + angleDeg;
      const point = new THREE.Vector3(
        this.radius * Math.cos(angleRad),
        this.radius * Math.sin(angleRad),
        0
      );

      const positionInCircle = new THREE.Vector3(
        circleLine.position.x + point.x,
        circleLine.position.y + point.y,
        circleLine.position.z
      );

      version.c3DTLayer.visible = false;

      const dateSprite = createSpriteFromString(version.date.toString());
      if (version.date != 2012) {
        // position C3DTLayer
        copyObject.children.forEach((object) => {
          object.position.copy(positionInCircle);
          object.updateMatrixWorld();
        });
        dateSprite.position.copy(positionInCircle);
      } else {
        dateSprite.position.copy(new THREE.Vector3(0, 0, 0 - this.height));
      }
      // Date label sprite
      dateSprite.position.z += 40;
      dateSprite.scale.multiplyScalar(0.02);
      dateSprite.updateMatrixWorld();
      rootObject3D.add(dateSprite);
    });
    rootObject3D.updateMatrixWorld();

    view.notifyChange();
  }

  update() {
    // Compute the angle between camera and the base layer.
    if (!this.stLayer.rootObject3D.children.length) return;

    const dirToCamera = new THREE.Vector2(
      this.layerCentroid.x - this.stLayer.view.camera.camera3D.position.x,
      this.layerCentroid.y - this.stLayer.view.camera.camera3D.position.y
    ).normalize();
    const dirObject = new THREE.Vector2(0, 1);

    let angle = dirObject.angleTo(dirToCamera);
    const orientation =
      dirToCamera.x * dirObject.y - dirToCamera.y * dirObject.x;
    if (orientation > 0) angle = 2 * Math.PI - angle;

    // Update position of the circle
    if (!this.stLayer.rootObject3D) return;

    this.stLayer.rootObject3D.setRotationFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      angle
    );
    this.stLayer.rootObject3D.updateMatrixWorld();
  }
}
