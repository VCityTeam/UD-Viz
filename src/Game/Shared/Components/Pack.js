/** @format */
module.exports = Object.freeze({
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
  unpack(array) {
    let str = String.fromCharCode.apply(this, array);
    return JSON.parse(str);
  },
});
