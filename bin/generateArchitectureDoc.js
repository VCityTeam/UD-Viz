const fs = require('fs');

const packages = [];
const peerDependencies = [];
const packagesFolder = './packages';

const dirents = fs.readdirSync(packagesFolder, { withFileTypes: true });
dirents.forEach((dirent) => {
  if (dirent.isDirectory()) {
    packages.push(dirent.name);

    const packageContent = JSON.parse(
      fs.readFileSync(packagesFolder + '/' + dirent.name + '/package.json')
    );

    const removeOrganizationName = (string) => {
      return string.replace('@ud-viz/', '');
    };

    const namePackage = removeOrganizationName(packageContent.name);

    for (const peerDepName in packageContent.peerDependencies) {
      if (peerDepName.startsWith('@ud-viz/')) {
        peerDependencies.push(
          namePackage + '-->' + removeOrganizationName(peerDepName)
        );
      }
    }
  }
});

// @ud-viz packages architecture

const filePath = './docs/static/architecture.md';

fs.writeFileSync(filePath, '# @ud-viz packages architecture');

// mermaid graph generation
[
  '```mermaid',
  'flowchart TB',
  'subgraph ud-viz/packages',
  ...packages,
  'end',
  ...peerDependencies,
].forEach((line) => {
  fs.appendFileSync(filePath, '\n' + line, (err) => {
    if (err) throw err;
  });
});
