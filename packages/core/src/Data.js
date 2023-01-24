const THREE = require('three');
const Type = require('./Type');

/**
 * `MODULE` Data
 *
 * @exports Data
 */

/**
 * @class
 */
class PartialString {
  /**
   * Part of a global string
   *
   * @param {string} stringUUID - uuid of the initial string splited
   * @param {string} data - part of the initial string
   */
  constructor(stringUUID, data) {
    /**
     * uuid of the initial string splited
     *
     *  @type {string}
     */
    this.stringUUID = stringUUID;

    /**
     * part of the initial string
     *
     *  @type {string}
     */
    this.data = data;

    /**
     * index of the position of this in the initial string
     *
     *  @type {number}
     */
    this.index = -1;

    /**
     * total number of partial string of the initial string
     *
     *  @type {number}
     */
    this.totalPartialStringCount = -1;
  }

  /**
   * Set the index of this
   *
   * @param {number} index - index of this
   */
  setIndex(index) {
    this.index = index;
  }

  /**
   * Set the total partial string count
   *
   * @param {number} value - total partial string count of this
   */
  setTotalPartialStringCount(value) {
    this.totalPartialStringCount = value;
  }
}

/**
 * @class
 */
class StringComposer {
  /**
   * Recompose string with {@link PartialString}
   */
  constructor() {
    /**
     * buffer of all string being recompose
     *
     * @type {Object<string,Object<number,PartialString>>}
     */
    this.buffer = {};
  }

  /**
   * Recompose a string with a partial string
   *
   * @param {PartialString} partialString - part of a string being recompose
   * @returns {string|null} - return null if the recomposition still need partial string, the initial string otherwise
   */
  recompose(partialString) {
    const stringUUID = partialString.stringUUID;
    if (!this.buffer[stringUUID]) {
      // First partial string of this string
      this.buffer[stringUUID] = {};
    }

    // Record partial string
    this.buffer[stringUUID][partialString.index] = partialString;

    // Check if all the partial string are here
    if (
      Object.keys(this.buffer[stringUUID]).length ==
      partialString.totalPartialStringCount
    ) {
      // Can recompose initial string
      let bufferString = '';
      for (
        let index = 0;
        index < partialString.totalPartialStringCount;
        index++
      ) {
        bufferString += this.buffer[stringUUID][index].data;
      }

      // clean buffer
      delete this.buffer[stringUUID];

      return bufferString;
    }

    return null; // No complete
  }
}

/**
 * Max size of the data of a {@link PartialString}
 *
 * @memberof StringComposer
 * @type {number}
 */
StringComposer.MAX_STRING_SIZE = 10000;

/**
 * Split a large string (superior at {@link StringComposer.MAX_STRING_SIZE}) into {@link PartialString}
 *
 * @memberof StringComposer
 * @param {string} largeString - a string with a size superior at {@link StringComposer.MAX_STRING_SIZE}
 * @returns {PartialString[]} - an array containing all the {@link PartialString}
 */
StringComposer.splitString = function (largeString) {
  const stringUUID = THREE.MathUtils.generateUUID();
  const result = [];

  // Cut in several partial message
  while (largeString.length > StringComposer.MAX_STRING_SIZE) {
    const sliceMessage = largeString.slice(0, StringComposer.MAX_STRING_SIZE);
    largeString = largeString.slice(
      StringComposer.MAX_STRING_SIZE,
      largeString.length
    );
    result.push(new PartialString(stringUUID, sliceMessage));
  }

  // Add what need
  if (largeString.length) {
    result.push(new PartialString(stringUUID, largeString));
  }

  // Push info to recompose string
  for (let index = 0; index < result.length; index++) {
    const partialString = result[index];
    partialString.setIndex(index);
    partialString.setTotalPartialStringCount(result.length);
  }

  return result;
};

/**
 * Take an array of string and check if it is in vector3 format
 *
 * @param {Array<string>} subString - array of string
 * @returns {boolean} - true if it is vector3 format
 */
function checkIfSubStringIsVector3(subString) {
  if (subString.length != 3) {
    // Need three string
    return false;
  }

  for (let index = 0; index < subString.length; index++) {
    const element = subString[index];
    if (!Type.isNumeric(element)) {
      // All string should be numerics
      return false;
    }
  }

  return true;
}

/**
 * Take an array of string and check if it is in euler format
 *
 * @param {Array<string>} subString - array of string
 * @returns {boolean} - true if it is euler format
 */
function checkIfSubStringIsEuler(subString) {
  if (subString.length != 4) {
    // Need four string
    return false;
  }

  // Three first string have to be numerics
  if (!Type.isNumeric(subString[0])) return false;
  if (!Type.isNumeric(subString[1])) return false;
  if (!Type.isNumeric(subString[2])) return false;

  // The last one has to be an euler order
  if (
    subString[3] == 'XYZ' ||
    subString[3] == 'XZY' ||
    subString[3] == 'ZYX' ||
    subString[3] == 'ZXY' ||
    subString[3] == 'YZX' ||
    subString[3] == 'YXZ'
  ) {
    return true;
  }
  return false;
}

