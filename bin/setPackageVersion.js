const { exec } = require('child-process-promise');
const fs = require('fs');

const packageName = process.argv[2];
if (!packageName)
  throw new Error(
    'package name not define, Usage: node setPackageVersion <package_name> <package_version>'
  );

const packageVersion = process.argv[3];
if (!packageVersion)
  throw new Error(
    'package version not define, Usage: node setPackageVersion <package_name> <package_version>'
  );

const setPackagePath = async () => {
  const dirents = fs.readdirSync('./packages', { withFileTypes: true });
  dirents.forEach(async (dirent) => {
    if (dirent.isDirectory()) {
      const path = './packages/' + dirent.name + '/package.json';
      const content = JSON.parse(fs.readFileSync(path));

      // Update peerDep
      for (const key in content.peerDependencies) {
        if (key == packageName) content.peerDependencies[key] = packageVersion;
      }

      fs.writeFileSync(path, JSON.stringify(content));
      await exec('npx prettier ' + path + ' -w');
    }
  });
};

setPackagePath();
