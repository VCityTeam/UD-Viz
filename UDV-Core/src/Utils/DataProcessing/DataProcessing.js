export function removeEmptyValues(formData) {
  let emptyKeys = [];
  formData.forEach((value, key) => {
    if (!value) {
      emptyKeys.push(key)
    }
  });
  emptyKeys.forEach((key) => {
    formData.delete(key);
  });
  return formData;
}

export function imageToBase64(arrayBuffer, mimeType) {
  // The response is a raw file, we need to convert it to base64
  // File -> Byte array -> String -> Base64 string
  let responseArray = new Uint8Array(arrayBuffer);

  // Make a string from the response array. As the array can be
  // too long (each value will be passed as an argument to
  // String.fromCharCode), we need to split it into chunks
  const chunkSize = 8 * 1024;
  let responseAsString = '';
  for (let i = 0; i < responseArray.length / chunkSize; i++) {
    responseAsString += String.fromCharCode.apply(null,
      responseArray.slice(i * chunkSize, (i + 1) * chunkSize));
  }

  let b64data = 'data:' + mimeType
              + ';base64,' + btoa(responseAsString);
  return b64data;
}
