const exec = require('child-process-promise').exec;

const FAILURE_THRESHOLD = 50; // TODO this threshold should lower help please

exec('npx remark -u validate-links .').then((result) => {
  console.log(result.stderr);

  const warningsCountRegexResult = result.stderr.match(/\d+ warnings/);

  if (warningsCountRegexResult) {
    const warningsCount = warningsCountRegexResult[0].split(' warnings')[0]; // extract number

    if (warningsCount > FAILURE_THRESHOLD) {
      console.log(warningsCount, 'warnings reported');
      throw new Error('Too much warnings report to log above to fix them');
    }
  }
});
