import { Game } from '@ud-viz/shared';

export class Map extends Game.ScriptTemplate.AbstractMap {
  load() {
    const _this = this;
    return new Promise((resolve, reject) => {
      // const gameObject = arguments[0];
      const conf = this.conf;

      const img = document.createElement('img');
      img.src = conf.heightmap_path;

      // callback of the img
      img.onload = function () {
        _this.heightmapSize = img.width;
        if (img.width != img.height)
          throw new Error('heightmap must be square image');

        const hMin = conf.heightmap_geometry.min;
        const hMax = conf.heightmap_geometry.max;

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
          _this.heightValues.push(heightValue);
        }
        resolve();
      };

      img.onerror = reject;
    });
  }
}
