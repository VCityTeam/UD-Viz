import * as itowns from 'itowns';
import * as THREE from 'three';
import { arrayPushOnce } from '@ud-viz/utils_shared';
import { Temporal3DTilesLayerWrapper } from '@ud-viz/extensions_3d_tiles_temporal';

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

const translateMatrix = new THREE.Matrix4();

class Level {
  constructor(date, boundingBox, features) {
    /** @type {THREE.Box3} */
    this.boundingBox = boundingBox;

    /** @type {THREE.Box3Helper} */
    this.boundingBoxHelper = new THREE.Box3Helper(
      this.boundingBox,
      new THREE.Color(1, 1, 0)
    );

    /** @type {THREE.PlaneGeometry} */
    this.planeGeometry;

    /** @type {THREE.Mesh} */
    this.plane = null;

    /** @type {Array<itowns.C3DTFeature>} */
    this.features = features;

    this.transactions = [];

    /** @type {number} */
    this.date = date;

    /** @type {number} */
    this._offsetZ = 0;

    /** @type {number} */
    this._offsetY = 0;

    /** @type {Level} */
    this._previous = null;

    /** @type {Level} */
    this._next = null;
  }

  set offsetZ(value) {
    this.boundingBox.min.z -= this._offsetZ;
    this.boundingBox.max.z -= this._offsetZ;

    this._offsetZ = value;

    this.boundingBox.min.z += this._offsetZ;
    this.boundingBox.max.z += this._offsetZ;
  }

  set offsetY(value) {
    this.boundingBox.min.y -= this._offsetY;
    this.boundingBox.max.y -= this._offsetY;

    this._offsetY = value;

    this.boundingBox.min.y += this._offsetY;
    this.boundingBox.max.y += this._offsetY;
  }

  get offsetZ() {
    return this._offsetZ;
  }

  get offsetY() {
    return this._offsetY;
  }
  get width() {
    return this.boundingBox.max.x - this.boundingBox.min.x;
  }

  get lenght() {
    return this.boundingBox.max.y - this.boundingBox.min.y;
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

  createPlane(width, lenght, position) {
    this.planeGeometry = new THREE.PlaneGeometry(width, lenght);

    /** @type {THREE.Mesh} */
    const planeMesh = new THREE.Mesh(
      this.planeGeometry,
      new THREE.MeshStandardMaterial({ color: 'white', side: THREE.DoubleSide })
    );

    planeMesh.position.set(position.x, position.y, position.z);
    this.plane = planeMesh;
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
        this.boundingBox.min.z - this._offsetZ,
        feature.userData.worldInitialBox3.min.z
      ) + this._offsetZ;

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
        this.boundingBox.max.z - this._offsetZ,
        feature.userData.worldInitialBox3.max.z
      ) + this._offsetZ;

    this.boundingBoxHelper.updateMatrixWorld();
  }
}

/**
 *
 * @param head
 * @param date
 */
function getLevelWithDate(head, date) {
  let current = head;
  while (current != null) {
    if (current.date == date) return current;
    current = current.next;
  }
  return null;
}

export class Version {
  constructor(c3DTLayer, date) {
    /** @type {itowns.C3DTilesLayer}*/
    this.c3DTLayer = c3DTLayer;

    /** @type {number} */
    this.date = date;

    /** @type {THREE.Sprite} */
    this.dateSprite = null;

    /** @type {itowns.C3DTilesLayer} */
    this.diffOlder = null;

    /** @type {itowns.C3DTilesLayer} */
    this.diffNew = null;

    /** @type {Array<THREE.Line>} */
    this.transactionsLines = [];

    /** @type {Temporal3DTilesLayerWrapper} */
    this.temporalWrapper;
  }

  createSpriteDate() {
    const size = 64;
    const baseWidth = 150;
    const name = this.date.toString();
    const borderSize = 2;
    const ctx = document.createElement('canvas').getContext('2d');
    const font = `${size}px bold sans-serif`;
    ctx.font = font;
    // measure how long the name will be
    const textWidth = ctx.measureText(name).width;

    const doubleBorderSize = borderSize * 2;
    const width = baseWidth + doubleBorderSize;
    const height = size + doubleBorderSize;
    ctx.canvas.width = width;
    ctx.canvas.height = height;

    // need to set font again after resizing canvas
    ctx.font = font;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, width, height);

