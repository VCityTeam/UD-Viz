import * as itowns from 'itowns';
import * as THREE from 'three';

class Level {
  constructor(date, boundingBox, features) {
    /** @type {THREE.Box3} */
    this.boundingBox = boundingBox;

    /** @type {THREE.Box3Helper} */
    this.boudingBoxHelper = new THREE.Box3Helper(
      this.boundingBox,
      new THREE.Color(1, 0, 0)
    );

    /** @type {Array<itowns.C3DTFeature>} */
    this.features = features;

    /** @type {number} */
    this.date = date;

    /** @type {number} */
    this._offset = 0;
  }

  set offset(value) {
    this.boundingBox.min.z -= this._offset;
    this.boundingBox.max.z -= this._offset;

    this._offset = value;

    this.boundingBox.min.z += this._offset;
    this.boundingBox.max.z += this._offset;
  }

  get offset() {
    return this._offset;
  }

  get height() {
    return this.boundingBox.max.z - this.boundingBox.min.z;
  }

  addFeature(feature) {
    this.features.push(feature);

    // update bb
    this.boundingBox.min.x = Math.min(
      this.boundingBox.min.x,
      feature.userData.worldInitialBox3.min.x
    );
    this.boundingBox.min.y = Math.min(
      this.boundingBox.min.y,
      feature.userData.worldInitialBox3.min.y
    );
    this.boundingBox.min.z =
      Math.min(
        this.boundingBox.min.z - this._offset,
        feature.userData.worldInitialBox3.min.z
      ) + this._offset;

    this.boundingBox.max.x = Math.max(
      this.boundingBox.max.x,
      feature.userData.worldInitialBox3.max.x
    );
    this.boundingBox.max.y = Math.max(
      this.boundingBox.max.y,
      feature.userData.worldInitialBox3.max.y
    );
    this.boundingBox.max.z =
      Math.max(
        this.boundingBox.max.z - this._offset,
        feature.userData.worldInitialBox3.max.z
      ) + this._offset;

    this.boudingBoxHelper.updateMatrixWorld();
  }
}

export class SpaceTimeCube {
  /**
   *
   * @param {itowns.PlanarView} view
   */
  constructor(view) {
    /** @type {Map<number,Level>} */
    const levels = new Map();

    const temporalLayers = () => {
      return view.getLayers().filter((el) => {
        return (
          el.isC3DTilesLayer &&
          el.registeredExtensions.isExtensionRegistered('3DTILES_temporal')
        );
      });
    };

    temporalLayers().forEach((temporalLayer) => {
      temporalLayer.addEventListener(
        itowns.C3DTILES_LAYER_EVENTS.ON_TILE_CONTENT_LOADED,
        () => {
          for (const [
            tileId,
            tileFeatures,
          ] of temporalLayer.tilesC3DTileFeatures) {
            for (const [batchId, feature] of tileFeatures) {
              if (!feature.userData.worldInitialBox3) {
                feature.userData.worldInitialBox3 =
                  temporalLayer.computeWorldBox3(feature);
              }

              const date =
                feature.getInfo().extensions['3DTILES_temporal'].startDate;

              if (!levels.has(date)) {
                const newLevel = new Level(
                  date,
                  feature.userData.worldInitialBox3.clone(),
                  [feature]
                );
                levels.set(date, newLevel);

                view.scene.add(newLevel.boudingBoxHelper);
              } else {
                // add feature
                levels.get(date).addFeature(feature);
              }
            }
          }

          let minDate = Infinity;
          for (const [date, level] of levels) {
            minDate = Math.min(minDate, date);
          }

          for (const [date, level] of levels) {
            // TODO : ca marche pas le level.height il faut tenir compte des levels en dessous
            level.offset = (date - minDate) * 100;
          }
          console.log(levels);

          temporalLayers().forEach((layer) => {
            for (const [tileId, tileFeatures] of layer.tilesC3DTileFeatures) {
              for (const [batchId, feature] of tileFeatures) {
                const tileContent = layer.object3d.getObjectByProperty(
                  'tileId',
                  feature.tileId
                );

                if (!tileContent) return;

                const level = levels.get(
                  feature.getInfo().extensions['3DTILES_temporal'].startDate
                );

                const oldOffset = feature.userData.oldOffset
                  ? feature.userData.oldOffset
                  : 0;

                feature.userData.oldOffset = level.offset;

                tileContent.traverse((child) => {
                  if (child.geometry && child.geometry.attributes._BATCHID) {
                    feature.groups.forEach((group) => {
                      const positionIndexStart = group.start * 3;
                      const positionIndexCount =
                        (group.start + group.count) * 3;

                      for (
                        let index = positionIndexStart;
                        index < positionIndexCount;
                        index += 3
                      ) {
                        child.geometry.attributes.position.array[index + 2] +=
                          -oldOffset + level.offset;
                      }
                    });
                  }
                });
              }
            }
          });
        }
      );
    });
  }
}
