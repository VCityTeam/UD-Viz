/**
 * Tokenize a URI into a namespace and localname
 *
 * @param {string} uri The URI to be tokenized
 * @returns {{namespace:string, localname:string}} object of the URI tokenized
 */
export function tokenizeURI(uri) {
  uri = String(uri);
  const tokenizedURI = {};
  if (uri.includes('#')) {
    const uriTokens = uri.split('#');
    tokenizedURI.namespace = uriTokens[0] + '#';
    tokenizedURI.localname = uriTokens[1];
  } else {
    const uriTokens = uri.split('/');
    tokenizedURI.localname = uriTokens[uriTokens.length - 1];
    uriTokens[uriTokens.length - 1] = '';
    tokenizedURI.namespace = uriTokens.join('/');
  }
  return tokenizedURI;
}