    // scale to fit but don't stretch
    const scaleFactor = Math.min(1, baseWidth / textWidth);
    ctx.translate(width / 2, height / 2);
    ctx.scale(scaleFactor, 1);
    ctx.fillStyle = 'white';
    ctx.fillText(name, 0, 0);

    const canvasTexture = new THREE.CanvasTexture(ctx.canvas);
    // canvasTexture.magFilter = THREE.NearestFilter;
    const label = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: canvasTexture })
    );
    label.material.sizeAttenuation = false;
    this.dateSprite = label;

    return this.dateSprite;
  }

  /**
   *
   * @param {THREE.Line} line
   * @param {THREE.Vector3} p1
   * @param {THREE.Vector3} p2
   */
  updateTransaction(line, p1, p2) {
    const curve = new THREE.CatmullRomCurve3([
      p1,
      new THREE.Vector3(
        (p1.x + p2.x) / 2,
        (p1.y + p2.y) / 2,
        (p1.z + p2.z) / 2 + 250
      ),
      p2,
    ]);
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    line.geometry = geometry;
  }

  get centroid() {
    return getCenterFromObject3D(this.c3DTLayer.root);
  }

  differenceVisibility(visibility) {
    if (this.diffNew) this.diffNew.object3d.visible = visibility;
    if (this.diffOlder) this.diffNew.object3d.visible = visibility;
  }
}

/**
 * Computes and returns the center point of a 3D object.
 *
 * @param {THREE.Object3D} object3D - Represents a 3D object in the scene.
 * @returns {THREE.Vector3}  returns the center point of the bounding box of the given `object3D`.
 */
function getCenterFromObject3D(object3D) {
  const box = new THREE.Box3().setFromObject(object3D);
  return box.getCenter(new THREE.Vector3());
}

/**
 * Creates a colored cube as a child of an THREE.Object3D at a specified position.
 *
 * @param {THREE.Object3D} object3DWhereAdd - The object3D to which the cube will be added.
 * @param {THREE.Vector3} pos - Cube position in 3D space (local to the parent).
 * @param [color=0x00ff00] - The color of the cube's material.
 */
function debugCubeAtPos(object3DWhereAdd, pos, color = 0x00ff00) {
  const geometryBox = new THREE.BoxGeometry(50, 50, 50);
  const materialBox = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.5,
  });
  const cubeDebug = new THREE.Mesh(geometryBox, materialBox);
  object3DWhereAdd.add(cubeDebug);
  cubeDebug.position.copy(pos);
  cubeDebug.updateMatrixWorld();
}

export class SpaceTimeCube {
  /**
   * Init properties and layers for displaying temporal 3D tiles.
   *
   * @param {itowns.PlanarView} view - iTowns view which contains notably the threejs scene and render's events.
   * @param {any} delta - ... TODO
   * @param {Array<number>} datesC3DT - Array of differents c3dtileslayer's dates.
   */
  constructor(view, delta, datesC3DT) {
    this.view = view;

    /** @type {Map<string,object>} */
    this.featureDateID2ColorOpacity = new Map();

    /** @type {Array} */
    this.possibleDates = [];

    /** @type {Array<Temporal3DTilesLayerWrapper>} */
    this.temporalsWrappers = [];

    /** @type {Array<Version>} */
    this.versions = [];

    this.delta = delta;

    this.height = 500;

    /** @type {number} */
    this.RAYON = 1000;

    this.rootObject3D = new THREE.Object3D();
    this.circleDisplayed = null;

    /** @type {Map<number, itowns.C3DTileset>} */
    this.datesC3DT = datesC3DT;

    // this.centerLayer = this.getC3DTLayers()[0];
    this.firstTemporalLayer = this.getC3DTTemporalLayers()[0];
    // this.centerLayer = this.firstTemporalLayer;
    // Circle paramaters
    // const oldestDate = Math.min(...C3DTilesDated.keys());

    /** @type {THREE.Vector3} */
    this.centroidFirstTL = null;

    this.datesC3DT.forEach((date) => {
      const c3DTLayer = new itowns.C3DTilesLayer(
        this.firstTemporalLayer.id + '_' + date.toString(),
        {
          name: this.firstTemporalLayer.id + date.toString(),
          source: new itowns.C3DTilesSource({
            url: this.firstTemporalLayer.source.url,
          }),
          registeredExtensions: this.firstTemporalLayer.registeredExtensions,
        },
        this.view
      );
      itowns.View.prototype.addLayer.call(view, c3DTLayer);
      this.temporalsWrappers.push(new Temporal3DTilesLayerWrapper(c3DTLayer));

      // Between two dates there are two intermediate dates like this: 2009 -> firstHalfDate -> secondHalfDate 2012. We want always display firstHlafDate.
      if (date == 2009) {
        this.temporalsWrappers[this.temporalsWrappers.length - 1].styleDate =
          date + 1;
      } else {
        this.temporalsWrappers[this.temporalsWrappers.length - 1].styleDate =
          date - 2;
      }

      const version = new Version(c3DTLayer, date);
      version.temporalWrapper =
        this.temporalsWrappers[this.temporalsWrappers.length - 1];
      this.versions.push(version);
    });

    this.view.addFrameRequester(
      itowns.MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE,
      () => {
        this.updateCircle();
      }
    );
  }

