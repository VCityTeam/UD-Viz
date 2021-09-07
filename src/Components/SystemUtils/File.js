/** @format */

const jquery = require('jquery');

/**
 * Set of functions to mainpulate files
 */
module.exports = {
  /**
   * Download on the local disk an object as JSON
   * @param {Object} exportObj the object to download
   * @param {String} exportName the name of the file
   */
  downloadObjectAsJson: function (exportObj, exportName) {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(exportObj));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', exportName + '.json');
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  },

  /**
   * Request a json file on a distant server
   * @param {String} filePath on the distant server
   * @returns {Promise} a promise where the resolve function has as first parameter the json file
   */
  loadJSON(filePath) {
    return new Promise((resolve, reject) => {
      jquery.ajax({
        type: 'GET',
        url: filePath,
        datatype: 'json',
        success: (data) => {
          resolve(data);
        },
        error: (e) => {
          console.error(e);
          reject();
        },
      });
    });
  },

  /**
   * To be used with an input of type file
   * @param {Object} e input of type file argument when 'change'
   * @param {Function} onLoad callback passing the file as text as first argument
   */
  readSingleFileAsText(e, onLoad) {
    try {
      const file = e.target.files[0];
      if (file) {
        const _this = this;
        const reader = new FileReader();
        reader.onload = onLoad;
        reader.readAsText(file);
      }
    } catch (e) {
      throw new Error(e);
    }
  },

  readSingleFileAsDataUrl(e, onLoad) {
    try {
      const file = e.target.files[0];
      if (file) {
        const _this = this;
        const reader = new FileReader();
        reader.onload = onLoad;
        reader.readAsDataURL(file);
      }
    } catch (e) {
      throw new Error(e);
    }
  },

  downloadImageOnDisk(url, filename) {
    const imgResult = document.createElement('img');
    imgResult.src = url;
    const link = document.createElement('a');
    link.href = imgResult.src;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
