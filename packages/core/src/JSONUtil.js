const Type = require('./Type');

/**
 * Static funtions to manipulate JSON
 */
module.exports = {
  /**
   * Check if two JSON are equals
   *
   * @param {JSON} j1 - first json
   * @param {JSON} j2 - second json
   * @returns {boolean} - true if both json are equals, false otherwise
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
   * Overwrite identical key of jsonOverWrited with the one matching in jsonModel
   * Create key of jsonModel which are not in jsonOverWrited
   *
   * @param {JSON} jsonOverWrited - json overwrited
   * @param {JSON} jsonModel - json used as model to overwrite
   */
  overWrite: function (jsonOverWrited, jsonModel) {
    const traverse = function (json1, json2) {
      // write the ones not in jsonOverWrited
      for (const key in json2) {
        if (json1[key] == undefined) {
          json1[key] = json2[key];
        }
      }

      // check in jsonOverWrited the ones existing in jsonModel
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
   * Apply a callback to each key value couple of a json
   *
   * @param {JSON} json - json to parse
   * @param {Function} cb - callback to apply (first argument is the object containing the key and second is the key)
   * @returns {JSON} - json parsed
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

  /**
   * Replace all valid number string in a json by a float
   *
   * @param {JSON} json - json to parse
   * @returns {JSON} - json parsed
   */
  parseNumeric: function (json) {
    return this.parse(json, function (j, key) {
      if (Type.isNumeric(j[key])) {
        j[key] = parseFloat(j[key]);
      }
    });
  },
};
