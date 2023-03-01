const { ScriptBase } = require('../Context');
const Object3D = require('../Object3D');

const OFFSET_ELEVATION = 0.2;

module.exports = class AbstractMap extends ScriptBase {
  constructor(context, object3D, variables) {
    super(context, object3D, variables);

    this.heightmapSize = 0; // size of the heightmap
    this.heightValues = []; // values extract from heightmap
  }

  load() {
    // heightmap loading is secific at browser/node
    console.error('abstract method');
  }

  /**
   *
   * @param {number} x - x coord game ref position
   * @param {number} y - y coord game ref position
   * @returns {number|NaN} - return elevation or NaN is x,y is out of map heightmap image
   */
  getHeightValue(x, y) {
    const size = this.heightmapSize;
    const values = this.heightValues;

    // TODO heightmap are square
    const pixelWorldUnit = {
      width: this.variables.heightmap_geometry.size / size,
      height: this.variables.heightmap_geometry.size / size,
    };

    const center = size / 2;

    const coordHeightmap = {
      x: x / pixelWorldUnit.width + center,
      y: -y / pixelWorldUnit.height + center,
    };

    // console.log(coordHeightmap);

    const indexMin = {
      i: Math.floor(coordHeightmap.x),
      j: Math.floor(coordHeightmap.y),
    };

    const hMin = this.variables.heightmap_geometry.min;

    const getPixelHeight = function (i, j, weight) {
      // clamp
      let out = false;
      if (i >= size) {
        // console.log('out of bound X >');
        out = true;
      } else if (i < 0) {
        // console.log('out of bound X <');
        out = true;
      } else if (j >= size) {
        // console.log('out of bound Y >');
        out = true;
      } else if (j < 0) {
        // console.log('out of bound Y <');
        out = true;
      }

      let result;
      if (out) {
        result = NaN; // if NaN means out
      } else {
        result = values[i + j * size];
        if (Math.abs(result - hMin) < 0.00001) result = NaN; // nan => out
      }
      return weight * result;
    };

    return getPixelHeight(indexMin.i, indexMin.j, 1);
  }

  /**
   *
   * @param {Object3D} gameObject
   * @returns {boolean} - true if elevation has been updated false if object is out of map
   */
  updateElevation(gameObject) {
    const elevation = this.getHeightValue(
      gameObject.position.x,
      gameObject.position.y
    );

    if (!isNaN(elevation)) {
      gameObject.position.z = OFFSET_ELEVATION + elevation;
      return true;
    }
    return false;
  }
};
