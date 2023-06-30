#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const args = process.argv.slice(2);

let entryFolderPath = null;
let ignores = [];
let fileOutput = null;
let deep = null;
let noImport = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] == '--entryFolder' || args[i] == '-e') {
    entryFolderPath = args[i + 1];
  }

  if (args[i] == '--outputFile' || args[i] == '-o') {
    fileOutput = args[i + 1];
  }

  if (args[i] == '--ignore' || args[i] == '-i') {
    ignores = args[i + 1].split(',');
  }

  if (args[i] == '--deep' || args[i] == '-d') {
    deep = args[i + 1];
  }

  if (args[i] == '--noImport') {
    noImport = true;
  }

  if (args[i] == '--help' || args[i] == '-h') {
    console.log('Usage:');
    console.log('  --entryFolder -e <entry folder>');
    console.log('  --outputFile -o <output file>');
    console.log('  --ignore -i <ignore file>');
    console.log('  --deep -d <deep>');
    console.log('  --noImport');
    console.log('  --help, -h');
    process.exit(0);
  }
}
try {
  entryFolderPath = path.join(process.env.INIT_CWD, entryFolderPath);
  fileOutput = fileOutput
    ? path.resolve(fileOutput)
    : path.basename(entryFolderPath);
} catch (e) {
  console.log(
    'Error: Invalid entry folder path. Entry folderPath:',
    entryFolderPath
  );
  console.log('Usage:');
  console.log('  --entryFolder -e <entry folder>');
  console.log('  --outputFile -o <output file>');
  console.log('  --ignore -i <ignore file>');
  console.log('  --deep -d <deep>');
  console.log('  --noImport');
  console.log('  --help, -h');
  process.exit(1);
}

if (!fileOutput.includes('.md')) {
  fileOutput += '.md';
}

/**
 *
 * @param {string} line - line to add to the file
 * @param {string} filePath - path to the file
 */
function appendLine(line, filePath) {
  fs.appendFileSync(filePath, '\n' + line, (err) => {
    if (err) throw err;
  });
}

/**
 *
 * @param {string} baseID - base ID of the element
 * @param {string} suffixID - suffix ID to add to the base ID
 * @returns {string} Returns the new ID of the element
 */
function createIDOfElementDiagram(baseID, suffixID = null) {
  let result = baseID.replace(/[^a-zA-Z0-9]/g, '');
  if (suffixID == null) {
    return result;
  }
  suffixID = suffixID.replace(/[^a-zA-Z0-9]/g, '');
  return (result += suffixID[0].toUpperCase() + suffixID.slice(1));
}

class ElementDiagram {
  constructor(id) {
    this.id = id;
    this.line = null;
    this.paths = null;
    this.folderPath = null;
  }

  setLine(line) {
    this.line = line;
  }

  setPaths(paths) {
    this.paths = paths;
  }

  setFolderPath(folderPath) {
    this.folderPath = folderPath;
  }
}

const tab = ' ';
const entryID = createIDOfElementDiagram('ID' + path.basename(entryFolderPath));
/** @type {Array<ElementDiagram>} */
const elementsDiagram = {};
const lines = [];

/**
 *
 * @param {string} folderPath - path to the folder
 * @param {string} increment - increment to use at the start of the line
 * @param {string} idFolder - ID of the folder
 * @param {number} counterDeep - counter of the deep
 */
