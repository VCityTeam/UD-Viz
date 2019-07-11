/**
 * Represents the style of a tile part. Accepted parameters are :
 * 
 * - `materialProps` : properties of a THREE.js material.
 */
export class CityObjectStyle {
  constructor(params) {
    /**
     * THREE.js material properties.
     * 
     * @member {any} 
     */
    this.materialProps = null;

    if (typeof(params) !== "object") {
      throw 'TilePartStyle require parameters in its constructor';
    }

    for (let key of Object.keys(params)) {
      if (this[key] === null) {
        this[key] = params[key];
      } else {
        console.warn(`Invalid parameter for TilePartStyle : ${key}`);
      }
    }
  }
}