const { ScriptBase } = require('../Context');

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

  getHeightValue(x, y, size = this.heightmapSize, values = this.heightValues) {
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
