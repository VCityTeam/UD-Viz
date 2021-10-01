/** @format */

const THREE = require('three');

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
});
