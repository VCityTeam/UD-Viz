const THREE = require('three');
const Type = require('./Type');

class PartialMessage {
  constructor(messageUUID, data) {
    this.messageUUID = messageUUID;
    this.data = data;
    this.index = -1;
    this.totalMessage = -1;
  }

  setIndex(index) {
    this.index = index;
  }

  setTotalMessage(value) {
    this.totalMessage = value;
  }
}

class MessageComposer {
  constructor() {
    this.bufferMessage = {};
  }

  /**
   *
   * @param {PartialMessage} partialMessage
   * @returns
   */
  recomposeMessage(partialMessage) {
    const messageUUID = partialMessage.messageUUID;
    if (!this.bufferMessage[messageUUID]) {
      // First partial message
      this.bufferMessage[messageUUID] = {};
    }

    // Record
    this.bufferMessage[messageUUID][partialMessage.index] = partialMessage;

    // Check if all the partial message are here
    if (
      Object.keys(this.bufferMessage[messageUUID]).length ==
      partialMessage.totalMessage
    ) {
      // Can recompose message
      let bufferString = '';
      for (let index = 0; index < partialMessage.totalMessage; index++) {
        bufferString += this.bufferMessage[messageUUID][index].data;
      }

      // clean buffer
      delete this.bufferMessage[messageUUID];

      return JSON.parse(bufferString);
    }

    return null; // No complete message receive
  }
}

MessageComposer.MAX_MESSAGE_SIZE = 10000;

/**
 *
 * @param {string} message
 * @returns {PartialMessage[]}
 */
MessageComposer.splitMessage = function (message) {
  let stringMessage = JSON.stringify(message);
  const messageUUID = THREE.MathUtils.generateUUID();
  const result = [];

  // Cut in several message
  while (stringMessage.length > MessageComposer.MAX_MESSAGE_SIZE) {
    const sliceMessage = stringMessage.slice(
      0,
      MessageComposer.MAX_MESSAGE_SIZE
    );
    stringMessage = stringMessage.slice(
      MessageComposer.MAX_MESSAGE_SIZE,
      stringMessage.length
    );
    result.push(new PartialMessage(messageUUID, sliceMessage));
  }

  // Add what need
  if (stringMessage.length) {
    result.push(new PartialMessage(messageUUID, stringMessage));
  }

  // Push info to recompose message
  for (let index = 0; index < result.length; index++) {
    const partialMessage = result[index];
    partialMessage.setIndex(index);
    partialMessage.setTotalMessage(result.length);
  }

  return result;
};

/**
 * Take an array of string and check if it is in vector3 format
 *
 * @param {Array<string>} subString array of string
 * @returns {boolean} true if it is vector3 format
 */
function checkIfSubStringIsVector3(subString) {
  if (subString.length != 3) {
    // Need three component
    return false;
  }

  for (let index = 0; index < subString.length; index++) {
    const element = subString[index];
    if (!Type.isNumeric(element)) {
      // All component should be numerics
      return false;
    }
  }

  return true;
}

/**
 * Take an array of string and check if it is in euler format
 *
 * @param {Array<string>} subString array of string
 * @returns {boolean} true if it is euler format
 */
function checkIfSubStringIsEuler(subString) {
  if (subString.length != 4) {
    // Need four components
    return false;
  }

  // Three first components have to be numerics
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
 * @param {string} uriComp  The string from the unpacking URI
 * @returns {Array<string>} returns the array of strings if it is in vector3 format, otherwise returns null
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
 * @param {string} uriComp The string from the unpacking URI
 * @returns {Array<string>} returns the array of strings if it is in euler format, otherwise returns null
 */
function eulerArrayFromURIComponent(uriComp) {
  const subString = uriComp.split(',');

  if (checkIfSubStringIsEuler(subString)) {
    return subString;
  }
  return null;
}

/**
 * Serialize data
 *
 * @param {object} obj the object to serialize
 * @returns {SharedArrayBuffer} serialized data
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
 * Unserialize data
 *
 * @param {SharedArrayBuffer} array serialized data
 * @returns {JSON} object unserialized
 */
function int32ArrayToObject(array) {
  const str = String.fromCharCode.apply(this, array);
  return JSON.parse(str);
}

/**
 *
 * @param {*} uri
 * @returns
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
 * @format
 * @param {FormData} formData The form data.
 * @returns The same data, without the fields containing an empty value.
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
 *
 * @param {object} obj
 * @param {string} path
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
 * Checks the equality of two objects by their properties. For two objects to
 * be equal, they must have the same keys and the same values.
 *
 * @param {any} a An object.
 * @param {any} b An object.
 */
function objectEquals(a, b) {
  // Set of a's keys
  const keys = new Set(Object.keys(a));
  for (const key of Object.keys(b)) {
    if (!keys.has(key)) {
      // If b has a key unknown to a, they aren't equal
      return false;
    }
  }
  for (const key of keys) {
    // For each key of a, b must also have the key and the values must be equal
    if (b[key] === undefined || a[key] !== b[key]) {
      return false;
    }
  }
  return true;
}

module.exports = {
  PartialMessage: PartialMessage,
  MessageComposer: MessageComposer,
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
};