  // Debug
  /**
   * Rotates the rootObject3D in a specified direction in z axis
   *
   * @param {number} direction - The angle by which the circle should be rotated.
   */
  rotateCircleDisplayed(direction) {
    if (!this.rootObject3D) return;
    console.log('rotate circle with', direction);
    this.rootObject3D.rotateZ(direction);
    this.rootObject3D.updateMatrixWorld();
    this.view.notifyChange();
  }

  getC3DTTemporalLayers() {
    return this.view.getLayers().filter((el) => {
      return (
        el.isC3DTilesLayer &&
        el.registeredExtensions.isExtensionRegistered('3DTILES_temporal')
      );
    });
  }

  getC3DTLayers() {
    return this.view.getLayers().filter((el) => {
      return (
        el.isC3DTilesLayer &&
        !el.registeredExtensions.isExtensionRegistered('3DTILES_temporal')
      );
    });
  }

  vectorRepresentation() {
    this.getC3DTTemporalLayers().forEach((temporalLayer) => {
      // Modification
      temporalLayer.tileset.extensions['3DTILES_temporal'].transactions.forEach(
        (transaction) => {
          const transactionDuration =
            transaction.endDate - transaction.startDate;

          const firstHalfDate = transaction.startDate + transactionDuration / 3;
          const secondHalfDate = transaction.endDate - transactionDuration / 3;
          arrayPushOnce(this.possibleDates, transaction.startDate);
          arrayPushOnce(this.possibleDates, transaction.endDate);

          arrayPushOnce(this.possibleDates, firstHalfDate);
          arrayPushOnce(this.possibleDates, secondHalfDate);

          transaction.source.forEach((fId) => {
            if (transaction.type == 'modification') {
              this.featureDateID2ColorOpacity.set(
                fId + firstHalfDate,
                TEMPORAL_COLOR_OPACITY.modification
              );
              this.featureDateID2ColorOpacity.set(
                fId + secondHalfDate,
                TEMPORAL_COLOR_OPACITY.invisible
              );
            } else {
              // all other transaction
              this.featureDateID2ColorOpacity.set(
                fId + firstHalfDate,
                TEMPORAL_COLOR_OPACITY.noTransaction
              );
              this.featureDateID2ColorOpacity.set(
                fId + secondHalfDate,
                TEMPORAL_COLOR_OPACITY.noTransaction
              );
            }
          });
          transaction.destination.forEach((fId) => {
            if (transaction.type == 'modification') {
              this.featureDateID2ColorOpacity.set(
                fId + firstHalfDate,
                TEMPORAL_COLOR_OPACITY.invisible
              );
              this.featureDateID2ColorOpacity.set(
                fId + secondHalfDate,
                TEMPORAL_COLOR_OPACITY.modification
              );
            } else {
              // all other transaction
              this.featureDateID2ColorOpacity.set(
                fId + firstHalfDate,
                TEMPORAL_COLOR_OPACITY.noTransaction
              );
              this.featureDateID2ColorOpacity.set(
                fId + secondHalfDate,
                TEMPORAL_COLOR_OPACITY.noTransaction
              );
            }
          });
        }
      );

      // handle demolition/creation which are not in batchTable/extension
      this.possibleDates.sort((a, b) => a - b);

      let head;
      for (const [tileId, tileFeatures] of temporalLayer.tilesC3DTileFeatures) {
        for (const [batchId, feature] of tileFeatures) {
          if (!feature.userData.worldInitialBox3) {
            feature.userData.worldInitialBox3 =
              temporalLayer.computeWorldBox3(feature);
          }

          const date =
            feature.getInfo().extensions['3DTILES_temporal'].startDate;
          // If no head
          if (!head) {
            head = new Level(date, feature.userData.worldInitialBox3.clone(), [
              feature,
            ]);
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
        const elevation = current.previous ? current.previous.height : 0;
        current.offsetZ = (current.date - minDate) * this.delta;
        current.offsetY = (current.date - minDate) * (this.delta + 50);

        // Set demoliton and construction
        for (let index = 0; index < this.possibleDates.length - 1; index++) {
          const date = this.possibleDates[index];
          const nextDate = this.possibleDates[index + 1];
          current.features.forEach((feature) => {
            const featureTransaction =
              feature.getInfo().extensions['3DTILES_temporal'];
            if (featureTransaction.endDate == date) {
              const featureDateID = featureTransaction.featureId + nextDate;
              if (!this.featureDateID2ColorOpacity.has(featureDateID)) {
                this.featureDateID2ColorOpacity.set(
                  featureDateID,
                  TEMPORAL_COLOR_OPACITY.demolition
                );
              }
            }
            if (featureTransaction.startDate == nextDate) {
              const featureDateID = featureTransaction.featureId + date;
              if (!this.featureDateID2ColorOpacity.has(featureDateID))
                this.featureDateID2ColorOpacity.set(
                  featureDateID,
                  TEMPORAL_COLOR_OPACITY.creation
                );
            }
          });
        }

        // Set plane
        if (current.plane == null) {
          // Update bounding box
          current.boundingBoxHelper.updateMatrixWorld();
          this.view.scene.add(current.boundingBoxHelper);

          current.createPlane(
            current.width,
            current.lenght,
            new THREE.Vector3(
              current.boundingBox.min.x + current.width / 2,
              current.boundingBox.min.y + current.lenght / 2,
              current.boundingBox.min.z
            )
          );
          current.plane.wireframe = true;
          current.plane.quaternion.set(0.0871557, 0, 0, 0.9961947);
          current.plane.updateMatrixWorld();
          this.view.scene.add(current.plane);
        }

        current = current.next;
      }

      console.log(head);

      this.getC3DTTemporalLayers().forEach((layer) => {
        for (const [tileId, tileFeatures] of layer.tilesC3DTileFeatures) {
          for (const [batchId, feature] of tileFeatures) {
            const tileContent = layer.object3d.getObjectByProperty(
              'tileId',
              feature.tileId
            );

            let level = null;

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

            tileContent.traverse((child) => {
              if (child.geometry && child.geometry.attributes._BATCHID) {
                const verticesDuplicated = [];
                feature.groups.forEach((group) => {
                  const positionIndexStart = group.start * 3;
                  const positionIndexCount = (group.start + group.count) * 3;
                  for (
                    let index = positionIndexStart;
                    index < positionIndexCount;
                    index += 3
                  ) {
                    // verticesDuplicated.push(
                    //   child.geometry.attributes.position.array[index],
                    //   child.geometry.attributes.position.array[index + 1],
                    //   child.geometry.attributes.position.array[index + 2]
                    // );

                    // Set Transformation matrice

                    const pos = new THREE.Vector3(
                      0,
                      child.geometry.attributes.position.array[index + 1],
                      child.geometry.attributes.position.array[index + 2]
                    );

                    translateMatrix.makeTranslation(
                      0,
                      level.offsetY,
                      level.offsetZ
                    );

                    pos.applyMatrix4(translateMatrix);

                    translateMatrix.makeRotationAxis(
                      new THREE.Vector3(1, 0, 0),
                      0.174533
                    );

                    pos.applyMatrix4(translateMatrix);

                    child.geometry.attributes.position.array[index + 1] = pos.y;
                    child.geometry.attributes.position.array[index + 2] = pos.z;
                    level.offsetZ;
                  }
                });

                // testing if feature is a creation or destruction
                const fiD =
                  feature.getInfo().extensions['3DTILES_temporal'].featureId;
                this.possibleDates.forEach((pdate) => {
                  if (this.featureDateID2ColorOpacity.has(fiD + pdate)) {
                    if (
                      this.featureDateID2ColorOpacity.get(fiD + pdate).color ==
                      'green'
                    ) {
                      for (
                        let index = 0;
                        index < verticesDuplicated.length;
                        index += 3
                      ) {
                        verticesDuplicated[index + 2] += level.previous.offset;
                      }
                      const geometry = new THREE.BufferGeometry();
                      geometry.setAttribute(
                        'position',
                        new THREE.BufferAttribute(
                          new Float32Array(verticesDuplicated),
                          3
                        )
                      );

                      const material = new THREE.MeshBasicMaterial({
                        color: 'green',
                        transparent: true,
                      });

                      const mesh = new THREE.Mesh(geometry, material);
                      mesh.applyMatrix4(child.matrixWorld);
                      // view.scene.add(mesh);
                    } else if (
                      this.featureDateID2ColorOpacity.get(fiD + pdate).color ==
                      'red'
                    ) {
                      for (
                        let index = 0;
                        index < verticesDuplicated.length;
                        index += 3
                      ) {
                        verticesDuplicated[index + 2] =
                          verticesDuplicated[index + 2] + level.next.offset;
                      }
                      const geometry = new THREE.BufferGeometry();
                      geometry.setAttribute(
                        'position',
                        new THREE.BufferAttribute(
                          new Float32Array(verticesDuplicated),
                          3
                        )
                      );

                      const material = new THREE.MeshBasicMaterial({
                        color: 'red',
                        transparent: true,
                      });
                      const mesh = new THREE.Mesh(geometry, material);
                      mesh.applyMatrix4(child.matrixWorld);
                      level.boundingBoxHelper.updateMatrixWorld();
                      // view.scene.add(mesh);
                    }
                  }
                });
                child.updateMatrixWorld();
              }
            });
          }
          this.view.notifyChange();
        }

        const computeColorOpacity = (c3DTileFeature) => {
          const temporalExtension =
            c3DTileFeature.getInfo().extensions['3DTILES_temporal'];
          const result = [];

          this.possibleDates.forEach((date) => {
            if (
              temporalExtension.startDate <= date &&
              temporalExtension.endDate >= date
            ) {
              arrayPushOnce(result, TEMPORAL_COLOR_OPACITY.noTransaction);
            }

            const featureDateID = temporalExtension.featureId + date;
            if (this.featureDateID2ColorOpacity.has(featureDateID)) {
              arrayPushOnce(
                result,
                this.featureDateID2ColorOpacity.get(featureDateID)
              );
            }
          });
          arrayPushOnce(result, TEMPORAL_COLOR_OPACITY.invisible);

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
        this.view.notifyChange();
      });
      // temporalLayer.addEventListener(
      //   itowns.C3DTILES_LAYER_EVENTS.ON_TILE_CONTENT_LOADED,
      //   () => {

      //   }
      // );
    });
  }

  /**
   * Creates a circle with points displayed at specific angles, places versions on the circle, and adds date labels for each version.
   * Then add all this object in the rootObject3D
   */
  displayVersionsCircle() {
    const view = this.view;

    this.rootObject3D.clear();

    this.centroidFirstTL = getCenterFromObject3D(this.firstTemporalLayer.root);
    this.rootObject3D.position.copy(this.centroidFirstTL);
    this.rootObject3D.position.z += this.height;
    if (!view.scene.children.includes(this.rootObject3D)) {
      view.scene.add(this.rootObject3D);
    }

    // Init circle line
    const pointsDisplayed = [];
    for (let i = 90; i < 360; i += 10) {
      const angle = (i * Math.PI) / 180;
      pointsDisplayed.push(
        new THREE.Vector3(
          this.RAYON * Math.cos(angle),
          this.RAYON * Math.sin(angle),
          0
        )
      );
    }
    const geometryDisplayed = new THREE.BufferGeometry().setFromPoints(
      pointsDisplayed
    );
    const materialDisplayed = new THREE.LineBasicMaterial({ color: 0x0000ff });
    this.circleDisplayed = new THREE.Line(geometryDisplayed, materialDisplayed);

    this.rootObject3D.add(this.circleDisplayed);
    this.circleDisplayed.position.y += this.RAYON;
    this.circleDisplayed.updateMatrixWorld();

    // Place versions cdtlayers + labels on the circle
    let angleDeg = 0;
    this.versions.forEach((version) => {
      const copyObject = new THREE.Object3D().copy(
        version.c3DTLayer.root,
        true
      );
      this.rootObject3D.add(copyObject);
      const angleRad = (angleDeg * Math.PI) / 180;
      angleDeg = 360 / this.versions.length + angleDeg;
      const point = new THREE.Vector3(
        this.RAYON * Math.cos(angleRad),
        this.RAYON * Math.sin(angleRad),
        0
      );

      const positionInCircle = new THREE.Vector3(
        this.circleDisplayed.position.x + point.x,
        this.circleDisplayed.position.y + point.y,
        this.circleDisplayed.position.z
      );
      // debugCubeAtPos(this.rootObject3D, positionInCircle);

      version.c3DTLayer.visible = false;

      const dateSprite = version.createSpriteDate();
      if (version.date != 2012) {
        // position C3DTLayer
        copyObject.children.forEach((object) => {
          object.position.copy(positionInCircle);
          object.updateMatrixWorld();
        });
        dateSprite.position.copy(positionInCircle);
      } else {
        dateSprite.position.copy(new THREE.Vector3(0, 0, 0 - this.height));
      }
      // Date label sprite
      dateSprite.position.z += 40;
      dateSprite.scale.multiplyScalar(0.02);
      dateSprite.updateMatrixWorld();
      this.rootObject3D.add(dateSprite);
    });
    this.rootObject3D.updateMatrixWorld();

    this.view.notifyChange();
  }

  updateParameters() {
    this.displayVersionsCircle();
  }

  /**
   * Calculates the angle between the camera and a base layer, updates the rootObject3D on this angle.
   */
  updateCircle() {
    // Compute the angle between camera and the base layer.
    if (!this.circleDisplayed) return;

    const dirToCamera = new THREE.Vector2(
      this.centroidFirstTL.x - this.view.camera.camera3D.position.x,
      this.centroidFirstTL.y - this.view.camera.camera3D.position.y
    ).normalize();
    const dirObject = new THREE.Vector2(0, 1);

    let angle = dirObject.angleTo(dirToCamera);
    const orientation =
      dirToCamera.x * dirObject.y - dirToCamera.y * dirObject.x;
    if (orientation > 0) angle = 2 * Math.PI - angle;

    // Update position of the circle
    if (!this.rootObject3D) return;

    this.rootObject3D.setRotationFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      angle
    );
    this.rootObject3D.updateMatrixWorld();

    // Update transactions
    // this.versions.forEach((version, index) => {
    //   // Transactions (change type) lines
    //   const geometry = new THREE.BufferGeometry();
    //   const line = new THREE.Line(
    //     geometry,
    //     new THREE.LineBasicMaterial({ color: 0xff0000 })
    //   );

    //   this.view.scene.add(line);
    //   version.transactionsLines.push(line);
    //   const transactionLine = version.transactionsLines[0];
    // if (index != this.versions.length - 1) {
    //   const root = version.c3DTLayer.object3d;
    //   const child = version.c3DTLayer.root.children[0];

    //   const rootOlder = this.versions[index + 1].c3DTLayer.object3d;
    //   const childOlder = this.versions[index + 1].c3DTLayer.root.children[0];
    //   version.updateTransaction(
    //     transactionLine,
    //     new THREE.Vector3(
    //       root.position.x + child.position.x,
    //       root.position.y + child.position.y,
    //       root.position.z + child.position.z
    //     ),
    //     new THREE.Vector3(
    //       rootOlder.position.x + childOlder.position.x,
    //       rootOlder.position.y + childOlder.position.y,
    //       rootOlder.position.z + childOlder.position.z
    //     )
    //   );
    // }
    // });
    // requestAnimationFrame(this.updateCircle);
  }
}
