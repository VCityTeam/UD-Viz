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

class LinkedList {
  constructor(head = null) {
    this.head = head;
    this.size = 0;
  }

  /**
   * TO-DO method static
   *
   * @param {Level} level
   */
  add(level) {
    const l = level;
    let current;
    if (this.head == null) {
      this.head = l;
    } else {
      current = this.head;
      while (current.next != null) {
        current = current.next;
      }
      current.next = l;
      l.previous = current;
    }
    this.size++;
  }

  // TO-DO method static
  // finds the index of element
  indexOf(level) {
    let count = 0;
    let current = this.head;

    while (current != null) {
      if (current === level) return count;
      count++;
      current = current.next;
    }

    // not found
    return -1;
  }

  // find date
  getLevelWithDate(date) {
    let current = this.head;
    while (current != null) {
      if (current.date === date) return current;
      current = current.next;
    }
    return null;
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

    const levelsList = new LinkedList();

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

              const levelExisting = levelsList.getLevelWithDate(date);
              if (!levelExisting) {
                const newLevel = new Level(
                  date,
                  feature.userData.worldInitialBox3.clone(),
                  [feature]
                );
                levelsList.add(newLevel);
              } else {
                levelExisting.addFeature(feature);
              }

              // TO-DO Remove
              if (levels)
                if (!levels.has(date)) {
                  const newLevel = new Level(
                    date,
                    feature.userData.worldInitialBox3.clone(),
                    [feature]
                  );
                  levels.set(date, newLevel);

                  // levelsList.add(newLevel);

                  view.scene.add(newLevel.boudingBoxHelper);
                } else {
                  // add feature
                  levels.get(date).addFeature(feature);
                }
            }
          }

          let minDate;
          if (levelsList.head) minDate = levelsList.head.date;

          // for (const [date, level] of levels) {
          //   // TODO : ca marche pas le level.height il faut tenir compte des levels en dessous
          //   level.offset = (date - minDate) * 100;
          // }

          if (levelsList.head) {
            let current = levelsList.head;
            while (current != null) {
              const elevation = current.previous
                ? current.previous.height
                : 100;
              current.offset = (current.date - minDate) * elevation;

              current = current.next;
            }
          }

          console.log(levelsList);
          temporalLayers().forEach((layer) => {
            for (const [tileId, tileFeatures] of layer.tilesC3DTileFeatures) {
              for (const [batchId, feature] of tileFeatures) {
                const tileContent = layer.object3d.getObjectByProperty(
                  'tileId',
                  feature.tileId
                );

                if (!tileContent) return;

                const level = levelsList.getLevelWithDate(
                  feature.getInfo().extensions['3DTILES_temporal'].startDate
                );

                // console.log(transactions);

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
              let level = levelsList.head;
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
