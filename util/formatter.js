function inputObjFormatter(pages, dirPath) {
  return pages.reduce((acc, currentPageNum, currentIndex) => {
    const key = String.fromCharCode(65 + currentIndex);
    const value = `${dirPath}/${currentPageNum}.pdf`;

    return {
      ...acc,
      [key]: value,
    }
  }, {});
}

module.exports = {
  inputObjFormatter,
};