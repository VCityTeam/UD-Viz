/** @format */

const Type = require('./Type');

module.exports = {
  parseInt(json) {
    const traverse = function (j, cb) {
      cb(j);
      for (let key in j) {
        if (j[key] instanceof Object) traverse(j[key], cb);
      }
    };

    traverse(json, function (c) {
      for (let key in c) {
        if (Type.isNumeric(c[key])) {
          c[key] = parseFloat(c[key]);
        }
      }
    });

    return json;
  },
};
