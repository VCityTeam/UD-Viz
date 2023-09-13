import * as itowns from 'itowns';
import * as THREE from 'three';
import { Data } from '@ud-viz/shared';

const TEMPORAL_COLOR_OPACITY = {
  noTransaction: {
    color: 'white',
    opacity: 1,
    priority: 0.5,
  },
  invisible: {
    color: 'blue',
    opacity: 0,
    priority: 0,
  },
  debug: {
    color: 'brown',
    opacity: 0.2,
    priority: 1,
  },
  creation: {
    color: 'green',
    opacity: 0.6,
    priority: 1,
  },
  demolition: {
    color: 'red',
    opacity: 0.6,
    priority: 1,
  },
  modification: {
    color: 'yellow',
    opacity: 0.6,
    priority: 1,
  },
};

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

    this.transactions = [];

    /** @type {number} */
    this.date = date;

    /** @type {number} */
    this._offset = 0;

    /** @type {Level} */
    this._previous = null;

    /** @type {Level} */
    this._next = null;
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

  get previous() {
    return this._previous;
  }

  get next() {
    return this._next;
  }

  set previous(level) {
    this._previous = level;
  }

  set next(level) {
    this._next = level;
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

/**
 *
 * @param date
 * @param head
 */
function getLevelWithDate(head, date) {
  let current = head;
  while (current != null) {
    if (current.date == date) return current;
    current = current.next;
  }
  return null;
}

export class SpaceTimeCube {
  /**
   *
   * @param {itowns.PlanarView} view
   */
  constructor(view) {
    const temporalLayers = () => {
      return view.getLayers().filter((el) => {
        return (
          el.isC3DTilesLayer &&
          el.registeredExtensions.isExtensionRegistered('3DTILES_temporal')
        );
      });
    };

    /** @type {Map<string,object>} */
    const featureDateID2ColorOpacity = new Map();

    /**
     *
     */
    const possibleDates = [];

    temporalLayers().forEach((temporalLayer) => {
      temporalLayer.addEventListener(
        itowns.C3DTILES_LAYER_EVENTS.ON_TILE_CONTENT_LOADED,
        () => {
          // Modification
          temporalLayer.tileset.extensions[
            '3DTILES_temporal'
          ].transactions.forEach((transaction) => {
            const transactionDuration =
              transaction.endDate - transaction.startDate;

            const firstHalfDate =
              transaction.startDate + transactionDuration / 3;
            const secondHalfDate =
              transaction.endDate - transactionDuration / 3;
            Data.arrayPushOnce(possibleDates, transaction.startDate);
            Data.arrayPushOnce(possibleDates, transaction.endDate);

            Data.arrayPushOnce(possibleDates, firstHalfDate);
            Data.arrayPushOnce(possibleDates, secondHalfDate);

            transaction.source.forEach((fId) => {
              if (transaction.type == 'modification') {
                featureDateID2ColorOpacity.set(
                  fId + firstHalfDate,
                  TEMPORAL_COLOR_OPACITY.modification
                );
                featureDateID2ColorOpacity.set(
                  fId + secondHalfDate,
                  TEMPORAL_COLOR_OPACITY.invisible
                );
              } else {
                // all other transaction
                featureDateID2ColorOpacity.set(
                  fId + firstHalfDate,
                  TEMPORAL_COLOR_OPACITY.noTransaction
                );
                featureDateID2ColorOpacity.set(
                  fId + secondHalfDate,
                  TEMPORAL_COLOR_OPACITY.noTransaction
                );
              }
            });
            transaction.destination.forEach((fId) => {
              if (transaction.type == 'modification') {
                featureDateID2ColorOpacity.set(
                  fId + firstHalfDate,
                  TEMPORAL_COLOR_OPACITY.invisible
                );
                featureDateID2ColorOpacity.set(
                  fId + secondHalfDate,
                  TEMPORAL_COLOR_OPACITY.modification
                );
              } else {
                // all other transaction
                featureDateID2ColorOpacity.set(
                  fId + firstHalfDate,
                  TEMPORAL_COLOR_OPACITY.noTransaction
                );
                featureDateID2ColorOpacity.set(
                  fId + secondHalfDate,
                  TEMPORAL_COLOR_OPACITY.noTransaction
                );
              }
            });
          });

          // handle demolition/creation which are not in batchTable/extension
          possibleDates.sort((a, b) => a - b);

          let head;
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
              // If no head
              if (!head) {
                head = new Level(
                  date,
                  feature.userData.worldInitialBox3.clone(),
                  [feature]
                );
              }

              // add level if doesnt existed
              const levelExisting = getLevelWithDate(head, date);
              if (!levelExisting) {
                const newLevel = new Level(
                  date,
                  feature.userData.worldInitialBox3.clone(),
                  [feature]
                );

                // Add next
                let current = head;
                if (current == null) {
                  head = newLevel;
                  return;
                }
                while (current.next) {
                  current = current.next;
                }
                newLevel.previous = current;
                current.next = newLevel;
              } else {
                levelExisting.addFeature(feature);
              }
            }
          }

          if (!head) return;

          const minDate = head.date;
          let current = head;
          while (current != null) {
            // update elevation
            const elevation = current.previous ? current.previous.height : 100;
            current.offset = (current.date - minDate) * elevation;

            // Set demoliton and construction
            for (let index = 0; index < possibleDates.length - 1; index++) {
              const date = possibleDates[index];
              const nextDate = possibleDates[index + 1];
              current.features.forEach((feature) => {
                const featureTransaction =
                  feature.getInfo().extensions['3DTILES_temporal'];
                console.log(featureTransaction);
                console.log(nextDate);

                if (featureTransaction.endDate == date) {
                  const featureDateID = featureTransaction.featureId + nextDate;
                  if (!featureDateID2ColorOpacity.has(featureDateID)) {
                    featureDateID2ColorOpacity.set(
                      featureDateID,
                      TEMPORAL_COLOR_OPACITY.demolition
                    );
                    console.log('demolition');
                  }
                }
                if (featureTransaction.startDate == nextDate) {
                  const featureDateID = featureTransaction.featureId + date;
                  if (!featureDateID2ColorOpacity.has(featureDateID))
                    featureDateID2ColorOpacity.set(
                      featureDateID,
                      TEMPORAL_COLOR_OPACITY.creation
                    );
                  console.log('creation');
                }
              });
            }

            current = current.next;
          }

          temporalLayers().forEach((layer) => {
            for (const [tileId, tileFeatures] of layer.tilesC3DTileFeatures) {
              for (const [batchId, feature] of tileFeatures) {
                const tileContent = layer.object3d.getObjectByProperty(
                  'tileId',
                  feature.tileId
                );

                let level = null;
                //  getLevelWithDate(
                //   feature.getInfo().extensions['3DTILES_temporal'].startDate,
                //   head
                // );

                const date =
                  feature.getInfo().extensions['3DTILES_temporal'].startDate;

                let current = head;
                while (current != null) {
                  if (current.date == date) {
                    level = current;
                  }
                  current = current.next;
                }

                if (!tileContent || !level) return;

                // Checker la bb, si le delta est trop petit par rapport à l'offset faire un ecart avec la bb
                const oldOffset = feature.userData.oldOffset
                  ? feature.userData.oldOffset
                  : 0;

                feature.userData.oldOffset = oldOffset;
                level.boudingBoxHelper.updateMatrixWorld();
                // level.offset = oldOffset;
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

                        // TO-DO: dupliquer la géometry quand c'est du construction ou demolition
                      }
                    });
                  }
                });
              }
              view.notifyChange();
            }

            const computeColorOpacity = (c3DTileFeature) => {
              const temporalExtension =
                c3DTileFeature.getInfo().extensions['3DTILES_temporal'];
              const result = [];

              possibleDates.forEach((date) => {
                if (
                  temporalExtension.startDate <= date &&
                  temporalExtension.endDate >= date
                ) {
                  Data.arrayPushOnce(
                    result,
                    TEMPORAL_COLOR_OPACITY.noTransaction
                  );
                }

                const featureDateID = temporalExtension.featureId + date;
                if (featureDateID2ColorOpacity.has(featureDateID)) {
                  Data.arrayPushOnce(
                    result,
                    featureDateID2ColorOpacity.get(featureDateID)
                  );
                }
              });
              Data.arrayPushOnce(result, TEMPORAL_COLOR_OPACITY.invisible);

              result.sort((a, b) => b.priority - a.priority);
              return result[0];
            };

            temporalLayer.style = new itowns.Style({
              fill: {
                color: (bE) => {
                  const colorOpacity = computeColorOpacity(bE);
                  return colorOpacity.color;
                },
                opacity: (bE) => {
                  const colorOpacity = computeColorOpacity(bE);
                  return colorOpacity.opacity;
                },
              },
            });
            view.notifyChange();
          });
        }
      );
    });
  }
}
