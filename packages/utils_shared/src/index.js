const EPSILON = 0.0001;

/**
 *
 * @param {number} x - x coor
 * @param {number} y - y coord
 * @param {number} angle - rotation angle in radian
 * @returns {{x:number, y:number}} - x y rotated by angle
 */
const rotate2DCoord = (x, y, angle) => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  return { x: x * cos - y * sin, y: y * cos + x * sin };
};

/**
 *
 * @param {Array<{x:number, y:number}>} points - points of your polygon not closed
 * @returns {number} the area of your polygon
 */
const polygon2DArea = (points) => {
  let area = 0;
  for (let i = 0; i < points.length; i += 2)
    area +=
      points[i + 1].x * (points[(i + 2) % points.length].y - points[i].y) +
      points[i + 1].y * (points[i].x - points[(i + 2) % points.length].x);
  area /= 2;
  return area;
};

/**
 * Limit the execution of a function every delay ms
 *
 * @param {Function} fn - function to be throttled
 * @param {number} delay - delay in ms
 * @returns {*} - return what the function should return every delay ms
 */
const throttle = (fn, delay) => {
  let lastCalled = 0;
  return (...args) => {
    const now = new Date().getTime();
    if (now - lastCalled < delay) {
      return;
    }
    lastCalled = now;
    return fn(...args);
  };
};

/**
 * Check if a string is a valid number
 * inspired of https://stackoverflow.com/questions/175739/built-in-way-in-javascript-to-check-if-a-string-is-a-valid-number
 *
 * @param {string} str - string to check
 * @returns {boolean} true if it's a valid number
 */
