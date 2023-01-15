const pdftk = require('node-pdftk');

const { deleteTextFile, readTextFile, writeTextFile } = require('./lib/filesystem');
const textToJson = require('./lib/textToJson');
const { inputObjFormatter } = require('./util/formatter');
const { errorLog, log} = require('./util/log');

async function main() {
  log('Starting pdf-splitter');

  // TODO: Look in files dir for all PDFs

  // 1. Break up megafile and create dump_data.txt
  await pdftk
    .input('./files/megafile.pdf')
    .burst('./output/temp/%01d.pdf')
    .then(() => log('Finished breaking up megafile.pdf'))
    .catch(err => errorLog('Error while breaking up megafile, error:', err));
  
  // 2. Read doc_data.txt file
  const txtFile = await readTextFile('./doc_data.txt');
  
  // 3. Parse doc_data.txt
  const parsedTextData = textToJson(txtFile);
  
  // Uncomment to create output.json (for dev work)
  // await writeTextFile(parsedTextData, './output/temp/output.json');

  // 4. Iterate through parsedTextData and concatenate PDF files
  for (let i = 1; i < parsedTextData.length; i++) {
    const { HsmvCrashReportNum, totalNumPages, pages } = parsedTextData[i];
    const formattedInputObj = inputObjFormatter(pages, './output/temp');
    const formattedCatStr = Object.keys(formattedInputObj).join(' ');
    
    // TODO: Does there have to be an await here?
      // Did first run in 23s
    pdftk
      .input(formattedInputObj)
      .cat(formattedCatStr)
      .output(`./output/${HsmvCrashReportNum}.pdf`)
      .then(() => log(`Made PDF file: ${HsmvCrashReportNum}.pdf (${totalNumPages} pages)`))
      .catch(err => logError('Error while concatenating PDF files, error:', err));
  }
  
  log('Finished combining all PDFs. Files located in /output');

  // TODO: Delete doc_data.txt and temp PDF files
  deleteTextFile('./doc_data.txt');
  log('End');
}

main();