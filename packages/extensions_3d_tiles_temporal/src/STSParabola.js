import { STShape } from './STShape';
import * as THREE from 'three';
import { createSpriteFromString } from '@ud-viz/utils_browser/src/THREEUtil';

export class STSParabola extends STShape {
  constructor(stLayer, options = {}) {
    super(stLayer);

    this.distAxisX = isNaN(options.distAxisX) ? 1000 : options.distAxisX; // distance from control point on x axis
    this.distAxisY = isNaN(options.distAxisY) ? 1000 : options.distAxisY;
    this.height = isNaN(options.height) ? 550 : options.height;

    /** @type {Map<string,object>} */
    this.featureDateID2ColorOpacity = new Map();

    /** @type {Array<number>} */
    this.possibleDates = [];

    this.middleDate =
      this.stLayer.versions[
        Math.round((this.stLayer.versions.length - 1) / 2)
      ].date;
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

    const numberOfDivisions = 50;
    let points = path.getSpacedPoints(numberOfDivisions);

    const spaceIndexBetweenTwoVersions = Math.round(
      25 / (this.stLayer.versions.length - 1)
    );

    const middleVersion = this.stLayer.versions.find(
      (v) => v.date == this.middleDate
    );
    const nLeft = this.stLayer.versions.indexOf(middleVersion);
    const nRight = this.stLayer.versions.length - 1 - nLeft;

    points = points.slice(
      25 - spaceIndexBetweenTwoVersions * nLeft,
      25 + spaceIndexBetweenTwoVersions * nRight + 1
    );

    const geometryDisplayed = new THREE.BufferGeometry().setFromPoints(points);

    const materialDisplayed = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const parabolaLine = new THREE.Line(geometryDisplayed, materialDisplayed);

    rootObject3D.add(parabolaLine);

    this.stLayer.versions.forEach((version) => {
      const objectCopy = new THREE.Object3D().copy(
        version.c3DTLayer.root,
        true
      );
      rootObject3D.add(objectCopy);

      version.c3DTLayer.visible = false;

      const curvePoint =
        points[
          spaceIndexBetweenTwoVersions * this.stLayer.versions.indexOf(version)
        ];
      const newPosition = new THREE.Vector3(curvePoint.x, curvePoint.y, 0);

      const dateSprite = createSpriteFromString(version.date.toString());

      // position C3DTLayer
      objectCopy.position.copy(newPosition);
      if (version == middleVersion)
        objectCopy.position.copy(new THREE.Vector3(0, 0, -this.height));
      for (let i = 0; i < objectCopy.children.length; i++) {
        const child = objectCopy.children[i];
        const tileId = version.c3DTLayer.root.children[i].tileId;
        const tile = version.c3DTLayer.tileset.tiles[tileId];
        const tileTransform = tile.transform.elements;
        const tilePosition = new THREE.Vector3(
          tileTransform[12],
          tileTransform[13],
          tileTransform[14]
        );
        child.position.copy(tilePosition.sub(this.layerCentroid));
      }

      // Date label sprite
      dateSprite.position.z += 40;
      dateSprite.scale.multiplyScalar(0.02);
      objectCopy.add(dateSprite);
    });
    rootObject3D.updateMatrixWorld();

    view.notifyChange();
  }

  dispose() {
    super.dispose();
  }
}
