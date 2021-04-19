/** @format */

const Type = require('./Type');

module.exports = {
  overWrite(jsonOverWrited, jsonModel) {
    const traverse = function (json1, json2) {
      for (let key in json1) {
        if (json1[key] instanceof Object) {
          if (json2[key] instanceof Object) traverse(json1[key], json2[key]);
        } else {
          if (json2[key] != undefined) {
            json1[key] = json2[key];
            console.log('overwrite ', json1);
          }
        }
      }
    };

    traverse(jsonOverWrited, jsonModel);
  },

  parse(json, cb) {
    for (let key in json) {
      if (json[key] instanceof Object) {
        this.parse(json[key], cb);
      } else {
        cb(json, key);
      }
    }
    return json;
  },

  parseNumeric(json) {
    return this.parse(json, function (j, key) {
      if (Type.isNumeric(j[key])) {
        j[key] = parseFloat(j[key]);
      }
    });
  },
};
