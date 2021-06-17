/** @format */

const Type = require('./Type');

module.exports = {
  equals(j1, j2) {
    const traverse = function (json1, json2) {
      for (let key in json1) {
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
      return true; //all check have passed meaning is equals
    };

    return traverse(j1, j2);
  },

  overWrite(jsonOverWrited, jsonModel) {
    const traverse = function (json1, json2) {
      for (let key in json1) {
        if (json1[key] instanceof Object) {
          if (json2[key] instanceof Object) traverse(json1[key], json2[key]);
        } else {
          if (json2[key] != undefined) {
            json1[key] = json2[key];
            // console.log('overwrite ', json1);
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

  separator: '&',

  pack(jsonArray) {
    let result = '';
    for (let key in jsonArray) {
      result += JSON.stringify(jsonArray[key]);
      result += this.separator;
    }

    //remove seprator at the end
    if (result.endsWith(this.separator)) {
      result = result.slice(0, result.length - this.separator.length);
    }
    return result;
  },

  unpack(string) {
    const splitString = string.split(this.separator);
    const result = {};
    splitString.forEach(function (p) {
      const json = JSON.parse(p);
      result[json.name] = json;
    });

    return result;
  },
};
