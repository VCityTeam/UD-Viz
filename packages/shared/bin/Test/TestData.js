const Shared = require('../../src/index');

if (!Shared.Data.checkIfSubStringIsEuler(['1.2', '15', '45', 'XYZ'])) {
  throw new Error('should be true');
}

if (Shared.Data.checkIfSubStringIsEuler(['1.2', '15', '45', 'hello'])) {
  throw new Error('should be false');
}

// overwrite
const json1 = { a: ['a'], b: ['b'] };
const json2 = { a: [], b: [] };
Shared.Data.objectOverWrite(json1, json2);
if (!Shared.Data.objectEquals(json1, json2)) throw new Error('wrong overwrite');

// string composer test

let bigString = '';
for (let i = 0; i < Shared.Data.StringComposer.MAX_STRING_SIZE * 4; i++) {
  bigString += Math.random().toString(36).slice(2, 7);
}

const partialStrings = Shared.Data.StringComposer.splitString(bigString);

// shuffle partialStrings
const randomize = (values) => {
  let index = values.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (index != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * index);
    index--;

    // And swap it with the current element.
    [values[index], values[randomIndex]] = [values[randomIndex], values[index]];
  }

  return values;
};

randomize(partialStrings);

const stringComposer = new Shared.Data.StringComposer();
let recomposed = false;
partialStrings.forEach((partialString) => {
  const bigStringRecomposed = stringComposer.recompose(partialString);
  if (bigStringRecomposed) {
    recomposed = true;
    if (bigStringRecomposed != bigString)
      throw new Error('string not well recomposed');
  }
});

if (!recomposed) throw new Error('string did not recomposed');

// do more....
