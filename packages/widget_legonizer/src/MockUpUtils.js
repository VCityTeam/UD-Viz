import { Box3 } from 'three';

/**
 *
 * @param {Box3} areaSelected
 */
export function updateMockUpObject(areaSelected) {
  const area = areaSelected;
  console.log('UPDATE MOCK UP => ', area);

  if (area.start && area.end) {
    // update 3DTiles mock up object
    if (this.mockUpObject && this.mockUpObject.parent) {
      this.mockUpObject.parent.remove(this.mockUpObject);
    }

    // parse geometry intersected
    const geometryMockUp = new THREE.BufferGeometry();
    const positionsMockUp = [];
    const normalsMockUp = [];
    const materials = [];

    const addToFinalMockUp = (positions, normals, color) => {
      let materialIndex = -1;
      const material = materials.filter((mat, index) => {
        if (mat.color.getHex() == color) {
          materialIndex = index;
          return true;
        }
        return false;
      });
      if (material.length == 0) {
        materials.push(new THREE.MeshStandardMaterial({ color: color }));
        materialIndex = materials.length - 1;
      }

      geometryMockUp.addGroup(
        positionsMockUp.length / 3,
        positions.length / 3,
        materialIndex
      );

      positionsMockUp.push(...positions);
      normalsMockUp.push(...normals);
    };

    // compute potential object intersecting
    const potentialObjects = new Map();
    this.context.frame3D.itownsView
      .getLayers()
      .filter((el) => el.isC3DTilesLayer)
      .forEach((l) => {
        l.object3d.traverse((child) => {
          if (child.geometry && child.geometry.attributes._BATCHID) {
            const bbChild = child.geometry.boundingBox
              .clone()
              .applyMatrix4(child.matrixWorld);
            if (this.intersectArea(bbChild.min, bbChild.max))
              potentialObjects.set(child.uuid, child);
          }
        });
      });

    // compute gml_id intersecting
    const gmlIDs = [];
    const bbBuffer = new THREE.Box3();
    this.context.frame3D.itownsView
      .getLayers()
      .filter((el) => el.isC3DTilesLayer)
      .forEach((l) => {
        /* First pass to find gmlids to add to mock up */
        for (const [, c3dTfeatures] of l.tilesC3DTileFeatures) {
          for (const [, feature] of c3dTfeatures) {
            const gmlId = feature.getInfo().batchTable['gml_id'];
            if (gmlIDs.includes(gmlId) || !gmlId) continue; // gml id already added
            if (!potentialObjects.has(feature.object3d.uuid)) continue; // object3d not intersecting with area

            feature.computeWorldBox3(bbBuffer);

            if (this.intersectArea(bbBuffer.min, bbBuffer.max))
              gmlIDs.push(gmlId);
          }
        }
      });

    // add to mockup gmlids recorded
    const bufferPos = new THREE.Vector3();
    const bufferNormal = new THREE.Vector3();
    this.context.frame3D.itownsView
      .getLayers()
      .filter((el) => el.isC3DTilesLayer)
      .forEach((layer) => {
        for (const [, c3dTfeatures] of layer.tilesC3DTileFeatures) {
          for (const [, feature] of c3dTfeatures) {
            const gmlId = feature.getInfo().batchTable['gml_id'];
            if (gmlIDs.includes(gmlId)) {
              // add to the mockup

              const positions = [];
              const normals = [];
              const normalMatrixWorld = new THREE.Matrix3().getNormalMatrix(
                feature.object3d.matrixWorld
              );

              feature.groups.forEach((group) => {
                const positionIndexStart = group.start * 3;
                const positionIndexCount = (group.start + group.count) * 3;

                for (
                  let index = positionIndexStart;
                  index < positionIndexCount;
                  index += 3
                ) {
                  bufferPos.x =
                    feature.object3d.geometry.attributes.position.array[index];
                  bufferPos.y =
                    feature.object3d.geometry.attributes.position.array[
                      index + 1
                    ];
                  bufferPos.z =
                    feature.object3d.geometry.attributes.position.array[
                      index + 2
                    ];

                  positions.push(
                    ...bufferPos
                      .applyMatrix4(feature.object3d.matrixWorld)
                      .toArray()
                  );

                  bufferNormal.x =
                    feature.object3d.geometry.attributes.normal.array[index];
                  bufferNormal.y =
                    feature.object3d.geometry.attributes.normal.array[
                      index + 1
                    ];
                  bufferNormal.z =
                    feature.object3d.geometry.attributes.normal.array[
                      index + 2
                    ];

                  normals.push(
                    ...bufferNormal.applyMatrix3(normalMatrixWorld).toArray()
                  );
                }
              });

              addToFinalMockUp(
                positions,
                normals,
                feature.userData[FEATURE_USER_DATA_KEY.INITIAL_COLOR]
              );
            }
          }
        }
      });

    // create mock up from geometry
    geometryMockUp.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(positionsMockUp), 3)
    );
    geometryMockUp.setAttribute(
      'normal',
      new THREE.BufferAttribute(new Float32Array(normalsMockUp), 3)
    );

    // center geometryockUp on xy and put it at zero on z
    geometryMockUp.computeBoundingBox();
    const bbMockUp = geometryMockUp.boundingBox;
    const centerMockUp = bbMockUp.min.clone().lerp(bbMockUp.max, 0.5);
    const geoPositionsMockUp = geometryMockUp.attributes.position.array;
    for (let index = 0; index < geoPositionsMockUp.length; index += 3) {
      geoPositionsMockUp[index] -= centerMockUp.x;
      geoPositionsMockUp[index + 1] -= centerMockUp.y;
      geoPositionsMockUp[index + 2] -= bbMockUp.min.z; // so it's on the table
    }

    // create mesh
    this.mockUpObject = new THREE.Mesh(geometryMockUp, materials);
    this.mockUpObject.name = 'MockUp Object';
    const renderComp = this.object3D.getComponent(RenderComponent.TYPE);
    renderComp.getController().addObject3D(this.mockUpObject);

    // adapt scale to fit the table
    const widthMockUp = bbMockUp.max.x - bbMockUp.min.x;
    const depthMockUp = bbMockUp.max.y - bbMockUp.min.y;
    const widthTable = this.object3D.scale.x; // edited via editor
    const depthTable = this.object3D.scale.y; // edited via editor
    const minMockUpScale = Math.min(1 / widthMockUp, 1 / depthMockUp);
    const minTableScale = Math.min(widthTable, depthTable);
    // scale = constant / this.object3D.scale => remain mockup proportion
    this.mockUpObject.scale.set(
      (minTableScale * minMockUpScale) / widthTable,
      (minTableScale * minMockUpScale) / depthTable,
      (minTableScale * minMockUpScale) / 1
    );

    // update selectedAreaObject
    if (this.selectedAreaObject && this.selectedAreaObject.parent) {
      this.selectedAreaObject.parent.remove(this.selectedAreaObject);
    }
    const minArea = new THREE.Vector3(
      Math.min(area.start[0], area.end[0]),
      Math.min(area.start[1], area.end[1])
    );
    const maxArea = new THREE.Vector3(
      Math.max(area.start[0], area.end[0]),
      Math.max(area.start[1], area.end[1])
    );
    const dim = maxArea.clone().sub(minArea);
    const geometrySelectedArea = new THREE.BoxGeometry(dim.x, dim.y, 500); // 500 HARD CODED TODO compute minZ and maxZ
    this.selectedAreaObject = new THREE.Mesh(
      geometrySelectedArea,
      new THREE.MeshBasicMaterial({
        color: new THREE.Color().fromArray([0, 1, 0]),
        opacity: 0.5,
        transparent: true,
      })
    );
    this.selectedAreaObject.name = 'Selected Area MockUp';
    this.selectedAreaObject.position.lerpVectors(minArea, maxArea, 0.5);
    this.selectedAreaObject.renderOrder = 2; // render after prethis.context.frame3D.itownsView of selected area
    this.selectedAreaObject.updateMatrixWorld();

    this.context.frame3D.scene.add(this.selectedAreaObject);
  }
}

/**
 *
 * @param {THREE.Box3} areaSelected
 * @param {THREE.Vector3} min
 * @param {THREE.Vector3} max
 */
export function intersectArea(areaSelected, min, max) {
  const area = areaSelected;

  if (!area.min || !area.max) return false;

  // TODO could be optimize if not compute at each intersect
  const minArea = new THREE.Vector2(
    Math.min(area.min.x, area.max.x),
    Math.min(area.min.y, area.max.y)
  );
  const maxArea = new THREE.Vector2(
    Math.max(area.min.x, area.max.x),
    Math.max(area.min.y, area.max.y)
  );

  return (
    minArea.x <= max.x &&
    maxArea.x >= min.x &&
    minArea.y <= max.y &&
    maxArea.y >= min.y
  );
}
