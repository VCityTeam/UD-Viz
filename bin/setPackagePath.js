const { exec } = require('child-process-promise');
const fs = require('fs');

const packageName = process.argv[2];
if (!packageName) throw new Error('package name unset');

const packagePath = process.argv[3];
if (!packagePath) throw new Error('package path unset');

const setPackagePath = async () => {
  const dirents = fs.readdirSync('./packages', { withFileTypes: true });
  dirents.forEach(async (dirent) => {
    if (dirent.isDirectory()) {
      const path = './packages/' + dirent.name + '/package.json';
      const content = JSON.parse(fs.readFileSync(path));

      // Update peerDep
      for (const key in content.peerDependencies) {
        if (key == packageName) content.peerDependencies[key] = packagePath;
      }

      fs.writeFileSync(path, JSON.stringify(content));
      await exec('npx prettier ' + path + ' -w');
    }
  });
};

setPackagePath();
