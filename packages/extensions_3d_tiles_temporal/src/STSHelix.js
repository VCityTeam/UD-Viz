import { DISPLAY_MODE, STShape } from './STShape';
import { MAIN_LOOP_EVENTS } from 'itowns';
import * as THREE from 'three';
import { createSpriteFromString } from '@ud-viz/utils_browser/src/THREEUtil';

export class STSHelix extends STShape {
  constructor(stLayer, options = {}) {
    super(stLayer);
    this.radius = isNaN(options.radius) ? 1000 : options.radius;
    this.delta = isNaN(options.delta) ? 1000 : options.delta;

    this.layerCentroid = null;

    this.frameRequester = this.update.bind(this);
  }

  display(displayMode = DISPLAY_MODE.SEQUENTIAL) {
    super.display();

    const view = this.stLayer.view;
    const rootObject3D = this.stLayer.rootObject3D;

    // Init helix line
    const pointsDisplayed = [];
    const angleBetweenVersions = 240;
    const helixAngle = angleBetweenVersions;
    const helixLength = helixAngle * (this.stLayer.versions.length - 1);
    for (let i = 0; i <= helixLength; i += 10) {
      const angle = (i * -Math.PI) / 180;
      pointsDisplayed.push(
        new THREE.Vector3(
          this.radius * Math.cos(angle) - this.radius,
          this.radius * Math.sin(angle) - this.radius,
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

    let yearDelta;
    let heightDelta;
    let interval;

    const firstDate = this.stLayer.versions[0].date;

    this.stLayer.versions.forEach((version) => {
      const objectCopy = new THREE.Object3D().copy(
        version.c3DTLayer.root,
        true
      );
      rootObject3D.add(objectCopy);

      switch (displayMode) {
        case DISPLAY_MODE.SEQUENTIAL: {
          interval = this.stLayer.versions.indexOf(version);
          yearDelta = helixLength / (this.stLayer.versions.length - 1);
          heightDelta = this.delta;
          break;
        }
        case DISPLAY_MODE.CHRONOLOGICAL: {
          interval = version.date - firstDate;
          yearDelta = helixLength / this.stLayer.dateInterval;
          heightDelta =
            (this.delta * (this.stLayer.versions.length - 1)) /
            this.stLayer.dateInterval;
          break;
        }
      }

      const angleDeg = yearDelta * -interval;
      const angleRad = (angleDeg * Math.PI) / 180;

      const point = new THREE.Vector3(
        this.radius * Math.cos(angleRad) - this.radius,
        this.radius * Math.sin(angleRad) - this.radius,
        0
      );

      version.c3DTLayer.visible = false;

      const dateSprite = createSpriteFromString(version.date.toString());

      const newPosition = new THREE.Vector3(
        helixLine.position.x + point.x,
        helixLine.position.y + point.y,
        heightDelta * interval
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

  update() {}

  dispose() {
    super.dispose();
    this.stLayer.view.removeFrameRequester(
      MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE,
      this.frameRequester
    );
  }
}
