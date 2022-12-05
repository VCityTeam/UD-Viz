

const Type = require('./Type');

/**
 * Set of utility function to handle JSON
 */

module.exports = {
  /**
   * Parse float value of a vector3
   *
   * @param {THREE.Vector3} vector
   */
  parseVector3: function (vector) {
    vector.x = parseFloat(vector.x);
    vector.y = parseFloat(vector.y);
    vector.z = parseFloat(vector.z);
  },

  /**
   * Test if two JSON are identical
   *
   * @param {JSON} j1 first json
   * @param {JSON} j2 second json
   * @returns {boolean} true if both json are identical, false otherwise
   */
  equals: function (j1, j2) {
    const traverse = function (json1, json2) {
      for (const key in json1) {
        if (json1[key] instanceof Object) {
          if (json2[key] instanceof Object) {
            if (traverse(json1[key], json2[key])) {
              continue;
            } else {
              return false;
            }
          } else {
            return false;
          }
        } else {
          if (json2[key] == json1[key]) {
            continue;
          } else {
            return false;
          }
        }
      }
      return true; // All check have passed meaning is equals
    };

    return traverse(j1, j2);
  },

  /**
   * Overwrite identical field of a json with another one
   *
   * @param {JSON} jsonOverWrited the json overwritted
   * @param {JSON} jsonModel the json used as model
   */
  overWrite: function (jsonOverWrited, jsonModel) {
    const traverse = function (json1, json2) {
      for (const key in json1) {
        if (json1[key] instanceof Object) {
          if (json2[key] instanceof Object) traverse(json1[key], json2[key]);
        } else {
          if (json2[key] != undefined) {
            json1[key] = json2[key];
          }
        }
      }
    };

    traverse(jsonOverWrited, jsonModel);
  },

  /**
   * Apply a callback to each field of json
   *
   * @param {JSON} json the json to be parsed
   * @param {Function} cb callback with first argument the json and second the key
   * @returns {JSON} the json parsed
   */
  parse: function (json, cb) {
    for (const key in json) {
      if (json[key] instanceof Object) {
        this.parse(json[key], cb);
      } else {
        cb(json, key);
      }
    }
    return json;
  },

  // Same as parse but you can pass the name of array that should be not parse
  parseExceptArrays: function (json, cb, exceptArrays) {
    for (const key in json) {
      if (json[key] instanceof Object) {
        if (json[key] instanceof Array && exceptArrays.includes(key)) {
          cb(json, key);
        } else {
          this.parseExceptArrays(json[key], cb, exceptArrays);
        }
      } else {
        cb(json, key);
      }
    }
    return json;
  },

  /**
   * Parse to float every field of type numeric in json
   *
   * @param {JSON} json the json to be parsed
   * @returns {JSON} the json parsed
   */
  parseNumeric: function (json) {
    return this.parse(json, function (j, key) {
      if (Type.isNumeric(j[key])) {
        j[key] = parseFloat(j[key]);
      }
    });
  },

  /**
   * Symbol used to separate field of a json array
   */
  separator: '&',

  /**
   * Transform a json array to a single string
   *
   * @param {JSONArray} jsonArray the json array to transform
   * @returns {string} String corresponding to the json array
   */
  pack: function (jsonArray) {
    let result = '';
    for (const key in jsonArray) {
      result += JSON.stringify(jsonArray[key]);
      result += this.separator;
    }

    // Remove seprator at the end
    if (result.endsWith(this.separator)) {
      result = result.slice(0, result.length - this.separator.length);
    }
    return result;
  },

  /**
   * Transform a string to a json array
   *
   * @param {string} string corresponding to a json array pack
   * @returns {JSONArray} json array corresponding to the string
   */
  unpack: function (string) {
    const splitString = string.split(this.separator);
    const result = {};
    splitString.forEach(function (p) {
      const json = JSON.parse(p);
      result[json.name] = json;
    });

    return result;
  },
};
