const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { log } = require('../util/log');

const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);
const writeFile = promisify(fs.writeFile);

async function readTextFile(txtFilePath) {
  log(`Reading text file: ${txtFilePath}`);

  const stats = await stat(txtFilePath);
  if (!stats.isFile()) throw new Error('Invalid file provided.');
  if (!path.isAbsolute(txtFilePath)) txtFilePath = path.resolve(process.cwd(), txtFilePath);

  log('Finished reading text file');
  return await readFile(txtFilePath, { encoding: 'utf8' });
}

async function writeTextFile(parsedTextData, writeFilePath) {
  log(`Writing parsed text data to: ${writeFilePath}`);
  // 1. Stringify JSON to prepare for write
  const outputJson = JSON.stringify(parsedTextData);

  // 2. Write data to file
  await writeFile(writeFilePath, outputJson, { encoding: 'utf8' });
  log('Finished writing text file');
}

async function deleteTextFile(txtFilePath) {
  log(`Deleting ${txtFilePath}`);
  log(`Finished deleting ${txtFilePath}`);
  
  return txtFilePath;
}

module.exports = {
  readTextFile,
  writeTextFile,
  deleteTextFile,
};