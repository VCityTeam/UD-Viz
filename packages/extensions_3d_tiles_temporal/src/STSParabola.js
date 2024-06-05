import * as THREE from 'three';
import { createSpriteFromString } from '@ud-viz/utils_browser/src/THREEUtil';
import { STLayer } from './STLayer';
import { DISPLAY_MODE, STShape } from './STShape';

export class STSParabola extends STShape {
  /**
   *
   * @param {STLayer} stLayer The STLayer instance used to create the shape
   * @param {object} options Options of the shape
   * @param {number} options.distAxisX Distance from control point on X axis
   * @param {number} options.distAxisY Distance from control point on Y axis
   * @param {number} options.height Height at which the parabola is drawn
   */
  constructor(stLayer, options = {}) {
    super(stLayer);

    /** @type {number} */
    this.distAxisX = isNaN(options.distAxisX) ? 1000 : options.distAxisX;
    /** @type {number} */
    this.distAxisY = isNaN(options.distAxisY) ? 1000 : options.distAxisY;
    /** @type {number} */
    this.height = isNaN(options.height) ? 550 : options.height;

    /** @type {THREE.Line} */
    this.dashedLine = null;
  }

  display(displayMode = DISPLAY_MODE.SEQUENTIAL) {
    super.display();

    const view = this.stLayer.view;
    const rootObject3D = this.stLayer.rootObject3D;
    rootObject3D.position.z += this.height;

    const dashedLineGeom = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, -this.height),
      new THREE.Vector3(0, 0, 0),
    ]);
    const dashedLineMaterial = new THREE.LineDashedMaterial({
      color: 0x0000ff,
      linewidth: 1,
      scale: 1,
      dashSize: 3,
      gapSize: 3,
    });
    const dashedLine = new THREE.Line(dashedLineGeom, dashedLineMaterial);
    dashedLine.computeLineDistances();
    this.dashedLine = dashedLine;

    rootObject3D.add(dashedLine);
    dashedLine.updateMatrixWorld();

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
    const middleIndex = numberOfDivisions / 2;

    let points = path.getSpacedPoints(numberOfDivisions);

    const length = this.stLayer.versions.length;
    const middleVersion = this.stLayer.versions.find(
      (v) => v.date == this.middleDate
    );

    let yearDelta;
    let minIndex;
    let maxIndex;
    switch (displayMode) {
      case DISPLAY_MODE.SEQUENTIAL: {
        const nLeft = this.stLayer.versions.indexOf(middleVersion);
        const nRight = length - 1 - nLeft;
        yearDelta = Math.round(middleIndex / (length - 1));
        minIndex = middleIndex - yearDelta * nLeft;
        maxIndex = middleIndex + yearDelta * nRight;
        break;
      }
      case DISPLAY_MODE.CHRONOLOGICAL: {
        yearDelta = numberOfDivisions / 2 / this.stLayer.dateInterval;
        minIndex =
          middleIndex -
          (this.middleDate - this.stLayer.versions[0].date) * yearDelta;
        maxIndex =
          middleIndex +
          (this.stLayer.versions[length - 1].date - this.middleDate) *
            yearDelta;
        break;
      }
    }

    points = points.slice(Math.round(minIndex), Math.round(maxIndex) + 1);

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

      let curveIndex;
      switch (displayMode) {
        case DISPLAY_MODE.SEQUENTIAL: {
          curveIndex = yearDelta * this.stLayer.versions.indexOf(version);
          break;
        }
        case DISPLAY_MODE.CHRONOLOGICAL: {
          const interval = version.date - this.stLayer.versions[0].date;
          curveIndex = yearDelta * interval;
          break;
        }
      }
      const curvePoint = points[Math.round(curveIndex)];
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

  /**
   *
   * @param {STLayer} stLayer The STLayer instance used to create the shape
   */
  setSTLayer(stLayer) {
    super.setSTLayer(stLayer);

    if (stLayer)
      /** @type {number} */
      this.middleDate =
        this.stLayer.versions[
          Math.round((this.stLayer.versions.length - 1) / 2)
        ].date;
  }
}
