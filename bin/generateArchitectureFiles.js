#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const exec = require('child-process-promise').exec;

const packagesFolderPath = path.resolve(__dirname, '../packages');

fs.readdirSync(packagesFolderPath).forEach((packageName) => {
  const packagePath = path.join(packagesFolderPath, packageName);
  const lstat = fs.lstatSync(packagePath);
  const isDirectory = lstat.isDirectory();

  if (!isDirectory) {
    return;
  }

  const autoMermaidCommand = `node ${packagesFolderPath}/utils_node/bin/autoMermaid.js -e ${packagePath}/src -o ${packagePath}/architectureGenerated.md`;

  const childExecAutomermaid = exec(autoMermaidCommand);

  childExecAutomermaid.childProcess.stdout.on('data', (data) => {
    console.log(`${data}`);
  });

  childExecAutomermaid.childProcess.stderr.on('data', (data) => {
    console.error(` ERROR :\n${data}`);
  });
});
