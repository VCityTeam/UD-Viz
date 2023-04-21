const exec = require('child-process-promise').exec;

exec('npm run docs').then((result) => {
  console.log(result.stderr);

  const coutnStringOccurence = (regex, label) => {
    const countRegexResult = result.stderr.match(regex);

    if (countRegexResult) {
      const count = countRegexResult.length; // extract number

      if (count > 0) {
        console.log(count + ' ' + label);
        process.exit(1); // these strings occurence should be fixed
      }
    }
  };

  coutnStringOccurence(/WARNING/g, 'WARNING');
  coutnStringOccurence(/ERROR/g, 'ERROR');
});