function isNumeric(str) {
  if (str === 0) return true;
  if (str instanceof Object) return false;
  if (typeof str == 'boolean') return false;

  return (
    !isNaN(str) && // Use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
}

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
    if (!isNumeric(element)) {
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
  if (!isNumeric(subString[0])) return false;
  if (!isNumeric(subString[1])) return false;
  if (!isNumeric(subString[2])) return false;

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
 * Take an array of string and check if it is in matrix4 format
 *
 * @param {Array<string>} subString - array of string
 * @returns {boolean} - true if it is matrix4 format
 */
function checkIfSubStringIsMatrix4(subString) {
  if (subString.length != 16) {
    // Need 16 string
    return false;
  }

  for (let index = 0; index < subString.length; index++) {
    const element = subString[index];
    if (!isNumeric(element)) {
      // All string should be numerics
      return false;
    }
  }

  return true;
}

/**
 * Taking a string from the unpacking URI and splitting it into an array of strings.
 *
 * @param {string} uriComp - The string from the unpacking URI
 * @returns {Array<string>} - returns the array of strings if it is in matrix4 format, otherwise returns null
 */
function matrix4ArrayFromURIComponent(uriComp) {
  const subString = uriComp.split(',');

  if (checkIfSubStringIsMatrix4(subString)) {
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
 * @param {object}  json1 - first json object
 * @param {object} json2 - second json object
 * @returns {boolean} - true if both json are equals, false otherwise
 */
function objectEquals(json1, json2) {
  for (const key in json1) {
    if (json1[key] instanceof Object) {
      if (json2[key] instanceof Object) {
        if (objectEquals(json1[key], json2[key])) {
          continue;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      const areEquals = isNumeric(json1[key])
        ? Math.abs(json1[key] - json2[key]) < EPSILON
        : json2[key] == json1[key];
      if (areEquals) {
        continue;
      } else {
        return false;
      }
    }
  }
  return true; // All check have passed meaning is equals
}

/**
 * Overwrite identical key of jsonOverWrited with the one matching in jsonModel
 * Create key of jsonModel which are not in jsonOverWrited
 *
 * @param {object} jsonOverWrited - json object overwrited
 * @param {object} jsonModel - json object used as model to overwrite
 * @returns {object} - json object overwrited
 */
function objectOverWrite(jsonOverWrited, jsonModel) {
  if (!jsonModel) return jsonOverWrited;

  // write the ones not in jsonOverWrited
  for (const key in jsonModel) {
    if (jsonOverWrited[key] == undefined) {
      jsonOverWrited[key] = jsonModel[key];
    }
  }

  // check in jsonOverWrited the ones existing in jsonModel
  for (const key in jsonOverWrited) {
    if (jsonOverWrited[key] instanceof Array) {
      if (jsonModel[key] instanceof Array) {
        jsonOverWrited[key] = jsonModel[key]; // array are replaced
      }
    } else if (jsonOverWrited[key] instanceof Object) {
      if (jsonModel[key] instanceof Object)
        objectOverWrite(jsonOverWrited[key], jsonModel[key]);
    } else {
      if (jsonModel[key] != undefined) {
        jsonOverWrited[key] = jsonModel[key];
      }
    }
  }

  return jsonOverWrited;
}

/**
 * Apply a callback to each key value couple of an object
 *
 * @param {object} object - object to parse
 * @param {Function} cb - callback to apply (first argument is the object containing the key and second is the key)
 * @returns {object} - object parsed
 */
function objectParse(object, cb) {
  for (const key in object) {
    if (object[key] instanceof Object) {
      objectParse(object[key], cb);
    } else {
      cb(object, key);
    }
  }
  return object;
}

/**
 * Replace all valid number string in a json object by a float
 *
 * @param {object} json - json object to parse
 * @returns {object} - json object parsed
 */
function objectParseNumeric(json) {
  return objectParse(json, function (j, key) {
    if (isNumeric(j[key])) {
      j[key] = parseFloat(j[key]);
    }
  });
}

/**
 * Check if both array are equals
 *
 * @param {Array} a1 - array 1
 * @param {Array} a2 - array 2
 * @returns {boolean} - true if equals
 */
function arrayEquals(a1, a2) {
  if (a1.length !== a2.length) return false;
  for (let i = 0; i < a1.length; i++) {
    if (a1[i] !== a2[i]) return false;
  }
  return true;
}

/**
 * Compute the last string after the . in the filename
 *
 * @param {string} filename - file name
 * @returns {string} - file format
 */
function computeFileFormat(filename) {
  const indexLastPoint = filename.lastIndexOf('.');
  return filename.slice(indexLastPoint + 1);
}

/**
 * Compute filename from path
 *
 * @param {string} path - path
 * @returns {string} filename
 */
function computeFilenameFromPath(path) {
  const indexLastSlash = path.lastIndexOf('/');
  return path.slice(indexLastSlash + 1);
}

/**
 * Check if the element is alreeady included in the array if not push it
 *
 * @param {Array} array - array where to push the element
 * @param {*} element - element to push
 * @returns {boolean} true if pushed false otherwise
 */
function arrayPushOnce(array, element) {
  if (!array.includes(element)) {
    array.push(element);
    return true;
  }
  return false;
}

/**
 * Remove an element if it's present in an array
 *
 * @param {Array} array - array to remove element from
 * @param {*} element - element to remove
 * @returns {boolean} true if removed false otherwise
 */
function removeFromArray(array, element) {
  const index = array.indexOf(element);
  if (index >= 0) {
    array.splice(index, 1);
    return true;
  }

  return false;
}

/**
 *
 * @param {string} originalString - string to modify
 * @param {number} index - where to insert
 * @param {string} string to insert
 * @returns {string} - string injected
 */
const insert = (originalString, index, string) => {
  if (index > 0) {
    return (
      originalString.substring(0, index) +
      string +
      originalString.substring(index, originalString.length)
    );
  }

  return string + originalString;
};

/**
 *
 * @param {number} number - number to round
 * @returns {string} rounded number
 */
const round = (number) => {
  const x = Math.round(number * 10) + '';
  return insert(x, x.length - 1, ',');
};

/**
 *
 * @param {{x:number,y:number,z:number}} v - vector 3 to labelize
 * @returns {string} vector labelified
 */
const vector3ToLabel = (v) => {
  return round(v.x) + ' m; ' + round(v.y) + ' m; ' + round(v.z) + ' m;';
};

module.exports = {
  EPSILON: EPSILON,
  throttle: throttle,
  vector3ToLabel: vector3ToLabel,
  round: round,
  insert: insert,
  isNumeric: isNumeric,
  arrayEquals: arrayEquals,
  checkIfSubStringIsEuler: checkIfSubStringIsEuler,
  checkIfSubStringIsVector3: checkIfSubStringIsVector3,
  checkIfSubStringIsMatrix4: checkIfSubStringIsMatrix4,
  vector3ArrayFromURIComponent: vector3ArrayFromURIComponent,
  eulerArrayFromURIComponent: eulerArrayFromURIComponent,
  matrix4ArrayFromURIComponent: matrix4ArrayFromURIComponent,
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
  computeFileFormat: computeFileFormat,
  computeFilenameFromPath: computeFilenameFromPath,
  arrayPushOnce: arrayPushOnce,
  removeFromArray: removeFromArray,
  rotate2DCoord: rotate2DCoord,
  polygon2DArea: polygon2DArea,
  ProcessInterval: require('./ProcessInterval'),
};