/**
 * Taking a string from the unpacking URI and splitting it into an array of strings.
 *
 * @param {string} uriComp - The string from the unpacking URI
 * @returns {Array<string>} - returns the array of strings if it is in vector3 format, otherwise returns null
 */
function vector3ArrayFromURIComponent(uriComp) {
  const subString = uriComp.split(',');

  if (checkIfSubStringIsVector3(subString)) {
    return subString;
  }
  return null;
}

/**
 * Taking a string from the unpacking URI and splitting it into an array of strings.
 *
 * @param {string} uriComp - The string from the unpacking URI
 * @returns {Array<string>} - returns the array of strings if it is in euler format, otherwise returns null
 */
function eulerArrayFromURIComponent(uriComp) {
  const subString = uriComp.split(',');

  if (checkIfSubStringIsEuler(subString)) {
    return subString;
  }
  return null;
}

/**
 * Convert an Object into a Int32Array
 *
 * @param {object} obj - object to convert
 * @returns {Int32Array} - array converted
 */
function objectToInt32Array(obj) {
  const OString = JSON.stringify(obj);
  const SABuffer = new SharedArrayBuffer(
    Int32Array.BYTES_PER_ELEMENT * OString.length
  );
  const sArray = new Int32Array(SABuffer);

  for (let i = 0; i < OString.length; i++) {
    sArray[i] = OString.charCodeAt(i);
  }

  return sArray;
}

/**
 * Convert a Int32Array into an Object
 *
 * @param {Int32Array} array - array to convert
 * @returns {object} - object converted
 */
function int32ArrayToObject(array) {
  const str = String.fromCharCode.apply(this, array);
  return JSON.parse(str);
}

/**
 * Convert a data URI into a Buffer
 *
 * @param {string} uri - data uri to convert
 * @returns {Buffer|null} - the buffer of the data uri or null if uri is not a data uri
 */
function dataUriToBuffer(uri) {
  if (!/^data:/i.test(uri)) {
    return null; // Its not a Data URI
  }
  // Strip newlines
  uri = uri.replace(/\r?\n/g, '');
  // Split the URI up into the "metadata" and the "data" portions
  const firstComma = uri.indexOf(',');
  if (firstComma === -1 || firstComma <= 4) {
    throw new TypeError('malformed data: URI');
  }
  // Remove the "data:" scheme and parse the metadata
  const meta = uri.substring(5, firstComma).split(';');
  let charset = '';
  let base64 = false;
  const type = meta[0] || 'text/plain';
  let typeFull = type;
  for (let i = 1; i < meta.length; i++) {
    if (meta[i] === 'base64') {
      base64 = true;
    } else {
      typeFull += `;${meta[i]}`;
      if (meta[i].indexOf('charset=') === 0) {
        charset = meta[i].substring(8);
      }
    }
  }
  // Defaults to US-ASCII only if type is not provided
  if (!meta[0] && !charset.length) {
    typeFull += ';charset=US-ASCII';
    charset = 'US-ASCII';
  }
  // Get the encoded data portion and decode URI-encoded chars
  const encoding = base64 ? 'base64' : 'ascii';
  const data = unescape(uri.substring(firstComma + 1));
  const buffer = Buffer.from(data, encoding);
  // Set `.type` and `.typeFull` properties to MIME type
  buffer.type = type;
  buffer.typeFull = typeFull;
  // Set the `.charset` property
  buffer.charset = charset;
  return buffer;
}

/**
 * Removes empty fields from a FormData. Useful for update requests that
 * would update those fields to an empty string if they were sent in the
 * body. To check if a value is empty, this function just convert it into
 * a boolean.
 *
 * @param {FormData} formData The form data.
 * @returns {FormData} The same data, without the fields containing an empty value.
 */
function removeEmptyValues(formData) {
  const emptyKeys = [];
  formData.forEach((value, key) => {
    if (!value) {
      emptyKeys.push(key);
    }
  });
  emptyKeys.forEach((key) => {
    formData.delete(key);
  });
  return formData;
}

/**
 * Converts the raw content of an array buffer (as retrieved by a GET request
 * on a file) to a data URI. This is required, for example, to display images
 * fetched from the server. As we need authentication headers to retrieve some
 * protected files, we get the raw data dynamically and need to convert it to
 * a data URI do display it.
 * The basic scheme of the URI is defined in the
 * [RFC 2397](https://tools.ietf.org/html/rfc2397), with the mediaType set to
 * `mimeType` and the raw data converted to base64.
 *
 * @param {ArrayBuffer} arrayBuffer The binary data of the file.
 * @param {string} mimeType The media type. Any type supported by a data URI
 * should work. For images, use `image/png` or `image/jpeg` for instance.
 * @param {number} chunkSize The size of the chunks used to process the raw
 * data. If you get an exception saying that too many arguments were passed as
 * parameters, try reducing this value.
 * @returns {string} - data uri
 */
