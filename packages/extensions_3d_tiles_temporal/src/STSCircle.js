import { DISPLAY_MODE, STShape } from './STShape';
import { MAIN_LOOP_EVENTS } from 'itowns';
import * as THREE from 'three';
import { createSpriteFromString } from '@ud-viz/utils_browser/src/THREEUtil';

export class STSCircle extends STShape {
  constructor(stLayer, options = {}) {
    super(stLayer);
    this.radius = isNaN(options.radius) ? 1000 : options.radius;
    this.height = isNaN(options.height) ? 550 : options.height;

    this.layerCentroid = null;
    this.frameRequester = null;

    this.objectCopies = null;
    this.circleLine = null;

    this.selectedDate = null;
    this.pause = false;
  }

  display(displayMode = DISPLAY_MODE.SEQUENTIAL) {
    super.display();

    const view = this.stLayer.view;
    const rootObject3D = this.stLayer.rootObject3D;

    rootObject3D.position.z += this.height;
    // Init circle line
    const pointsDisplayed = [];
    for (let i = 90; i <= 360; i += 10) {
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
    this.circleLine = circleLine;

    rootObject3D.add(circleLine);
    circleLine.updateMatrixWorld();

    // Place versions cdtlayers + labels on the circle
    this.objectCopies = new Map();

    let yearDelta;
    let interval;

    const firstDate = this.stLayer.versions[0].date;

    this.stLayer.versions.forEach((version) => {
      const objectCopy = new THREE.Object3D().copy(
        version.c3DTLayer.root,
        true
      );
      this.objectCopies[version.date] = objectCopy;
      rootObject3D.add(objectCopy);
      switch (displayMode) {
        case DISPLAY_MODE.SEQUENTIAL: {
          interval = this.stLayer.versions.indexOf(version);
          yearDelta = 270 / (this.stLayer.versions.length - 1);
          break;
        }
        case DISPLAY_MODE.CHRONOLOGICAL: {
          interval = version.date - firstDate;
          yearDelta = 270 / this.stLayer.dateInterval;
          break;
        }
      }

      const angleDeg = yearDelta * -interval;
      const angleRad = (angleDeg * Math.PI) / 180;

      const point = new THREE.Vector3(
        this.radius * Math.cos(angleRad),
        this.radius * Math.sin(angleRad),
        0
      );

      version.c3DTLayer.visible = false;

      const dateSprite = createSpriteFromString(version.date.toString());

      const newPosition = new THREE.Vector3(
        circleLine.position.x + point.x,
        circleLine.position.y + point.y,
        circleLine.position.z
      );

      // position C3DTLayer
      objectCopy.position.copy(newPosition);
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

    if (!this.frameRequester) {
      this.frameRequester = this.update.bind(this);

      view.addFrameRequester(
        MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE,
        this.frameRequester
      );
    }
    if (this.selectedDate) this.selectVersion(this.selectedDate);
  }

  selectVersion(date) {
    this.selectedDate = date;
    const object3dCopySelected = this.objectCopies[date];
    const offset = object3dCopySelected.position.clone();

    this.stLayer.rootObject3D.children.forEach((object) => {
      object.position.z = 0;
      object.position.sub(offset);
    });

    object3dCopySelected.position.z = -this.height;

    this.stLayer.rootObject3D.updateMatrixWorld(true);
    this.stLayer.view.notifyChange();
  }

  update() {
    if (this.pause) return;
    // Compute the angle between camera and the base layer.
    if (!this.stLayer.rootObject3D.children.length) return;

    const dirToCamera = new THREE.Vector2(
      this.layerCentroid.x - this.stLayer.view.camera.camera3D.position.x,
      this.layerCentroid.y - this.stLayer.view.camera.camera3D.position.y
    ).normalize();
    let dirObject = this.circleLine.position.clone().normalize();
    dirObject = new THREE.Vector2(dirObject.x, dirObject.y);

    let angle = dirObject.angleTo(dirToCamera);
    const orientation =
      dirToCamera.x * dirObject.y - dirToCamera.y * dirObject.x;
    if (orientation > 0) angle = 2 * Math.PI - angle;

    // Update position of the circle
    if (!this.stLayer.rootObject3D) return;

    this.stLayer.rootObject3D.rotation.set(0, 0, angle);

    for (const date in this.objectCopies) {
      this.objectCopies[date].rotation.set(0, 0, -angle);
    }

    this.stLayer.rootObject3D.updateMatrixWorld();
  }

  dispose() {
    super.dispose();
    this.objectCopies = null;
    this.stLayer.view.removeFrameRequester(
      MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE,
      this.frameRequester
    );
    this.frameRequester = null;
  }
}
