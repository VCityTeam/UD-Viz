import * as THREE from '../../../node_modules/three/src/Three.js';

export function getBatchTableFrom3dObject(obj) {
  if (!!obj.batchTable) {
    return obj.batchTable;
  } else if (!!obj.parent) {
    return getBatchTableFrom3dObject(obj.parent);
  }
  return undefined;
}

export function getBatchIdFromIntersection(inter) {
  let index = inter.face.a;
  return inter.object.geometry.attributes._BATCHID.array[index];
}

export function getBuildingIdFromIntersection(inter) {
  let table = getBatchTableFrom3dObject(inter.object);
  let bid = getBatchIdFromIntersection(inter);
  return table.content['cityobject.database_id'][bid];
}

export function getFirst3dObjectIntersection(intersects) {
  for (let inter of intersects) {
    let geomAttributes = inter.object.geometry.attributes;
    if (!!geomAttributes && !!geomAttributes._BATCHID) {
      return inter;
    }
  }
  return undefined;
}

export function getBuildingInfoDict(layer) {
  let dict = {};
  console.log('Analyzing the 3DTiles layer...');
  console.log(layer);
  let tileIndex = layer.tileIndex;
  let tileCount = tileIndex.index['1'].children.length;
  console.log('Number of tiles (with root) : ' + tileCount);
  let tsroot = layer.object3d.children[0];
  console.log('Root of the tileset : ');
  console.log(tsroot);
  console.log(`${tsroot.children.length} tiles are loaded`);
  for (let tile of tsroot.children) {
    console.log('--- tile ' + tile.tileId);
    let batchTable = tile.batchTable;
    let attributes = tile.children[0].children[0].geometry.attributes;
    console.log(batchTable);
    console.log(attributes);
    attributes._BATCHID.array.forEach((batchId, arrayIndex) => {
      let buildingId = batchTable.content['cityobject.database_id'][batchId];
      if (!dict[buildingId]) {
        dict[buildingId] = {};
        dict[buildingId].arrayIndexes = [];
        dict[buildingId].tile = tile;
      }
      dict[buildingId].arrayIndexes.push(arrayIndex);
    });
  }
  return dict;
}

export function searchBuildingInfo(layer, buildingId) {
  let buildingInfo = undefined;
  let tsroot = layer.object3d.children[0];
  for (let tile of tsroot.children) {
    let batchTable = tile.batchTable;
    let attributes = tile.children[0].children[0].geometry.attributes;
    attributes._BATCHID.array.forEach((batchId, arrayIndex) => {
      let bId = batchTable.content['cityobject.database_id'][batchId];
      if (buildingId === bId) {
        if (!buildingInfo) {
          buildingInfo = {};
          buildingInfo.arrayIndexes = [];
          buildingInfo.tile = tile;
        }
        buildingInfo.arrayIndexes.push(arrayIndex);
      }
    });
    // A building is only present in one tile
    if (!!buildingInfo && !!buildingInfo.tile) {
      return buildingInfo;
    }
  }
  return buildingInfo;
}

/**
 * Changes the color of a tile, or specific vertices of the tile, using the
 * BufferGeometry.
 * 
 * @param {*} tile The 3DTiles tile object from THREE.js
 * @param {Array<Number>} newColor An array of RGB value between 0 and 1.
 * @param {Array<Number>} [indexArray] Optional. The indexes of vertices to
 * change the color. By default, all vertices has their color changed.
 */
export function setTileVerticesColor(tile, newColor, indexArray = null) {
  //Find the 'Mesh' part of the tile
  while (!!tile.children[0] && !(tile.type === 'Mesh')) {
    tile = tile.children[0];
  }

  if (!tile.geometry.attributes._BATCHID) {
    throw 'Invalid tile';
  }

  if (tile.geometry.type !== 'BufferGeometry') {
    throw 'Cannot change vertices color';
  }

  //Create the new color array
  let indexCount = tile.geometry.attributes._BATCHID.count;
  let colors = new Float32Array(indexCount * 3);

  for (let i = 0; i < indexCount; i++) {
    let vertexColor = newColor;
    if (!!indexArray && !indexArray.includes(i)) {
      //If i is not one of the selected indexes, we keep the previous color
      let previousColor = (tile.geometry.attributes.color) ?
                           tile.geometry.attributes.color.array.slice(i * 3 , i * 3 + 3) :
                           tile.material.color.toArray();
      vertexColor = previousColor;
    }

    colors[i * 3     ] = vertexColor[0];
    colors[i * 3 + 1 ] = vertexColor[1];
    colors[i * 3 + 2 ] = vertexColor[2];
  }

  if (!tile.geometry.attributes.color) {
    //If no vertex color is present, we need to add the BufferAttribute
    tile.material.vertexColors = THREE.VertexColors;
    tile.geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
  } else {
    //Else we need to update the existing attribute
    tile.geometry.attributes.color.set(colors);
    tile.geometry.attributes.color.needsUpdate = true;
  }
}

export function colorBuilding(buildingInfo, color) {
  setTileVerticesColor(buildingInfo.tile, color, buildingInfo.arrayIndexes);
}