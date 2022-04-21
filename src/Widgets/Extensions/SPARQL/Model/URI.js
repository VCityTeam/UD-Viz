/**
   * Tokenize a URI into a namespace and id
   * @param {string} uri
   * @returns {Object}
   */
export function tokenizeURI(uri) {
  let tokenizedURI = {};
  if (uri.includes('#')) {
    let uriTokens = uri.split('#');
    tokenizedURI.namespace = uriTokens[0] + '#';
    tokenizedURI.id = uriTokens[1];
  } else {
    let uriTokens = uri.split('/');
    tokenizedURI.id = uriTokens[uriTokens.length - 1];
    uriTokens[uriTokens.length - 1] = '';
    tokenizedURI.namespace = uriTokens.join('/');
  }
  return tokenizedURI;
}