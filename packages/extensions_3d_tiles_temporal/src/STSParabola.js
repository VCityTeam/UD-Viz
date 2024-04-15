import { STShape } from './STShape';
import * as THREE from 'three';
import { createSpriteFromString } from '@ud-viz/utils_browser/src/THREEUtil';

export class STSParabola extends STShape {
  constructor(stLayer, options = {}) {
    super(stLayer);

    this.distAxisX = isNaN(options.distAxisX) ? 300 : options.distAxisX; // distance from control point on x axis
    this.distAxisY = isNaN(options.distAxisY) ? 300 : options.distAxisY;
    this.height = isNaN(options.height) ? 550 : options.height;

    /** @type {Map<string,object>} */
    this.featureDateID2ColorOpacity = new Map();

    /** @type {Array<number>} */
    this.possibleDates = [];
  }

  display() {
    super.display();

    const view = this.stLayer.view;
    const rootObject3D = this.stLayer.rootObject3D;
    rootObject3D.position.z += this.height;

    const path = new THREE.Path();
    path.moveTo(-this.distAxisX, this.distAxisY);
    const controlPoint1 = new THREE.Vector2(-this.distAxisX / 2, 0);
    path.quadraticCurveTo(controlPoint1.x, controlPoint1.y, 0, 0);
    const controlPoint2 = new THREE.Vector2(this.distAxisX / 2, 0);
    path.quadraticCurveTo(
      controlPoint2.x,
      controlPoint2.y,
      this.distAxisX,
      this.distAxisY
    );

    const points = path.getPoints();

    const geometryDisplayed = new THREE.BufferGeometry().setFromPoints(points);

    const materialDisplayed = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const parabolaLine = new THREE.Line(geometryDisplayed, materialDisplayed);

    rootObject3D.add(parabolaLine);
    rootObject3D.updateMatrixWorld();
    view.notifyChange();
    return;
    this.stLayer.versions.forEach((version) => {
      const copyObject = new THREE.Object3D().copy(
        version.c3DTLayer.root,
        true
      );
      rootObject3D.add(copyObject);

      const newPosition = new THREE.Vector3(
        0,
        0,
        this.delta * this.stLayer.versions.indexOf(version)
      );

      version.c3DTLayer.visible = false;

      const dateSprite = createSpriteFromString(version.date.toString());
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
  }

  dispose() {
    super.dispose();
  }
}
