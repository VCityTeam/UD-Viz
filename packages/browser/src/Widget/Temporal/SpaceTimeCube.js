import * as itowns from 'itowns';
import * as THREE from 'three';

const TEMPORAL_COLOR_OPACITY = {
  noTransaction: {
    color: 'white',
    opacity: 1,
    priority: 1,
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
    priority: 1.5,
  },
  modification: {
    color: 'yellow',
    opacity: 0.6,
    priority: 1,
  },
};

// TO-DO: list chainé pour connaitre le level en dessous.
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

class Node {
  /**
   *
   * @param {Level} level
   */
  constructor(level) {
    this.level = level;
    this.next = null;
  }
}

class LevelList {
  constructor() {
    this.head = null;
    this.size = 0;
  }

  /**
   *
   * @param {Level} level
   */
  add(level) {
    const node = new Node(level);

    let current;

    if (this.head == null) this.head = node;
    else {
      current = this.head;
      while (current.next) {
        console.log(current.next);
        current = current.next;
      }

      current.next = current;
    }
    this.size++;
  }

  // finds the index of element
  containNode(level) {
    let current = this.head;

    while (current != null) {
      if (current.level.date === level.date) return true;
      current = current.next;
    }

    // not found
    return false;
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

    const levelsList = new LevelList();

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
          temporalLayer.tileset.extensions[
            '3DTILES_temporal'
          ].transactions.forEach((transaction) => {});

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

              if (!levels.has(date)) {
                const newLevel = new Level(
                  date,
                  feature.userData.worldInitialBox3.clone(),
                  [feature]
                );
                levels.set(date, newLevel);
                // if (!levelsList.containNode(newLevel)) levelsList.add(newLevel);

                // levelsList.add(newLevel);

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

                        // TO-DO: dupliquer la géometry quand c'est du construction ou demolition
                      }
                    });
                  }
                });
              }
            }

            layer.style = new itowns.Style({
              fill: {
                color: (bE) => {
                  const colorOpacity = TEMPORAL_COLOR_OPACITY.creation;
                  return colorOpacity.color;
                },
                opacity: (bE) => {
                  const colorOpacity = TEMPORAL_COLOR_OPACITY.creation;
                  return colorOpacity.opacity;
                },
              },
            });
            view.notifyChange();
          });
        }
      );
    });

    levels.forEach((level) => {
      levelsList.add(level);
    });
    console.log(levelsList.containNode(levels.get(2009)));
  }
}
