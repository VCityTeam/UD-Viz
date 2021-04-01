/** @format */

module.exports = {
  parsePrefab(goJSON, manager) {
    const traverse = function (json, cb) {
      if (json.children instanceof Object) {
        for (let key in json.children) {
          cb(json.children, key);
        }
      }
    };

    traverse(goJSON, function (json, key) {
      const value = json[key];
      if (typeof value == 'string') {
        //id prefab inject json
        json[key] = manager.fetchPrefabJSON(value);
      }
    });

    return goJSON;
  },
};
