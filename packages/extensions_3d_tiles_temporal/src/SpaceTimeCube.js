import * as itowns from 'itowns';
import * as THREE from 'three';
import { arrayPushOnce } from '@ud-viz/utils_shared';

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

export class Version {
  constructor(object3DTiles, date) {
    /** @type {Array<THREE.Object3D>}*/
    this.object3DTiles = object3DTiles;

    /** @type {number} */
    this.date = date;

    /** @type {THREE.Vector3} */
    this.centroid;

    /** @type {Array<THREE.Object3D>}*/
    this.planes = [];
  }

  createPlane() {
    this.updateCentroid();
    const planes = [];
    this.object3DTiles.forEach((object3D) => {
      const planeGeometry = new THREE.PlaneGeometry(
        object3D.boundingVolume.box.max.x - object3D.boundingVolume.box.min.x,
        object3D.boundingVolume.box.max.y - object3D.boundingVolume.box.min.y
      );

      const planeMesh = new THREE.Mesh(
        planeGeometry,
        new THREE.MeshBasicMaterial({
          color: 'white',
          side: THREE.DoubleSide,
        })
      );

      planeMesh.position.copy(this.centroid);
      planeMesh.position.z -= 20;
      planeMesh.updateMatrixWorld();
      planes.push(planeMesh);
    });
    return (this.planes = planes);
  }

  /* DEBUG */
  debugBB() {
    const BBs = [];
    this.object3DTiles.forEach((object3D) => {
      const boundingBoxHelper = new THREE.Box3Helper(
        new THREE.Box3().setFromObject(object3D),
        new THREE.Color(1, 0, 1)
      );
      boundingBoxHelper.position.copy(object3D.position);
      boundingBoxHelper.updateMatrixWorld();

      BBs.push(boundingBoxHelper);
    });
    return BBs;
  }

  updatePosition(newPos) {
    this.object3DTiles.forEach((object3D) => {
      object3D.position.copy(newPos);
      object3D.updateMatrixWorld();
    });
  }
  updateRotation(posToRotate, angle) {
    this.object3DTiles.forEach((object3D) => {
      const dirPosToRotate = new THREE.Vector3(
        posToRotate.x - object3D.position.x,
        posToRotate.y - object3D.position.y,
        posToRotate.z - object3D.position.z
      ).normalize();

      // object3D.position.copy(posToRotate);
      // dirPosToRotate.rotateAround(new THREE.Vector2(0, 0), angle);
      // dirPosToRotate = dirPosToRotate.rotateAround(
      //   new THREE.Vector2(0, 0),
      //   angle
      // );
      // object3D.position.sub(
      //   new THREE.Vector3(dirPosToRotate.x * 1000, dirPosToRotate.y * 1000, 0)
      // );
      // object3D.updateMatrixWorld();

      object3D.translateOnAxis(dirPosToRotate, 1000);
      object3D.rotateZ(angle);
      // object3D.rotateOnAxis(new THREE.Vector3(0, 0, 1), angle);
      dirPosToRotate.multiplyScalar(-1);
      object3D.translateOnAxis(dirPosToRotate, 1000);

      // dirObject = dirObject.rotateAround(new THREE.Vector2(0, 0), angle);
      // object3D.position.sub(
      //   new THREE.Vector3(dirObject.x * 1000, dirObject.y * 1000, 0)
      // );
      // object3D.setRotationFromQuaternion(planes[i].quaternion);
      object3D.updateMatrixWorld();
    });
  }
  updateCentroid() {
    this.centroid = new THREE.Vector3();
    const sumPos = new THREE.Vector3(0, 0, 0);
    this.object3DTiles.forEach((object3D) => {
      sumPos.add(object3D.position);
    });
    this.centroid.set(
      sumPos.x / this.object3DTiles.length,
      sumPos.y / this.object3DTiles.length,
      sumPos.z / this.object3DTiles.length
    );
  }
}

