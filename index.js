const fs = require('fs');
const pdftk = require('node-pdftk');

const { deleteTextFile, readTextFile, writeTextFile } = require('./lib/filesystem');
const textToJson = require('./lib/textToJson');
const { inputObjFormatter } = require('./util/formatter');
const { logError, log} = require('./util/log');

async function main() {
  log('Starting pdf-splitter');
  
  const outputDir = './output';
  const tmpDir = './output/tmp';

  if (!fs.existsSync(outputDir)){
    console.log('output dir does not exist, making it now');
    fs.mkdirSync(outputDir);
  } else {
    console.log('output dir exists');
  }

  if (!fs.existsSync(tmpDir)){
    console.log('tmp dir does not exist, making it now');
    fs.mkdirSync(tmpDir);
  } else {
    console.log('tmp dir exists');
  }

  // TODO: Look in files dir for all PDFs

  // 1. Break up megafile and create dump_data.txt
  await pdftk
    .input('./files/megafile.pdf')
    .burst('./output/tmp/%01d.pdf')
    .then(() => log('Finished breaking up megafile.pdf'))
    .catch(err => logError('Error while breaking up megafile, error:', err));
  
  // 2. Read doc_data.txt file
  const txtFile = await readTextFile('./doc_data.txt');
  
  // 3. Parse doc_data.txt
  const parsedTextData = textToJson(txtFile);
  
  // Uncomment to create output.json (for dev work)
  await writeTextFile(parsedTextData, './output/tmp/output.json');

  // 4. Iterate through parsedTextData and concatenate PDF files
  for (let i = 1; i < parsedTextData.length; i++) {
    const { HsmvCrashReportNum, totalNumPages, pages } = parsedTextData[i];
    const formattedInputObj = inputObjFormatter(pages, './output/tmp');
    const formattedCatStr = Object.keys(formattedInputObj).join(' ');
    
    // TODO: Does there have to be an await here?
      // Did first run in 23s
    pdftk
      .input(formattedInputObj)
      .cat(formattedCatStr)
      .output(`./output/${HsmvCrashReportNum}.pdf`)
      .then(() => log(`Successfully made PDF file: ${HsmvCrashReportNum}.pdf (${totalNumPages} pages)`))
      .catch(err => logError(`Error while concatenating ${HsmvCrashReportNum}.pdf. Error: ${err}`));
  }
  
  log('Finished combining all PDFs. Files located in /output');

  // TODO: Delete doc_data.txt and tmp PDF files
  deleteTextFile('./doc_data.txt');
  log('End');
}

main();