const { AbstractMap } = require('@ud-viz/game_shared_template');
const gm = require('gm');
const { PNG } = require('pngjs');
const path = require('path');

/**
 * @class Represents a map object. Central component for managing map-related data
 * @augments AbstractMap
 */
module.exports = class Map extends AbstractMap {
  /**
   * Loads the map.
   *
   * @returns {Promise<void>} Resolves when the map is loaded.
   * @throws {Error} If there is an issue with gm installation or loading the map.
   */
  load() {
    return new Promise((resolve) => {
      const clientHeightmapPath = this.variables.heightmap_path;
      const nodePath = path.resolve(
        this.variables.clientFolder,
        clientHeightmapPath
      );

      const heightmap = gm(nodePath);

      // TODO check if gm is well installed

      heightmap.toBuffer('png', (err, buffer) => {
        if (err) {
          throw new Error(
            'Check your installation of gm/imageMagick binary !! ' + err
          );
        }
        heightmap.size((err, size) => {
          if (err) {
            throw new Error('size ' + err);
          }
          this.heightmapSize = size.width;
          if (size.width != size.height)
            throw new Error('heightmap must be square image');

          const png = new PNG();
          png.end(buffer);
          png.on('parsed', (imgDataHeight) => {
            const hMin = this.variables.heightmap_geometry.min;
            const hMax = this.variables.heightmap_geometry.max;
            for (let index = 0; index < imgDataHeight.length; index += 4) {
              let heightValue = imgDataHeight[index] / 255;
              heightValue = heightValue * (hMax - hMin) + hMin;
              this.heightValues.push(heightValue);
            }
            resolve();
          });
        });
      });
    });
  }
};