export class SpaceTimeCube {
  /**
   *
   * @param {itowns.PlanarView} view
   * @param delta
   */
  constructor(view, delta) {
    this.view = view;

    this.temporalLayers = () => {
      return view.getLayers().filter((el) => {
        return (
          el.isC3DTilesLayer &&
          el.registeredExtensions.isExtensionRegistered('3DTILES_temporal')
        );
      });
    };

    this.layers = () => {
      return view.getLayers().filter((el) => {
        return (
          el.isC3DTilesLayer &&
          !el.registeredExtensions.isExtensionRegistered('3DTILES_temporal')
        );
      });
    };

    /** @type {Map<string,object>} */
    this.featureDateID2ColorOpacity = new Map();

    /** @type {Array} */
    this.possibleDates = [];

    /** @type {Array<Version>} */
    this.versions = [];

    this.delta = delta;

    this.centerLayer = this.layers()[0];
    this.layersTemporal = [];
    const points = [],
      RAYON = 1000;

    let index = 1;
    for (let i = 0; i < 360; i += 72) {
      const angle = (i * Math.PI) / 180;
      points.push(
        new THREE.Vector3(RAYON * Math.cos(angle), RAYON * Math.sin(angle), 0)
      );
      const C3DTiles = new udviz.itowns.C3DTilesLayer(
        this.centerLayer.id + '_' + i,
        {
          name: this.centerLayer.id + i,
          source: new udviz.itowns.C3DTilesSource({
            url: this.centerLayer.source.url,
          }),
        },
        this.view
      );
      this.layersTemporal.push(this.layers()[index]);
      index++;
      // itowns.View.prototype.addLayer.call(this.view, C3DTiles);
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
    this.circle = new THREE.Line(geometry, material);
    this.view.scene.add(this.circle);
  }

  vectorRepresentation() {
    this.temporalLayers().forEach((temporalLayer) => {
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
          /* The above code is adding a plane object to the scene in a JavaScript program. */
          this.view.scene.add(current.plane);
        }

        current = current.next;
      }

      console.log(head);

      this.temporalLayers().forEach((layer) => {
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

                    // translateMatrix.makeRotationFromQuaternion(
                    //   new THREE.Quaternion(-0.6427876, 0, 0, 0.7660444)
                    // );
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

  circleRepresentation() {
    const view = this.view;
    const width = this.centerLayer.extent.east - this.centerLayer.extent.west;
    const height =
      this.centerLayer.extent.north - this.centerLayer.extent.south;

    const centroid = new THREE.Vector3(
      this.centerLayer.extent.west + width / 2,
      this.centerLayer.extent.south + height / 2,
      500
    );

    // DEBUG
    const boundingBoxHelperDebug = new THREE.Box3Helper(
      new THREE.Box3().setFromObject(this.layers()[0].object3d),
      new THREE.Color(1, 0, 1)
    );
    boundingBoxHelperDebug.position.copy(centroid);
    boundingBoxHelperDebug.updateMatrixWorld();

    view.scene.add(boundingBoxHelperDebug);

    this.circle.position.set(centroid.x, centroid.y, centroid.z);
    this.circle.updateMatrixWorld();
    const object3DCircle = [];
    const planes = [];

    // Update with circle coordinates
    let i = 0;
    this.layersTemporal.forEach((layertemporal) => {
      if (
        layertemporal.root.children != undefined &&
        layertemporal.root.children.length != 0
      ) {
        const version = new Version(layertemporal.root.children, 2009);
        this.versions.push(version);

        version.updatePosition(
          new THREE.Vector3(
            this.circle.geometry.attributes.position.array[i] +
              this.circle.position.x,
            this.circle.geometry.attributes.position.array[i + 1] +
              this.circle.position.y,
            this.circle.position.z
          )
        );

        version.object3DTiles.forEach((object3D) => {
          object3DCircle.push(object3D);
        });

        // Helper
        version.debugBB().forEach((BB) => {
          view.scene.add(BB);
        });
        version.createPlane().forEach((planeMesh) => {
          view.scene.add(planeMesh);
        });

        // Change scale
        // layertemporal.root.scale.set(0.9999, 0.9999, 0.9999);
        // layertemporal.root.updateMatrixWorld();

        i += 3;
        view.notifyChange();
      }
    });

    const distance = this.versions[0].planes[0].position.distanceTo(
      object3DCircle[0].position
    );
    const circle = this.circle;
    const versions = this.versions;
    rotateObjects();

    /**
     *
     */
    function rotateObjects() {
      const index = 0;
      versions.forEach((version) => {
        const dirToCamera = new THREE.Vector2(
          version.centroid.x - view.camera.camera3D.position.x,
          version.centroid.y - view.camera.camera3D.position.y
        ).normalize();

        const dirObject = new THREE.Vector2(0, 1);
        const buffer = dirObject
          .clone()
          .rotateAround(
            new THREE.Vector2(version.centroid.x, version.centroid.y),
            (circle.rotation.z * 180) / Math.PI
          );

        let angle = dirObject.angleTo(dirToCamera);
        const orientation =
          dirToCamera.x * dirObject.y - dirToCamera.y * dirObject.x;
        if (orientation > 0) angle = 2 * Math.PI - angle;

        version.updateRotation(circle.position, angle, dirObject);

        circle.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), angle);
        circle.updateMatrixWorld();
      });

      // for (let i = 0; i < planes.length; i++) {
      //   const dirToCamera = new THREE.Vector2(
      //     planes[i].position.x - view.camera.camera3D.position.x,
      //     planes[i].position.y - view.camera.camera3D.position.y
      //   ).normalize();

      //   const dirObject = new THREE.Vector2(0, 1);
      //   const buffer = dirObject
      //     .clone()
      //     .rotateAround(
      //       new THREE.Vector2(planes[i].position.x, planes[i].position.y),
      //       (planes[i].rotation.z * 180) / Math.PI
      //     );

      //   let angle = dirObject.angleTo(dirToCamera);
      //   const orientation =
      //     dirToCamera.x * dirObject.y - dirToCamera.y * dirObject.x;
      //   if (orientation > 0) angle = 2 * Math.PI - angle;

      //   circle.setRotationFromAxisAngle(new THREE.Vector3(0, 0, 1), angle);
      //   circle.updateMatrixWorld();

      //   // First tile
      //   // object3DCircle[index].position.copy(planes[i].position);
      //   // dirObject = dirObject.rotateAround(new THREE.Vector2(0, 0), angle);
      //   // object3DCircle[index].position.sub(
      //   //   new THREE.Vector3(dirObject.x * distance, dirObject.y * distance, 0)
      //   // );
      //   // object3DCircle[index].setRotationFromQuaternion(planes[i].quaternion);
      //   // object3DCircle[index].position.z += 20;
      //   // object3DCircle[index].updateMatrixWorld();

      //   // // Second Tile
      //   // object3DCircle[index + 1].setRotationFromQuaternion(
      //   //   planes[i].quaternion
      //   // );
      //   // object3DCircle[index + 1].updateMatrixWorld();

      //   index += 2;
      // }
      requestAnimationFrame(rotateObjects);
    }
  }
}
