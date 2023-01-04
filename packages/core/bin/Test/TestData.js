const Core = require('../../src/index');

if (!Core.Data.checkIfSubStringIsEuler(['1.2', '15', '45', 'XYZ'])) {
  throw new Error('should be true');
}

if (Core.Data.checkIfSubStringIsEuler(['1.2', '15', '45', 'hello'])) {
  throw new Error('should be false');
}

// string composer test

let bigString = '';
for (let i = 0; i < Core.Data.StringComposer.MAX_STRING_SIZE * 4; i++) {
  bigString += Math.random().toString(36).slice(2, 7);
}

const partialStrings = Core.Data.StringComposer.splitString(bigString);

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

const stringComposer = new Core.Data.StringComposer();
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
