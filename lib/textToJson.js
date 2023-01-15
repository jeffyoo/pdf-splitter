const _ = require('lodash');
const { log } = require('../util/log');

const { includes, map, range, split, trim } = _;

function textToJson(txtFile) {
  log('textToJson starting.');
  
  let currentInfoKey = '';
  let totalNumOfPages;
  let currentSection;
  let currentIndex;
  let currentPageNum;
  let prevIndex;
  let prevPageNum;
  let pageMediaBeginCount = 0;

  // Split file by new line and format and return parsed text data arrObj
  return split(txtFile, '\r\n').reduce((accumulator, currentRow) => {
    if (!includes(currentRow, ':')) {
      currentSection = currentRow;   
      
      if (includes(currentRow, 'InfoBegin') && !accumulator[0]) {
        accumulator[0] = {};
      }

      if (includes(currentRow, 'BookmarkBegin')) {
        currentIndex = accumulator.length;
        prevIndex = currentIndex - 1;
        accumulator[currentIndex] = {};
      }

      if (includes(currentRow, 'PageMediaBegin')) {
        pageMediaBeginCount++;
        
        if (pageMediaBeginCount === 1) {
          const pageNum = totalNumOfPages - prevPageNum + 1;

          accumulator[currentIndex] = {
            ...accumulator[currentIndex],
            ['totalNumPages']: pageNum,
            ['pages']: range(prevPageNum, (prevPageNum + pageNum)),
          }
        }
      }

    } else {
      if (currentSection === 'InfoBegin') {
        if (includes(currentRow, 'InfoKey')) {
          currentInfoKey = trim(currentRow.slice(currentRow.indexOf(':') + 1));
        } else if (includes(currentRow, 'InfoValue')) {
          accumulator[0] = {
            ...accumulator[0],
            [currentInfoKey]: trim(currentRow.slice(currentRow.indexOf(':') + 1)),
          }
        } else {
          const [key, value] = map(split(currentRow, ':'), (str) => trim(str));

          if (key === 'NumberOfPages') {
            totalNumOfPages = Number(value);
            accumulator[0] = {
              ...accumulator[0],
              [key]: totalNumOfPages,
            }
          } else {
            accumulator[0] = {
              ...accumulator[0],
              [key]: value,
            }
          }
        }
      }
        
      if (currentSection === 'BookmarkBegin') {
        const [key, value] = map(split(currentRow, ':'), (str) => trim(str));
        
        if (key === 'BookmarkTitle') {
          const crashReportNum = split(value, '-')[1];

          accumulator[currentIndex] = {
            ...accumulator[currentIndex],
            ['HsmvCrashReportNum']: crashReportNum,
          }
        }

        if (key === 'BookmarkPageNumber') {
          // If prevPageNum is undefined, it's the first one
          if (!prevPageNum) {
            prevPageNum = Number(value);
            return accumulator;
          }

          // This is the second one onward: assign previous object a page num
          if (prevPageNum) {
            currentPageNum = Number(value);
            const pageNum = currentPageNum - prevPageNum;

            accumulator[prevIndex] = {
              ...accumulator[prevIndex],
              ['totalNumPages']: pageNum,
              ['pages']: range(prevPageNum, currentPageNum),
            }
            prevPageNum = Number(value);
          }
        }
      }
    }

    return accumulator;
    }, []);
  }

  module.exports = textToJson;