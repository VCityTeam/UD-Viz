/** @format */

const THREE = require('three');

// TODO these methods inside DataProcessing

/**
 * Handle serialization/deserialization of an Object
 * Used to pass data from a thread to another one for example
 * TODO opti make a custom serialization for each object and not a generic function
 */
module.exports = Object.freeze({
  //URI unpack
  vector3ArrayFromURIComponent(uriComp) {
    const subString = uriComp.split(',');
    if (subString.length != 3) console.warn('wrong uri component');
    return subString;
  },

  eulerArrayFromURIComponent(uriComp) {
    const subString = uriComp.split(',');
    if (subString.length != 4) console.warn('wrong uri component');
    return subString;
  },

  /**
   * Serialize data
   *
   * @param {object} obj the object to serialize
   * @returns {SharedArrayBuffer} serialized data
   */
  pack: function (obj) {
    const OString = JSON.stringify(obj);
    const SABuffer = new SharedArrayBuffer(
      Int32Array.BYTES_PER_ELEMENT * OString.length
    );
    const sArray = new Int32Array(SABuffer);

    for (let i = 0; i < OString.length; i++) {
      sArray[i] = OString.charCodeAt(i);
    }

    return sArray;
  },

  /**
   * Unserialize data
   *
   * @param {SharedArrayBuffer} array serialized data
   * @returns {JSON} object unserialized
   */
  unpack: function (array) {
    const str = String.fromCharCode.apply(this, array);
    return JSON.parse(str);
  },

  // WEBSOCKET SPLIT MESSAGE
  maxSize: 10000,
  bufferMessage: {},

  splitMessage: function (message) {
    let stringMessage = JSON.stringify(message);
    const messageUUID = THREE.MathUtils.generateUUID();
    const result = [];

    // Cut in several message
    while (stringMessage.length > this.maxSize) {
      const sliceMessage = stringMessage.slice(0, this.maxSize);
      stringMessage = stringMessage.slice(this.maxSize, stringMessage.length);
      result.push({ messageUUID: messageUUID, data: sliceMessage });
    }

    // Add what need
    if (stringMessage.length) {
      result.push({
        messageUUID: messageUUID,
        data: stringMessage,
      });
    }

    // Push info to recompose message
    for (let index = 0; index < result.length; index++) {
      const element = result[index];
      element.index = index;
      element.totalMessage = result.length;
    }

    return result;
  },

  recomposeMessage: function (partialMessage) {
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

      return JSON.parse(bufferString);
    }

    return null; // No complete message receive
  },

  dataUriToBuffer: function (uri) {
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
  },
});
