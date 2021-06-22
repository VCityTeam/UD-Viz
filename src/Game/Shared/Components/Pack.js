/** @format */

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
});
