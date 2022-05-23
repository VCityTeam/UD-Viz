/** @format */

const THREE = require('three');

//TODO these methods inside DataProcessing

/**
 * Handle serialization/deserialization of an Object
 * Used to pass data from a thread to another one for example
 * TODO opti make a custom serialization for each object and not a generic function
 */
module.exports = Object.freeze({
  /**
   * Serialize data
   * @param {Object} obj the object to serialize
   * @returns {SharedArrayBuffer} serialized data
   */
  pack(obj) {
    let OString = JSON.stringify(obj);
    let SABuffer = new SharedArrayBuffer(
      Int32Array.BYTES_PER_ELEMENT * OString.length
    );
    let sArray = new Int32Array(SABuffer);

    for (let i = 0; i < OString.length; i++) {
      sArray[i] = OString.charCodeAt(i);
    }

    return sArray;
  },

  /**
   * Unserialize data
   * @param {SharedArrayBuffer} array serialized data
   * @returns {JSON} object unserialized
   */
  unpack(array) {
    let str = String.fromCharCode.apply(this, array);
    return JSON.parse(str);
  },

  //WEBSOCKET SPLIT MESSAGE
  maxSize: 10000,
  bufferMessage: {},

  splitMessage(message) {
    let stringMessage = JSON.stringify(message);
    const messageUUID = THREE.MathUtils.generateUUID();
    const result = [];

    //cut in several message
    while (stringMessage.length > this.maxSize) {
      const sliceMessage = stringMessage.slice(0, this.maxSize);
      stringMessage = stringMessage.slice(this.maxSize, stringMessage.length);
      result.push({ messageUUID: messageUUID, data: sliceMessage });
    }

    //add what need
    if (stringMessage.length) {
      result.push({
        messageUUID: messageUUID,
        data: stringMessage,
      });
    }

    //push info to recompose message
    for (let index = 0; index < result.length; index++) {
      const element = result[index];
      element.index = index;
      element.totalMessage = result.length;
    }

    return result;
  },

  recomposeMessage(partialMessage) {
    const messageUUID = partialMessage.messageUUID;
    if (!this.bufferMessage[messageUUID]) {
      //first partial message
      this.bufferMessage[messageUUID] = {};
    }

    //record
    this.bufferMessage[messageUUID][partialMessage.index] = partialMessage;

    //check if all the partial message are here
    if (
      Object.keys(this.bufferMessage[messageUUID]).length ==
      partialMessage.totalMessage
    ) {
      //can recompose message
      let bufferString = '';
      for (let index = 0; index < partialMessage.totalMessage; index++) {
        bufferString += this.bufferMessage[messageUUID][index].data;
      }

      return JSON.parse(bufferString);
    } else {
      //no complete message receive
      return null;
    }
  },

  dataUriToBuffer(uri) {
    if (!/^data:/i.test(uri)) {
      return null; //its not a Data URI
    }
    // strip newlines
    uri = uri.replace(/\r?\n/g, '');
    // split the URI up into the "metadata" and the "data" portions
    const firstComma = uri.indexOf(',');
    if (firstComma === -1 || firstComma <= 4) {
      throw new TypeError('malformed data: URI');
    }
    // remove the "data:" scheme and parse the metadata
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
    // defaults to US-ASCII only if type is not provided
    if (!meta[0] && !charset.length) {
      typeFull += ';charset=US-ASCII';
      charset = 'US-ASCII';
    }
    // get the encoded data portion and decode URI-encoded chars
    const encoding = base64 ? 'base64' : 'ascii';
    const data = unescape(uri.substring(firstComma + 1));
    const buffer = Buffer.from(data, encoding);
    // set `.type` and `.typeFull` properties to MIME type
    buffer.type = type;
    buffer.typeFull = typeFull;
    // set the `.charset` property
    buffer.charset = charset;
    return buffer;
  },
});
