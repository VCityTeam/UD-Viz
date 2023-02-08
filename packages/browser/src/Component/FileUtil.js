const jquery = require('jquery');

/**
 * Set of functions to mainpulate files
 */
module.exports = {
  /**
   * Download on the local disk an object as .json
   *
   * @param {object} exportObj - object to download
   * @param {string} exportName - name of file
   */
  downloadObjectAsJson: function (exportObj, exportName) {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(exportObj));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', exportName + '.json');
    document.body.appendChild(downloadAnchorNode); // Required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  },

  /**
   * Request a json file on a distant server
   *
   * @param {string} filePath - on the distant server
   * @returns {Promise} - promise resolving when .json loaded and pass it as first param
   */
  loadJSON: function (filePath) {
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
   * Request a text file on a distant server
   *
   * @param {string} filePath - on the distant server
   * @returns {Promise} - promise resolving when file loaded and pass it as first param
   */
  loadTextFile: function (filePath) {
    return new Promise((resolve, reject) => {
      jquery.ajax({
        type: 'GET',
        url: filePath,
        datatype: 'text',
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
   * Load multiples .json files
   *
   * @param {string[]} arrayPath - path of .json files to loaded
   * @returns {Promise} - promise reolving when .json files loaded, each .json file can be access by the filename
   * @example
   * loadMultipleJSON(["./some_folder/filename1.json","./another_folder/filename2.json"])
   *  .then((configs)=>{
   *    const contentFilename1 = configs["filename1"]
   *    const contentFilename2 = configs["filename2"]
   * })
   */
  loadMultipleJSON: function (arrayPath) {
    return new Promise((resolve, reject) => {
      const promises = [];
      const result = {};

      arrayPath.forEach((path) => {
        promises.push(
          this.loadJSON(path).then((jsonResult) => {
            const key = this.computeFileNameFromPath(path);
            if (result[key]) throw new Error('conflict same key');
            result[key] = jsonResult;
          })
        );
      });

      Promise.all(promises)
        .then(() => {
          resolve(result);
        })
        .catch(reject);
    });
  },

  /**
   *
   * @param {string} path - path of file
   * @returns {string} - name of file
   * @example
   * console.log(computeFilename("./some_folder/another_folder/filename.whatever"))// log filename
   */
  computeFileNameFromPath: function (path) {
    const indexLastSlash = path.lastIndexOf('/');
    const indexLastPoint = path.lastIndexOf('.');
    return path.slice(indexLastSlash + 1, indexLastPoint);
  },

  /**
   * @callback FileReaderCallback
   * @param {ProgressEvent<FileReader>} event - file reader event
   */

  /**
   * To be used with an input of type file
   *
   * @param {object} e - input of type file argument when 'change'
   * @param {FileReaderCallback | null} onLoad - callback when file loaded
   */
  readSingleFileAsText: function (e, onLoad) {
    try {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = onLoad;
        reader.readAsText(file);
      }
    } catch (e) {
      throw new Error(e);
    }
  },

  /**
   * To be used with an input of type file
   *
   * @param {object} e input of type file argument when 'change'
   * @param {FileReaderCallback} onLoad - callback when file loaded
   */
  readSingleFileAsDataUrl: function (e, onLoad) {
    try {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = onLoad;
        reader.readAsDataURL(file);
      }
    } catch (e) {
      throw new Error(e);
    }
  },

  /**
   * Download an image on the local disk
   *
   * @param {string} url - url of the image to download
   * @param {string} filename - name of the file on disk
   */
  downloadImageOnDisk: function (url, filename) {
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
