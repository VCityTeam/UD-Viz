const Core = require('../../src/index');

if (!Core.Component.Data.checkIfSubStringIsEuler(['1.2', '15', '45', 'XYZ'])) {
  throw new Error('should be true');
}

if (Core.Component.Data.checkIfSubStringIsEuler(['1.2', '15', '45', 'hello'])) {
  throw new Error('should be false');
}

// do more....
