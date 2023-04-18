const exec = require('child-process-promise').exec;
const fs = require('fs');
const { Data } = require('@ud-viz/shared');

const FAILURE_THRESHOLD = 32; // WIP temporal extension documentation

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

  // DETECT ABSOLUTE PATH in Link

  /**
   * directory to not parse
   */
  const blackDirectoryList = ['node_modules'];

  /**
   *
   * @param {string} path - path to check
   * @returns {boolean} - true if path is an absolute path
   */
  const isAbsolutePath = (path) => {
    const noAbsolutePathPrefix = ['https', 'http', '.', '#'];
    let result = true;
    for (let index = 0; index < noAbsolutePathPrefix.length; index++) {
      const prefix = noAbsolutePathPrefix[index];
      if (path.startsWith(prefix)) {
        result = false;
        break;
      }
    }
    return result;
  };

  /**
   * Record log infos to display for absolute path check
   */
  class LogInfosAbsolutePath {
    constructor(filename) {
      this.filename = filename;
      this.absoluteLinks = [];
    }

    record(link) {
      this.absoluteLinks.push(link);
    }

    log() {
      console.log(this.filename);
      console.log(this.absoluteLinks);
    }
  }

  const logInfos = [];

  const parseDirectory = (directoryPath) => {
    const dirents = fs.readdirSync(directoryPath, { withFileTypes: true });
    dirents.forEach((dirent) => {
      if (dirent.isFile() && Data.computeFileFormat(dirent.name) == 'md') {
        const filePath = directoryPath + '/' + dirent.name;
        let logInfo = null;
        const contentMd = fs.readFileSync(filePath, {
          encoding: 'utf-8',
        });

        const linkRegexResult = contentMd.match(/\[(.*?)\]\(.*?\)/gm);

        if (linkRegexResult) {
          linkRegexResult.forEach((link) => {
            // could be done with a regex but i didn't find one matching all cases
            let lastCharacter = null;
            let path = null;
            for (let index = link.length - 1; index >= 0; index--) {
              const character = link[index];
              if (index == link.length - 1 && character != ')') {
                console.log(link);
                throw new Error('wrong link format');
              }

              // detect first ]( path is between there and the end of link
              if (lastCharacter == '(' && character == ']') {
                path = link.slice(index + 2, link.length - 1);
                break;
              }

              lastCharacter = character;
            }

            if (!path) throw new Error('cant find path in link');

            if (isAbsolutePath(path)) {
              if (!logInfo) {
                logInfo = new LogInfosAbsolutePath(filePath);
                logInfos.push(logInfo);
              }
              logInfo.record(link);
            }
          });
        }

        if (!logInfo) console.log(filePath + ': no issues found');
      } else if (
        dirent.isDirectory() &&
        !blackDirectoryList.includes(dirent.name)
      ) {
        parseDirectory(directoryPath + '/' + dirent.name); // recursive
      }
    });
  };

  console.log('\nCheck Absolute path\n');
  parseDirectory('.');

  if (logInfos.length) {
    console.log('\nFound Absolute path\n');

    let countAbsolutePath = 0;
    logInfos.forEach((logInfo) => {
      logInfo.log();
      countAbsolutePath += logInfo.absoluteLinks.length;
    });
    throw new Error(
      'There is ' +
        countAbsolutePath +
        ' absolute path use relative path or URL instead'
    );
  }
});
