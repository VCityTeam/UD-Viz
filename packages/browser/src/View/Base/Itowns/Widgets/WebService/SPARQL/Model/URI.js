/**
 * Tokenize a URI into a namespace and id
 *
 * @param {string} uri
 * @returns {object}
 */
export function tokenizeURI(uri) {
  const tokenizedURI = {};
  if (uri.includes('#')) {
    const uriTokens = uri.split('#');
    tokenizedURI.namespace = uriTokens[0] + '#';
    tokenizedURI.id = uriTokens[1];
  } else {
    const uriTokens = uri.split('/');
    tokenizedURI.id = uriTokens[uriTokens.length - 1];
    uriTokens[uriTokens.length - 1] = '';
    tokenizedURI.namespace = uriTokens.join('/');
  }
  return tokenizedURI;
}
