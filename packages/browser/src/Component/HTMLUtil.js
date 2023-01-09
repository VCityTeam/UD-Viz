/**
 * Check if an html element belong to another one recursively
 *
 * @param {HTMLElement} child - html child
 * @param {HTMLElement} parent - html parent
 * @returns {boolean} - true if child belong to parent
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
