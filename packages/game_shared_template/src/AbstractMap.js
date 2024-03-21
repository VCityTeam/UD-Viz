const { ScriptBase, Object3D } = require('@ud-viz/game_shared');

const OFFSET_ELEVATION = 0.2;

/**
 * @class Providing methods for loading maps, retrieving elevation values, updating
 * object elevations, and obtaining the script ID.
 * @augments ScriptBase
 */
module.exports = class AbstractMap extends ScriptBase {
  /**
   * Constructs an instance of AbstractMap.
   *
   * @param {any} context - The context of the script.
   * @param {Object3D} object3D - The Object3D associated with the map.
   * @param {any} variables - Additional variables for the map.
   */
  constructor(context, object3D, variables) {
    super(context, object3D, variables);

    // Initialize map properties
    this.heightmapSize = 0; // size of the heightmap
    this.heightValues = []; // values extracted from the heightmap
  }

  /**
   * Loads the map.
   *
   * @abstract
   */
  load() {
    // heightmap loading is specific to browser/node
    console.error('abstract method');
  }

  /**
   * Gets the height value at the specified coordinates.
   *
   * @param {number} x - The x coordinate of the game reference position.
   * @param {number} y - The y coordinate of the game reference position.
   * @returns {number|NaN} The elevation value at the specified coordinates, or NaN if out of map heightmap image.
   */
  getHeightValue(x, y) {
    const size = this.heightmapSize;
    const values = this.heightValues;

    // TODO heightmaps are square
    const pixelWorldUnit = {
      width: this.variables.heightmap_geometry.size / size,
      height: this.variables.heightmap_geometry.size / size,
    };

    const center = size / 2;

    const coordHeightmap = {
      x: x / pixelWorldUnit.width + center,
      y: -y / pixelWorldUnit.height + center,
    };

    const indexMin = {
      i: Math.floor(coordHeightmap.x),
      j: Math.floor(coordHeightmap.y),
    };

    const hMin = this.variables.heightmap_geometry.min;

    const getPixelHeight = function (i, j, weight) {
      let out = false;
      if (i >= size) {
        out = true;
      } else if (i < 0) {
        out = true;
      } else if (j >= size) {
        out = true;
      } else if (j < 0) {
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
   * Updates the elevation of the given game object.
   *
   * @param {Object3D} gameObject - The object to update elevation.
   * @returns {boolean} True if elevation has been updated, false if object is out of map.
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

  /**
   * Gets the script ID.
   *
   * @returns {string} The ID of the AbstractMap script.
   */
  static get ID_SCRIPT() {
    return 'map_id';
  }
};