function createMermaidDiagramFromFolderPath(
  folderPath,
  increment,
  idFolder,
  counterDeep = 0
) {
  increment = increment || tab;
  const dirFolderPaths = {};
  const folderName = path.basename(folderPath);
  const id = createIDOfElementDiagram(
    idFolder,
    counterDeep == 0 ? null : folderName
  );

  elementsDiagram[folderPath] = new ElementDiagram(id);
  lines.push(increment + 'subgraph ' + id + '["' + folderName + '"]');
  if (!deep || (deep && counterDeep < deep)) {
    fs.readdirSync(folderPath).forEach((element) => {
      const lstat = fs.lstatSync(path.join(folderPath, element));
      const isDirectory = lstat.isDirectory();

      if (
        ignores.includes(element) ||
        ignores.includes(path.extname(element))
      ) {
        return;
      }

      if (isDirectory) {
        dirFolderPaths[path.join(folderPath, element)] = element;
      } else {
        const elementName = element;
        const idNameRead = createIDOfElementDiagram(id, elementName);
        elementsDiagram[path.join(folderPath, element)] = new ElementDiagram(
          idNameRead
        );
        lines.push(increment + tab + idNameRead + '["' + elementName + '"]');

        if (path.extname(element) == '.js') {
          const data = fs.readFileSync(path.join(folderPath, element));
          const matchImport = data.toString().match(/from.*('|").*('|")/g);
          const matchRequire = data.toString().match(/require\(("|').*\)/g);

          let allPaths = null;
          if (matchImport) {
            // console.log('IMPORT', matchImport);
            const matchImportPaths = [];
            matchImport.forEach((matchImport) => {
              const matchImportPath = matchImport.match(/('|").*('|")/g);
              if (matchImportPath != null) {
                matchImportPaths.push(
                  matchImportPath[0].substring(1, matchImportPath[0].length - 1)
                );
              }
            });
            allPaths = matchImportPaths;
          }
          if (matchRequire) {
            // console.log('REQUIRE', matchRequire);
            const matchRequirePaths = [];
            matchRequire.forEach((matchRequire) => {
              const matchRequirePath = matchRequire.match(/('|").*('|")/g);
              if (matchRequirePath != null) {
                matchRequirePaths.push(
                  matchRequirePath[0].substring(
                    1,
                    matchRequirePath[0].length - 1
                  )
                );
              }
            });
            allPaths = allPaths
              ? allPaths.concat(matchRequirePaths)
              : matchRequirePaths;
          }

          if (allPaths) {
            // console.log('ALL', allPaths);
            elementsDiagram[path.join(folderPath, element)].setLine(
              lines.length - 1
            );
            elementsDiagram[path.join(folderPath, element)].setPaths(allPaths);
            elementsDiagram[path.join(folderPath, element)].setFolderPath(
              folderPath
            );
          }
        }
      }
    });

    for (const fP in dirFolderPaths) {
      // console.log(fP, dirFolderPaths[fP]);
      createMermaidDiagramFromFolderPath(
        fP,
        increment + tab,
        id,
        counterDeep + 1
      );
    }
  }

  lines.push(increment + 'end');
}

try {
  fs.readdirSync(entryFolderPath);
} catch (e) {
  console.log('Error: Invalid folder path');
  process.exit(1);
}

const pathSplited = fileOutput.split(path.sep).slice(0, -1);
let prev = pathSplited[0];

for (let i = 1; i < pathSplited.length; i++) {
  prev = path.join(prev, pathSplited[i]);
  if (!fs.existsSync(prev)) {
    fs.mkdirSync(prev);
  }
}

fs.writeFileSync(fileOutput, '```mermaid', (err) => {
  if (err) throw err;
  process.exit(1);
});

appendLine('flowchart', fileOutput);

createMermaidDiagramFromFolderPath(entryFolderPath, null, entryID);
// console.log('ELEMENTS DIAGRAM', elementsDiagram);

/**
 * Create the lines of the import for the mermaid diagram
 */
function addLinesImport() {
  for (const key in elementsDiagram) {
    // console.log(key, elementsDiagram[key]);
    const paths = elementsDiagram[key].paths;
    if (paths) {
      paths.forEach((p) => {
        let keyP = path.join(elementsDiagram[key].folderPath, p);

        keyP += '.js';
        if (elementsDiagram[keyP]) {
          // console.log('FIND!!!!', keyP, elementsDiagram[keyP]);
          lines.push(
            elementsDiagram[key].id + '-.->|import|' + elementsDiagram[keyP].id
          );
        }
      });
    }
  }
}

if (!noImport) addLinesImport();

lines.forEach((line) => {
  appendLine(line, fileOutput);
});

appendLine('```', fileOutput);
console.log(fileOutput + ' has been created.');
