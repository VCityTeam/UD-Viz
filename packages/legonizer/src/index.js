const { BoxGeometry } = require('three');
const {
  mergeGeometries,
} = require('three/addons/utils/BufferGeometryUtils.js');

module.exports = {
  extrudeHeightMap: (heightMap) => {
    if (!heightMap.length) {
      console.debug('no heightmap');
      return;
    }

    const heightMapWidth = heightMap[0].length;
    const heightMapHeight = heightMap.length;

    console.time('create voxels'); // they are not real voxel (!= size) TODO find a better name
    let voxelGeometries = [];
    // lego ratio y dimension (when x = y = 1) not perfect cube but perfect square
    const magicNumber = 1.230769230769231; // a lego brick is not a perfect cube. this number is calculated to have a dimension to a real lego
    for (let j = 0; j < heightMapHeight; j++) {
      for (let i = 0; i < heightMapWidth; i++) {
        const legoCountedInHeightmapValue = Math.floor(
          heightMap[j][i] / magicNumber
        );
        if (legoCountedInHeightmapValue == 0) continue;
        const height = magicNumber * legoCountedInHeightmapValue; // put lego as much to not go bigger than heightmap value
        const voxelGeo = new BoxGeometry(1, height, 1);
        // spatialize on xz  (why not being in the same referential as itowns in LegoMockupVisualizer ?)
        voxelGeo.translate(
          i,
          height * 0.5, // origin at y = 0
          j
        ); //  geometrie in heightmap ref
        voxelGeometries.push(voxelGeo);
      }
    }
    console.info('count voxel ', voxelGeometries.length);
    console.timeEnd('create voxels');

    let result = [];

    console.time('merge geometries');
    const maxCountGeometryMerge = 1024; // slice geometries into chunk
    do {
      const chunk = voxelGeometries.slice(0, maxCountGeometryMerge);
      voxelGeometries = voxelGeometries.slice(maxCountGeometryMerge);
      result.push(mergeGeometries(chunk, false));
    } while (voxelGeometries.length > maxCountGeometryMerge);

    if (voxelGeometries.length) {
      // add remaining ones
      result.push(mergeGeometries(voxelGeometries, false));
    }
    console.timeEnd('merge geometries');

    console.log(result.length, 'geometry');

    return result;
  },
};
