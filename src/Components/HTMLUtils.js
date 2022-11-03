/**
 * Check if an html element belong to another one recursively
 *
 * @param {HTMLElement} child the html child
 * @param {HTMLElement} parent the html parent
 * @returns {boolean}
 */
export function checkParentChild(child, parent) {
  let currentNode = child;
  let isChild = false;
  while (currentNode.parentNode) {
    if (currentNode == parent) {
      isChild = true;
      break;
    } else {
      currentNode = currentNode.parentNode;
    }
  }

  return isChild;
}
