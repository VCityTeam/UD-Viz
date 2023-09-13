import * as itowns from 'itowns';
import * as THREE from 'three';
const { Data } = require('@ud-viz/shared');

const TEMPORAL_COLOR_OPACITY = {
  noTransaction: {
    color: 'white',
    opacity: 1,
    priority: 0,
  },
  invisible: {
    color: 'blue',
    opacity: 0.2,
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

// finds the index of element
/**
 *
 * @param head
 * @param level
 */
function indexOf(head, level) {
  let count = 0;
  let current = head;

  while (current != null) {
    if (current === level) return count;
    count++;
    current = current.next;
  }

  // not found
  return -1;
}

/**
 *
 * @param date
 * @param head
 */
function getLevelWithDate(head, date) {
  let current = head;
  while (current != null) {
    if (current.date === date) return current;
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

    temporalLayers().forEach((temporalLayer) => {
      temporalLayer.addEventListener(
        itowns.C3DTILES_LAYER_EVENTS.ON_TILE_CONTENT_LOADED,
        () => {
          // temporalLayer.tileset.extensions[
          //   '3DTILES_temporal'
          // ].transactions.forEach((transaction) => {});
          const transactions =
            temporalLayer.tileset.extensions['3DTILES_temporal'].transactions;

          let head;
          // Features
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
                console.log('existing');
                levelExisting.addFeature(feature);
              }
            }
          }

          // for (const [date, level] of levels) {
          //   // TODO : ca marche pas le level.height il faut tenir compte des levels en dessous
          //   level.offset = (date - minDate) * 100;
          // }

          if (!head) return;
          const minDate = head.date;
          let current = head;
          console.log(head);
          while (current != null) {
            const elevation = current.previous ? current.previous.height : 100;
            current.offset = (current.date - minDate) * elevation;

            current = current.next;
          }

          temporalLayers().forEach((layer) => {
            for (const [tileId, tileFeatures] of layer.tilesC3DTileFeatures) {
              for (const [batchId, feature] of tileFeatures) {
                const tileContent = layer.object3d.getObjectByProperty(
                  'tileId',
                  feature.tileId
                );

                const level = getLevelWithDate(
                  feature.getInfo().extensions['3DTILES_temporal'].startDate,
                  head
                );

                if (!tileContent || !level) return;

                // Add transaction linked with the en
                transactions.forEach((transaction) => {
                  if (level.date == transaction.startDate)
                    Data.arrayPushOnce(level.transactions, transaction);
                  if (transaction.type == 'creation') console.log(transaction);
                });

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
            }

            const transactionTypeColor = (transactionType) => {
              switch (transactionType) {
                case 'modification':
                  return TEMPORAL_COLOR_OPACITY.modification;
                case 'creation':
                  console.log('creation');
                  return TEMPORAL_COLOR_OPACITY.creation;
                case 'noTransaction':
                  return TEMPORAL_COLOR_OPACITY.noTransaction;
                case 'demolition':
                  return TEMPORAL_COLOR_OPACITY.demolition;
                case 'invisible':
                  return TEMPORAL_COLOR_OPACITY.invisible;
                default:
                  break;
              }
            };

            const computeColorOpacity = (c3DTileFeature) => {
              const temporalExtension =
                c3DTileFeature.getInfo().extensions['3DTILES_temporal'];

              const result = [];
              let level = head;
              while (level != null) {
                level.transactions.forEach((transaction) => {
                  transaction.source.forEach((source) => {
                    if (source == temporalExtension.featureId)
                      Data.arrayPushOnce(
                        result,
                        transactionTypeColor(transaction.type)
                      );
                  });
                });
                level = level.next;
              }
              Data.arrayPushOnce(result, TEMPORAL_COLOR_OPACITY.noTransaction);
              result.sort((a, b) => b.priority - a.priority);
              // console.log(result);
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
