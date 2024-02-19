const fs = require('fs');
const { exec } = require('child-process-promise');
const path = require('path');

const generateArchitectureDoc = () => {
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

    fs.writeFileSync(filePath, '# @ud-viz packages architecture\n\n');

    // mermaid graph generation
    [
        '```mermaid',
        'flowchart TB',
        'subgraph ud-viz/packages',
        ...packages,
        'end',
        ...peerDependencies,
        '```',
        '>This file is auto generated',
    ].forEach((line) => {
        fs.appendFileSync(filePath, '\n' + line, (err) => {
            if (err) throw err;
        });
    });
};

const generatePackagesArchitectureDoc = async () => {
    const packagesFolderPath = path.resolve(__dirname, '../packages');

    fs.readdirSync(packagesFolderPath).forEach(async (packageName) => {
        const packagePath = path.join(packagesFolderPath, packageName);
        const lstat = fs.lstatSync(packagePath);
        const isDirectory = lstat.isDirectory();

        if (!isDirectory) {
            return;
        }

        const autoMermaidCommand = `node ${packagesFolderPath}/utils_node/bin/autoMermaid.js -e ${packagePath}/src -o ${packagePath}/architecture.md`;

        const result = await exec(autoMermaidCommand);

        console.log(result.stdout);
        console.error(result.stderr);
    });
};

generatePackagesArchitectureDoc();
generateArchitectureDoc();