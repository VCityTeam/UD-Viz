/**
 * Tokenize a URI into a namespace and id
 *
 * @param {string} uri The URI to be tokenized
 * @returns {{namespace:string, id:number}} object of the URI tokenized
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
