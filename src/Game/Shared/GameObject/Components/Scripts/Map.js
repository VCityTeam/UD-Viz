/** @format */

const MapModule = class Map {
  constructor(data) {
    this.data = data;
    this.heightmapSize = null; //size of the heightmap
    this.heightValues = []; //values extract from heightmap
  }

  loadLocal() {
    return new Promise((resolve, reject) => {
      const gameObject = arguments[0];
      const data = this.data;

      const img = document.createElement('img');
      img.src = data.heightmap_path;

      //callback of the img
      const _this = this;

      img.onload = function () {
        _this.heightmapSize = { width: img.width, height: img.height };

        const hMin = data.heightmap_geometry.heightmap_min;
        const hMax = data.heightmap_geometry.heightmap_max;

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(img, 0, 0);
        const imgDataHeight = ctx.getImageData(0, 0, img.width, img.height)
          .data;

        for (let index = 0; index < imgDataHeight.length; index += 4) {
          let heightValue = imgDataHeight[index] / 255;
          heightValue = heightValue * (hMax - hMin) + hMin;
          _this.heightValues.push(heightValue);
        }
        console.log(gameObject.name, ' load heightmap');

        resolve();
      };

      img.onerror = reject;
    });
  }

  loadServer() {
    return new Promise((resolve, reject) => {
      const gameObject = arguments[0];
      const gm = arguments[2];
      const PNG = arguments[3];

      const data = this.data;

      const heightmap = gm(data.heightmap_path);
      console.log(data.heightmap_path)

      const _this = this;

      heightmap.toBuffer('png', function (err, buffer) {
        if (err) {
          throw new Error('toBuffer ' + err);
        }
        heightmap.size(function (err, size) {
          if (err) {
            throw new Error('size ' + err);
          }
          _this.heightmapSize = size;
          let png = new PNG();
          png.end(buffer);
          png.on('parsed', function (imgDataHeight) {
            const hMin = data.heightmap_geometry.heightmap_min;
            const hMax = data.heightmap_geometry.heightmap_max;
            for (let index = 0; index < imgDataHeight.length; index += 4) {
              let heightValue = imgDataHeight[index] / 255;
              heightValue = heightValue * (hMax - hMin) + hMin;
              _this.heightValues.push(heightValue);
            }
            console.log(gameObject.name, 'loaded');
            resolve();
          });
        });
      });
    });
  }

  load() {
    const isServerSide = arguments[1];

    if (!isServerSide) {
      return this.loadLocal.apply(this, arguments);
    } else {
      return this.loadServer.apply(this, arguments);
    }
  }

  updateElevation(mapGO, gameObject) {
    const getHeightValue = function (data, x, y, size, values) {
      //console.log(data)
      const bbox = data.heightmap_geometry.bounding_box;

      const pixelWorldUnit = {
        width: (bbox.max.x - bbox.min.x) / size.width,
        height: (bbox.max.y - bbox.min.y) / size.height,
      };

      const coordHeightmap = {
        x: x / pixelWorldUnit.width,
        y: (bbox.max.y - bbox.min.y - y) / pixelWorldUnit.height, //y is inverse
      };

      //weight with neighboor pixel
      const indexMin = {
        i: Math.floor(coordHeightmap.x),
        j: Math.floor(coordHeightmap.y),
      };

      const getPixelHeight = function (i, j, weight) {
        //clamp
        let out = false;
        if (i >= size.width) {
          // console.log('out of bound X >');
          out = true;
        } else if (i < 0) {
          // console.log('out of bound X <');
          out = true;
        } else if (j >= size.height) {
          // console.log('out of bound Y >');
          out = true;
        } else if (j < 0) {
          // console.log('out of bound Y <');
          out = true;
        }

        let result;
        if (out) {
          result = data.heightmap_geometry.heightmap_min;
        } else {
          result = values[i + j * size.width];
        }
        return weight * result;
      };

      return getPixelHeight(indexMin.i, indexMin.j, 1);
    };

    //update height of its children
    gameObject.transform.position.z = getHeightValue(
      this.data,
      gameObject.transform.position.x,
      gameObject.transform.position.y,
      this.heightmapSize,
      this.heightValues
    );
  }
};

MapModule.ID = 'map';
module.exports = MapModule;
