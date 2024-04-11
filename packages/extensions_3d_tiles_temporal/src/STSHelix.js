import { STShape } from './STShape';
import { MAIN_LOOP_EVENTS } from 'itowns';
import * as THREE from 'three';
import { createSpriteFromString } from '@ud-viz/utils_browser/src/THREEUtil';

export class STSHelix extends STShape {
  constructor(stLayer, options = {}) {
    super(stLayer);
    this.radius = isNaN(options.radius) ? 1000 : options.radius;
    this.height = isNaN(options.height) ? 550 : options.height;
    this.delta = isNaN(options.delta) ? 1000 : options.delta;

    this.layerCentroid = null;

    this.frameRequester = this.update.bind(this);
  }

  display() {
    super.display();

    const view = this.stLayer.view;
    const rootObject3D = this.stLayer.rootObject3D;

    // Init helix line
    const pointsDisplayed = [];
    const angleBetweenVersions = 120;
    const helixAngle = 360 + angleBetweenVersions;
    const helixLength = helixAngle * (this.stLayer.versions.length - 1);
    for (let i = 0; i < helixLength; i += 10) {
      const angle = (i * -Math.PI) / 180;
      pointsDisplayed.push(
        new THREE.Vector3(
          this.radius * Math.cos(angle),
          this.radius * Math.sin(angle),
          (this.delta / (helixAngle / 10)) * (i / 10)
        )
      );
    }
    const geometryDisplayed = new THREE.BufferGeometry().setFromPoints(
      pointsDisplayed
    );
    const materialDisplayed = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const helixLine = new THREE.Line(geometryDisplayed, materialDisplayed);

    rootObject3D.add(helixLine);
    helixLine.position.y += this.radius;
    helixLine.updateMatrixWorld();

    // Place versions cdtlayers + labels on the circle
    let angleDeg = 0;
    this.stLayer.versions.forEach((version) => {
      const copyObject = new THREE.Object3D().copy(
        version.c3DTLayer.root,
        true
      );
      rootObject3D.add(copyObject);
      const angleRad = (angleDeg * Math.PI) / 180;
      angleDeg -= angleBetweenVersions;
      const point = new THREE.Vector3(
        this.radius * Math.cos(angleRad),
        this.radius * Math.sin(angleRad),
        0
      );

      version.c3DTLayer.visible = false;

      const dateSprite = createSpriteFromString(version.date.toString());

      const newPosition = new THREE.Vector3(
        helixLine.position.x + point.x,
        helixLine.position.y + point.y,
        this.delta * this.stLayer.versions.indexOf(version)
      );

      // position C3DTLayer
      copyObject.children.forEach((object) => {
        object.position.copy(newPosition);
        object.updateMatrixWorld();
      });
      dateSprite.position.copy(newPosition);

      // Date label sprite
      dateSprite.position.z += 40;
      dateSprite.scale.multiplyScalar(0.02);
      dateSprite.updateMatrixWorld();
      rootObject3D.add(dateSprite);
    });
    rootObject3D.updateMatrixWorld();

    view.notifyChange();

    view.addFrameRequester(
      MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE,
      this.frameRequester
    );
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

  dispose() {
    super.dispose();
    this.stLayer.view.removeFrameRequester(
      MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE,
      this.frameRequester
    );
  }
}
