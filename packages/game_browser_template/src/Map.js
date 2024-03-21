import { AbstractMap } from '@ud-viz/game_shared_template';

/**
 * @class Loads a heightmap image, extracts height values, and ensures the heightmap is a square image.
 */
export class Map extends AbstractMap {
  load() {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      img.src = this.variables.heightmap_path;

      // callback of the img
      img.onload = () => {
        this.heightmapSize = img.width;
        if (img.width != img.height)
          throw new Error('heightmap must be square image');

        const hMin = this.variables.heightmap_geometry.min;
        const hMax = this.variables.heightmap_geometry.max;

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(img, 0, 0);
        const imgDataHeight = ctx.getImageData(
          0,
          0,
          img.width,
          img.height
        ).data;

        for (let index = 0; index < imgDataHeight.length; index += 4) {
          let heightValue = imgDataHeight[index] / 255;
          heightValue = heightValue * (hMax - hMin) + hMin;
          this.heightValues.push(heightValue);
        }
        resolve();
      };

      img.onerror = reject;
    });
  }
}
