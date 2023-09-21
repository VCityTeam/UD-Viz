const {
  checkIfSubStringIsEuler,
  objectOverWrite,
  objectEquals,
} = require('../src/index');

if (!checkIfSubStringIsEuler(['1.2', '15', '45', 'XYZ'])) {
  throw new Error('should be true');
}

if (checkIfSubStringIsEuler(['1.2', '15', '45', 'hello'])) {
  throw new Error('should be false');
}

// overwrite
const json1 = { a: ['a'], b: ['b'] };
const json2 = { a: [], b: [] };
objectOverWrite(json1, json2);
if (!objectEquals(json1, json2)) throw new Error('wrong overwrite');
