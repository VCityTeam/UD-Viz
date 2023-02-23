/**
 * Tokenize a URI into a namespace and localname
 * A uri is typically composed of a [namespace]#[localname]
 * e.g. http://site.io/test#example_1
 * here the namespace is 'http://site.io/test#' and the localname is 'example_1'
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

/**
 * Return the localname of a URI
 *
 * @param {string} uri The URI
 * @returns {string} the localname of the URI
 */
export function getUriLocalname(uri) {
  const uriTokens = tokenizeURI(uri);
  return uriTokens.localname;
}

/**
 * Return the namespace of a URI
 *
 * @param {string} uri The URI
 * @returns {string} the namespace of the URI
 */
export function getUriNamespace(uri) {
  const uriTokens = tokenizeURI(uri);
  return uriTokens.namespace;
}
