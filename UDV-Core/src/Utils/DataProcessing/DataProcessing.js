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