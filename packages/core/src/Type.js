module.exports = {
  // https://stackoverflow.com/questions/175739/built-in-way-in-javascript-to-check-if-a-string-is-a-valid-number
  isNumeric: function (str) {
    if (str === 0) return true;
    if (str instanceof Object) return false;
    if (typeof str == 'boolean') return false;

    return (
      !isNaN(str) && // Use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
      !isNaN(parseFloat(str))
    ); // ...and ensure strings of whitespace fail
  },
};