function imageToDataURI(arrayBuffer, mimeType, chunkSize = 8 * 1024) {
  // The response is a raw file, we need to convert it to base64
  // File (ArrayBuffer) -> Byte array -> String -> Base64 string
  const responseArray = new Uint8Array(arrayBuffer);

  // Make a string from the response array. As the array can be
  // too long (each value will be passed as an argument to
  // String.fromCharCode), we need to split it into chunks
  let responseAsString = '';
  for (let i = 0; i < responseArray.length / chunkSize; i++) {
    responseAsString += String.fromCharCode.apply(
      null,
      responseArray.slice(i * chunkSize, (i + 1) * chunkSize)
    );
  }

  const b64data = 'data:' + mimeType + ';base64,' + btoa(responseAsString);
  return b64data;
}

/**
 * Gets an attribute of an object from the given path. To get nested attributes,
 * the path qualifiers must be separated by dots ('.'). If the path is not
 * nested (does not contain any dot), the function is equivalent to `obj[path]`.
 *
 * @param {object} obj - object to get attribute
 * @param {string} path - path to get the attribute
 * @returns {*} - attribute vaue
 * @example
 * const obj = {test: {msg: "Hello world !"}};
 * console.log(getAttributeByPath(obj, "test.msg")); // prints "Hello world !";
 * console.log(getAttributeByPath(obj, "other")); // undefined
 */
function getAttributeByPath(obj, path) {
  const segs = path.split('.');
  let val = obj;
  for (const seg of segs) {
    val = val[seg];
    if (val === undefined) {
      break;
    }
  }
  return val;
}

/**
 * Check if two json object are equals
 *
 * @param {object} j1 - first json object
 * @param {object} j2 - second json object
 * @returns {boolean} - true if both json are equals, false otherwise
 */
function objectEquals(j1, j2) {
  const traverse = function (json1, json2) {
    for (const key in json1) {
      if (json1[key] instanceof Object) {
        if (json2[key] instanceof Object) {
          if (traverse(json1[key], json2[key])) {
            continue;
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else {
        if (json2[key] == json1[key]) {
          continue;
        } else {
          return false;
        }
      }
    }
    return true; // All check have passed meaning is equals
  };

  return traverse(j1, j2);
}

/**
 * Overwrite identical key of jsonOverWrited with the one matching in jsonModel
 * Create key of jsonModel which are not in jsonOverWrited
 *
 * @param {object} jsonOverWrited - json object overwrited
 * @param {object} jsonModel - json object used as model to overwrite
 */
function objectOverWrite(jsonOverWrited, jsonModel) {
  const traverse = function (json1, json2) {
    // write the ones not in jsonOverWrited
    for (const key in json2) {
      if (json1[key] == undefined) {
        json1[key] = json2[key];
      }
    }

    // check in jsonOverWrited the ones existing in jsonModel
    for (const key in json1) {
      if (json1[key] instanceof Object) {
        if (json2[key] instanceof Object) traverse(json1[key], json2[key]);
      } else {
        if (json2[key] != undefined) {
          json1[key] = json2[key];
        }
      }
    }
  };

  traverse(jsonOverWrited, jsonModel);
}

/**
 * Apply a callback to each key value couple of a json object
 *
 * @param {object} json - json object to parse
 * @param {Function} cb - callback to apply (first argument is the object containing the key and second is the key)
 * @returns {object} - json object parsed
 */
function objectParse(json, cb) {
  for (const key in json) {
    if (json[key] instanceof Object) {
      this.parse(json[key], cb);
    } else {
      cb(json, key);
    }
  }
  return json;
}

/**
 * Replace all valid number string in a json object by a float
 *
 * @param {object} json - json object to parse
 * @returns {object} - json object parsed
 */
function objectParseNumeric(json) {
  return this.parse(json, function (j, key) {
    if (Type.isNumeric(j[key])) {
      j[key] = parseFloat(j[key]);
    }
  });
}
module.exports = {
  PartialString: PartialString,
  StringComposer: StringComposer,
  checkIfSubStringIsEuler: checkIfSubStringIsEuler,
  checkIfSubStringIsVector3: checkIfSubStringIsVector3,
  vector3ArrayFromURIComponent: vector3ArrayFromURIComponent,
  eulerArrayFromURIComponent: eulerArrayFromURIComponent,
  objectToInt32Array: objectToInt32Array,
  int32ArrayToObject: int32ArrayToObject,
  dataUriToBuffer: dataUriToBuffer,
  removeEmptyValues: removeEmptyValues,
  imageToDataURI: imageToDataURI,
  getAttributeByPath: getAttributeByPath,
  objectEquals: objectEquals,
  objectOverWrite: objectOverWrite,
  objectParse: objectParse,
  objectParseNumeric: objectParseNumeric,
};
